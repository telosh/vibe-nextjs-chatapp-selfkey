"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip } from "react-icons/fi";

type MessageInputProps = {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
};

export default function MessageInput({
  onSendMessage,
  isLoading,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // テキストエリアの高さを自動調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // フォーム送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  // Enterキーで送信 (Shift+Enterで改行)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end">
      <div className="relative flex-1 mr-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
          className="w-full p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-40 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="button"
          className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="ファイルを添付"
        >
          <FiPaperclip size={18} />
        </button>
      </div>
      <button
        type="submit"
        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        disabled={!message.trim() || isLoading}
      >
        <FiSend size={18} />
      </button>
    </form>
  );
} 