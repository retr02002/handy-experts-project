import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import type { PrismaClient } from "@prisma/client";
import { consumeOtp } from "@/actions/otp.actions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as unknown as PrismaClient),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      // id defaults to "credentials" (kept as-is — every existing caller
      // already targets this id). Only the field name changed: "identifier"
      // accepts either an email or a technician's username.
      name: "credentials",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = credentials.identifier.includes("@")
          ? await prisma.user.findUnique({ where: { email: credentials.identifier } })
          : await prisma.user.findUnique({ where: { username: credentials.identifier } });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      }
    }),
    CredentialsProvider({
      id: "otp-customer",
      name: "Customer OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          throw new Error("Invalid code");
        }

        const result = await consumeOtp({ phone: credentials.phone, purpose: "CUSTOMER_LOGIN", code: credentials.code });
        if (!result.ok) throw new Error(result.error);

        const existing = await prisma.user.findUnique({ where: { phone: credentials.phone } });
        if (existing) return existing;

        return prisma.user.create({ data: { phone: credentials.phone, role: "PENDING" } });
      },
    }),
    CredentialsProvider({
      id: "otp-technician",
      name: "Technician OTP",
      credentials: {
        username: { label: "Username", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.code) {
          throw new Error("Invalid code");
        }

        const technician = await prisma.user.findFirst({
          where: { username: credentials.username, role: "TECHNICIAN" },
        });
        if (!technician?.phone) {
          throw new Error("No technician account found for that username");
        }

        const result = await consumeOtp({ phone: technician.phone, purpose: "TECHNICIAN_LOGIN", code: credentials.code });
        if (!result.ok) throw new Error(result.error);

        return technician;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // The JWT is only re-derived from `user` at sign-in, so a role/name
      // change mid-session (e.g. completing onboarding) needs an explicit
      // refresh — triggered client-side via useSession().update().
      if (trigger === "update" && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, name: true },
        });
        if (freshUser) {
          token.role = freshUser.role;
          token.name = freshUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.name = token.name as string | null;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_12345",
};
