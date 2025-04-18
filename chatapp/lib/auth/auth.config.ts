import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/db";
import { z } from "zod";

export const authConfig: AuthOptions = {
  // @ts-expect-error - @auth/prisma-adapterとnext-authの型の互換性問題
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        // ここでユーザー認証ロジックを実装
        // 実際のプロジェクトではパスワードのハッシュ化と検証が必要
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        // ユーザーが存在するなら認証成功とする
        // 注：実際の実装ではbcryptなどでパスワードハッシュを比較する必要があります
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.imageUrl,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // authorized コールバックを削除し、middlewareで処理
    async jwt(params) {
      const { token, user } = params;
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session(params) {
      const { session, token } = params;
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
}; 