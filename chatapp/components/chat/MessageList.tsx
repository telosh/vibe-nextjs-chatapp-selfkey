"use client";

import { useEffect, useRef } from "react";
import { Message } from "@prisma/client";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

// Markedの設定
marked.setOptions({
  breaks: true,
  gfm: true,
});

// シンタックスハイライト設定
marked.use({
  renderer: {
    code(code: string, language: string | undefined): string {
      const lang = language || '';
      try {
        if (lang && hljs.getLanguage(lang)) {
          return `<pre><code class="hljs language-${lang}">${
            hljs.highlight(code, { language: lang }).value
          }</code></pre>`;
        }
        return `<pre><code class="hljs">${
          hljs.highlightAuto(code).value
        }</code></pre>`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        return `<pre><code class="hljs">${code}</code></pre>`;
      }
    }
  }
});

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
};

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたら自動的に一番下にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // マークダウンをHTMLに変換
  const renderMarkdown = (content: string) => {
    return { __html: marked(content) };
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      <div className="flex-1 flex flex-col space-y-4">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>会話を開始するためにメッセージを送信してください。</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-3xl p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600"
              }`}
            >
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={renderMarkdown(message.content)}
              />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-3xl p-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mt-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mt-2"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 