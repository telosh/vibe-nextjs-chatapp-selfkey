"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { FiUser, FiMessageSquare, FiCpu } from "react-icons/fi";

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
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* プロフィール設定 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiUser className="text-blue-600 mr-2" size={20} />
            <h2 className="text-xl font-semibold">プロフィール</h2>
          </div>
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
        
        {/* プロンプトテンプレート設定 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiCpu className="text-blue-600 mr-2" size={20} />
            <h2 className="text-xl font-semibold">プロンプトテンプレート</h2>
          </div>
          <p className="text-gray-600 mb-4">AIとの会話に使用するテンプレートを管理します。</p>
          <Link 
            href="/settings/prompt-templates"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            テンプレートを管理する
          </Link>
        </div>
        
        {/* チャット履歴設定 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FiMessageSquare className="text-blue-600 mr-2" size={20} />
            <h2 className="text-xl font-semibold">チャット履歴</h2>
          </div>
          <p className="text-gray-600 mb-4">過去の会話履歴を管理します。</p>
          <Link 
            href="/chat"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            チャット履歴を確認する
          </Link>
        </div>
      </div>
    </div>
  );
} 