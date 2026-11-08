// Auth.js setup: email + password login, sessions stored in a signed cookie (JWT).
// Every request re-checks the database so deleted users or reset passwords end old sessions.
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

class InvalidLogin extends CredentialsSignin {
  code = "invalid_credentials";
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) throw new InvalidLogin();
        const user = await db.query.users.findFirst({ where: eq(schema.users.email, parsed.data.email) });
        // Compare even when the user is missing, so response time doesn't reveal which emails exist.
        const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
        if (!user || !ok || user.deletedAt) throw new InvalidLogin();
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userId = (user?.id ?? token.sub) as string | undefined;
      if (!userId) return null;
      const row = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
        columns: { id: true, role: true, sessionVersion: true, deletedAt: true, name: true },
      });
      if (!row || row.deletedAt) return null;
      if (user) token.sv = row.sessionVersion; // fresh login: remember current version
      if (token.sv !== row.sessionVersion) return null; // password was reset → log out
      token.sub = row.id;
      token.role = row.role;
      token.name = row.name;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as "user" | "admin";
      return session;
    },
  },
});
