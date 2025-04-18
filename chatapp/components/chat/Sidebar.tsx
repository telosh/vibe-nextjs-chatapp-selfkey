"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiPlus, FiSettings, FiLogOut } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type ChatSession = {
  id: string;
  title: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // チャットセッションを取得
  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        // データベースからの取得は本来サーバーコンポーネントで行うべきだが
        // ここでは簡易的に実装
        const response = await fetch("/api/chat");
        if (response.ok) {
          const data = await response.json();
          setChatSessions(data);
        }
      } catch (error) {
        console.error("チャットセッションの取得に失敗しました", error);
      }
    };

    fetchChatSessions();
  }, []);

  // 新しいチャットを作成
  const handleNewChat = async () => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const newChat = await response.json();
        router.push(`/chat/${newChat.id}`);
      }
    } catch (error) {
      console.error("新しいチャットの作成に失敗しました", error);
    }
  };

  return (
    <div className="bg-gray-900 text-white w-64 flex flex-col h-full">
      <div className="p-4">
        <button
          onClick={handleNewChat}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 w-full flex items-center justify-center gap-2"
        >
          <FiPlus size={16} />
          <span>新しいチャット</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="text-xs font-semibold text-gray-400 mb-2 px-2">
          最近のチャット
        </h2>
        <ul className="space-y-1">
          {chatSessions.map((chat) => (
            <li key={chat.id}>
              <Link
                href={`/chat/${chat.id}`}
                className={cn(
                  "block px-3 py-2 rounded-md hover:bg-gray-800 transition-colors",
                  pathname === `/chat/${chat.id}` && "bg-gray-800"
                )}
              >
                {chat.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-800">
        <ul className="space-y-2">
          <li>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <FiSettings size={16} />
              <span>設定</span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors text-red-400 w-full text-left"
            >
              <FiLogOut size={16} />
              <span>ログアウト</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
} 