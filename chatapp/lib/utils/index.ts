import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// tailwindとclsxを組み合わせたユーティリティ関数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 日付をフォーマットする関数
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// 文字列を省略する関数
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// UUIDを生成する関数
export function generateId(): string {
  return crypto.randomUUID();
} 