"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">設定</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">プロフィール</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">名前</label>
            <p className="mt-1">{session.user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <p className="mt-1">{session.user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 