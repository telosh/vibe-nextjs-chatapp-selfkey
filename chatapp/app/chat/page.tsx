"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

export default function ChatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 認証状態に応じた処理
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      redirectToLatestChat();
    }
  }, [status, session]);

  // 最新のチャットへリダイレクトするか、新しいチャットを作成
  const redirectToLatestChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 最新のチャットセッションを取得
      const response = await fetch("/api/chat");
      const data = await response.json();

      if (data && data.length > 0) {
        // 最新のチャットにリダイレクト
        router.push(`/chat/${data[0].id}`);
      } else {
        // 新しいチャットを作成
        const createResponse = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!createResponse.ok) {
          throw new Error("チャットの作成に失敗しました");
        }

        const newChat = await createResponse.json();
        router.push(`/chat/${newChat.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsLoading(false);
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500">
          <p>エラー: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  // 通常はここに到達しないはずだが、念のため
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 