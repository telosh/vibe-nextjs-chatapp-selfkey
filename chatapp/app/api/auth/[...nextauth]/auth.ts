import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

// NodeJSランタイムを使用
export const runtime = 'nodejs';

// 新しいNext Auth APIの形式に対応
const auth = NextAuth(authConfig).auth;

// auth関数をデフォルトエクスポート
export default auth;

// アプリケーション内で使用する際の便利な方法
export { auth }; 