"use client";

import { useState } from "react";
import { Message, ChatSession } from "@prisma/client";
import { AIModel } from "@/lib/ai/models";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ModelSelector from "./ModelSelector";

type ChatInterfaceProps = {
  chatSession: ChatSession & { messages: Message[] };
  model?: AIModel;
};

export default function ChatInterface({
  chatSession,
  model,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(chatSession.messages);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<AIModel | undefined>(model);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);

      // ユーザーメッセージをUIに追加
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        chatSessionId: chatSession.id,
        role: "user",
        content,
        createdAt: new Date(),
        tokensUsed: null,
        metadata: null,
      };

      setMessages((prev) => [...prev, userMessage]);

      // APIにメッセージを送信
      const response = await fetch(`/api/chat/${chatSession.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          model: currentModel?.id || chatSession.model,
        }),
      });

      if (!response.ok) {
        throw new Error("メッセージの送信に失敗しました");
      }

      const data = await response.json();
      
      // レスポンスをUIに反映
      setMessages(data.messages);
    } catch (error) {
      console.error("Error sending message:", error);
      // エラー処理
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = async (modelId: string) => {
    try {
      // モデル変更をAPIに送信
      const response = await fetch(`/api/chat/${chatSession.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
        }),
      });

      if (!response.ok) {
        throw new Error("モデルの変更に失敗しました");
      }

      // 成功した場合、ローカルの状態を更新
      await response.json();
      setCurrentModel((prev) => ({
        ...prev!,
        id: modelId,
      }));
    } catch (error) {
      console.error("Error changing model:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 flex justify-between items-center">
        <h1 className="text-xl font-bold">{chatSession.title}</h1>
        <ModelSelector
          currentModel={currentModel}
          onModelChange={handleModelChange}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
} 