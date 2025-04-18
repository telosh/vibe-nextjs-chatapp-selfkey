"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  // クライアントサイドで認証状態をチェック
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/chat");
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status, router]);

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AIチャットアプリ</h1>
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
            >
              登録
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50 dark:bg-gray-800">
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">最先端のAIと会話しよう</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              複数のAIモデルに対応したチャットアプリケーションで、自然な会話を楽しめます。
              あなたの質問、課題、アイデアをAIと共有してみましょう。
            </p>
            <Link
              href="/register"
              className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-lg font-medium transition-colors"
            >
              今すぐ始める
            </Link>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">主な機能</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">複数のAIモデル</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  OpenAI、Anthropic、Googleなどの複数のAIプロバイダーに対応。
                  用途に応じて最適なモデルを選択できます。
                </p>
              </div>
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">チャット履歴の保存</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  すべての会話が自動的に保存され、いつでも過去の会話を参照できます。
                  重要な情報を見逃すことはありません。
                </p>
              </div>
              <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">マークダウン対応</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  コードブロック、リスト、表などのマークダウン記法に対応。
                  読みやすく構造化された回答を得られます。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center">© 2024 AIチャットアプリ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
