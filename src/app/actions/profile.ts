"use server";
// Profile preferences.
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { isCity } from "@/lib/cities";
import { requireUser } from "@/lib/session";

/** 53: save the chosen city and go back to the filters (08). */
export async function setCityAction(form: FormData) {
  const user = await requireUser();
  const city = form.get("city");
  if (!isCity(city)) redirect("/location");
  await db.update(schema.users).set({ city }).where(eq(schema.users.id, user.id));
  redirect(`/discover/filters?city=${city}`);
}
