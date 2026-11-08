// Invite link (54 "ბმულის გაზიარება"): remembers the code for 7 days, then opens sign-up.
// Signed-in visitors just go home — an invite only counts for a brand-new account.
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { INVITE_COOKIE, isInviteCode } from "@/lib/invites";

export async function GET(req: NextRequest, ctx: RouteContext<"/i/[code]">) {
  const { code } = await ctx.params;
  const session = await auth();
  if (session?.user) return NextResponse.redirect(new URL("/home", req.url));
  const res = NextResponse.redirect(new URL("/signup", req.url));
  const normalized = code.toUpperCase();
  if (isInviteCode(normalized)) {
    res.cookies.set(INVITE_COOKIE, normalized, { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax", httpOnly: true });
  }
  return res;
}
