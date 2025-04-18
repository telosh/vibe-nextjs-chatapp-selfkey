"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ChatInterface from "@/components/chat/ChatInterface";
import { ChatSession, Message } from "@prisma/client";

export default function ChatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [chatSession, setChatSession] = useState<ChatSession & { messages: Message[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 最新のチャットを取得する関数
  const fetchLatestChat = async () => {
    try {
      setError(null);
      const response = await fetch("/api/chat");
      if (!response.ok) {
        throw new Error("チャットセッションの取得に失敗しました");
      }
      
      const chats = await response.json();
      if (chats.length > 0) {
        const latestChat = chats[0];
        // チャットの詳細情報を取得
        const chatResponse = await fetch(`/api/chat/${latestChat.id}`);
        if (!chatResponse.ok) {
          throw new Error("チャットの詳細情報の取得に失敗しました");
        }
        
        const chatData = await chatResponse.json();
        setChatSession(chatData);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      setError(error instanceof Error ? error.message : "予期せぬエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated" && session?.user) {
      fetchLatestChat();
    }
  }, [status, session, router]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!chatSession) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">チャットを開始するには新しいチャットを作成してください。</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ChatInterface chatSession={chatSession} />
    </div>
  );
} 