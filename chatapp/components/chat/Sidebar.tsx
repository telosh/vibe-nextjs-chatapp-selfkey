"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiPlus, FiSettings, FiLogOut, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

type ChatSession = {
  id: string;
  title: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
        
        // チャットリストを更新
        setChatSessions(prev => [newChat, ...prev]);
      }
    } catch (error) {
      console.error("新しいチャットの作成に失敗しました", error);
    }
  };

  // タイトル編集を開始
  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
    // 次のレンダリングサイクルでフォーカスを設定
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // タイトル編集を保存
  const saveTitle = async (id: string) => {
    if (editTitle.trim() === "") return; // 空のタイトルは保存しない
    
    try {
      const response = await fetch(`/api/chat/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (response.ok) {
        // 成功したら状態を更新
        setChatSessions(prev =>
          prev.map(chat =>
            chat.id === id ? { ...chat, title: editTitle.trim() } : chat
          )
        );
        setEditingId(null);
      }
    } catch (error) {
      console.error("タイトル更新に失敗しました", error);
    }
  };

  // タイトル編集をキャンセル
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Enterキーで保存、Escapeキーでキャンセル
  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTitle(id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
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
            <li key={chat.id} className="group">
              {editingId === chat.id ? (
                <div className="flex items-center px-3 py-1 rounded-md bg-gray-800">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, chat.id)}
                    className="bg-gray-700 text-white rounded px-2 py-1 flex-1 mr-1"
                    maxLength={50}
                  />
                  <button
                    onClick={() => saveTitle(chat.id)}
                    className="p-1 text-green-400 hover:text-green-300"
                  >
                    <FiCheck size={14} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <Link
                    href={`/chat/${chat.id}`}
                    className={cn(
                      "block px-3 py-2 rounded-md hover:bg-gray-800 transition-colors flex-1",
                      pathname === `/chat/${chat.id}` && "bg-gray-800"
                    )}
                  >
                    {chat.title}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(chat.id, chat.title);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                    aria-label="タイトル編集"
                  >
                    <FiEdit2 size={14} />
                  </button>
                </div>
              )}
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