"use client";
// Camera QR scanner. The video sits inside the 154px Figma viewfinder; frames are decoded with jsQR
// (works in every modern browser, unlike the native BarcodeDetector). A decoded code is submitted
// to the server, which decides whether it is valid — the browser never knows the right codes.
import jsQR from "jsqr";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { checkinAction } from "@/app/actions/missions";
import { Button, Field } from "@/components/ui";

type Labels = Record<"ready" | "starting" | "denied" | "unsupported" | "found" | "scan" | "manual" | "codeLabel" | "codePlaceholder" | "check", string>;
type Status = "idle" | "starting" | "live" | "denied" | "unsupported" | "found";

export function QrScanner({ missionId, initialCode, labels }: { missionId: string; initialCode?: string; labels: Labels }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [manual, setManual] = useState(false);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const submit = (code: string) => {
    if (!codeRef.current || !formRef.current) return;
    codeRef.current.value = code;
    setStatus("found");
    stop();
    formRef.current.requestSubmit();
  };

  // Opened from a scanned link (/qr/CODE): submit straight away.
  useEffect(() => {
    if (initialCode) submit(initialCode);
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) return setStatus("unsupported");
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setStatus("live");
      scanLoop();
    } catch {
      setStatus("denied");
      setManual(true);
    }
  }

  function scanLoop() {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const tick = () => {
      if (!streamRef.current || !video || !ctx) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hit = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (hit?.data) return submit(hit.data);
      }
      setTimeout(() => requestAnimationFrame(tick), 200);
    };
    requestAnimationFrame(tick);
  }

  const caption = { idle: labels.ready, starting: labels.starting, live: labels.ready, denied: labels.denied, unsupported: labels.unsupported, found: labels.found }[status];

  return (
    <form ref={formRef} action={checkinAction} className="flex w-full flex-col gap-5">
      <input type="hidden" name="missionId" value={missionId} />

      <div className="relative h-[248px] w-full overflow-clip rounded-bf-16 bg-elevated">
        <div className="absolute left-1/2 top-8 size-[154px] -translate-x-1/2 overflow-clip rounded-bf-16 border border-line bg-surface">
          <video ref={videoRef} muted playsInline className={`size-full object-cover ${status === "live" ? "" : "hidden"}`} />
          {status !== "live" && <Image src="/figma/qr-viewfinder-icon-94.svg" alt="" width={94} height={94} className="absolute left-[29px] top-[29px] size-[94px]" />}
        </div>
        <p className="absolute inset-x-4 top-[204px] text-center text-caption text-white" role="status">
          {caption}
        </p>
      </div>

      {manual ? (
        <>
          <Field ref={codeRef} label={labels.codeLabel} name="code" placeholder={labels.codePlaceholder} autoComplete="off" autoCapitalize="characters" required />
          <Button type="submit">{labels.check}</Button>
        </>
      ) : (
        <>
          <input ref={codeRef} type="hidden" name="code" />
          <Button type="button" onClick={start} disabled={status === "starting" || status === "live" || status === "found"}>
            {labels.scan}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              stop();
              setStatus("idle");
              setManual(true);
            }}
          >
            {labels.manual}
          </Button>
        </>
      )}
    </form>
  );
}
