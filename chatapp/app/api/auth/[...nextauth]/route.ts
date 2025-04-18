import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

// NodeJSランタイムを使用
export const runtime = 'nodejs';

// Auth.jsの新しいAPIルート対応
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

// auth関数を別ファイルにエクスポートする
// auth関数は別のファイルで import { auth } from "@/app/api/auth/[...nextauth]/auth"; のように使用 