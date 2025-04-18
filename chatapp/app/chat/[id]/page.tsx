"use client";

import { notFound, useRouter } from "next/navigation";
import ChatInterface from "@/components/chat/ChatInterface";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { use } from "react";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  // React.useでparamsを解決
  const resolvedParams = use(params);
  const chatId = resolvedParams.id;
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const [chatSession, setChatSession] = useState<any>(null);
  const [model, setModel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 認証状態に応じた処理
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated" && session?.user) {
      fetchChatData();
    }
  }, [status, session, chatId]);

  // チャットデータの取得
  const fetchChatData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // チャットセッションを取得
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error("チャットの取得に失敗しました");
      }
      
      const data = await response.json();
      setChatSession(data);
      
      // モデル情報を設定
      // 注: 実際の実装ではgetModelByIdに相当するクライアント側の関数が必要
      const modelResponse = await fetch(`/api/models?id=${data.model}`);
      if (modelResponse.ok) {
        const modelData = await modelResponse.json();
        setModel(modelData);
      } else {
        // モデル情報が取得できなかった場合はデフォルト値を使用
        setModel({
          id: data.model,
          name: data.model,
          provider: "unknown",
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsLoading(false);
      console.error("Error fetching chat data:", err);
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">
          <p>エラー: {error}</p>
          <button 
            onClick={() => router.push("/chat")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            チャットリストに戻る
          </button>
        </div>
      </div>
    );
  }

  // チャットが見つからない場合
  if (!chatSession) {
    return notFound();
  }

  return (
    <div className="h-full">
      <ChatInterface chatSession={chatSession} model={model} />
    </div>
  );
} 