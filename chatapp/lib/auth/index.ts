// アプリケーション全体で使用する認証関連の機能をエクスポート
export { default as auth } from "@/app/api/auth/[...nextauth]/auth";
export { authConfig } from "./auth.config"; 