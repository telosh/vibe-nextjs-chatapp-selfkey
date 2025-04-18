import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * クライアントコンポーネントで使用できない認証チェック用の関数
 * サーバーコンポーネントでルートガードとして使用
 */
export async function requireAuth() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * ユーザーがログイン済みの場合にリダイレクトする関数
 * ログインページなど、未認証ユーザーのみがアクセスするページで使用
 */
export async function redirectIfAuthenticated(redirectTo = "/chat") {
  const session = await auth();

  if (session) {
    redirect(redirectTo);
  }
} 