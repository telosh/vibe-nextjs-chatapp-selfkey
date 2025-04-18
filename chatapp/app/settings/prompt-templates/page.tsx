"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import Link from "next/link";

type PromptTemplate = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function PromptTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [includePublic, setIncludePublic] = useState(true);

  // 認証確認
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // テンプレート取得
  useEffect(() => {
    if (status === "authenticated") {
      fetchTemplates();
    }
  }, [status, includePublic]);

  // テンプレート一覧取得
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompt-templates?includePublic=${includePublic}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("テンプレートの取得に失敗しました", error);
    } finally {
      setIsLoading(false);
    }
  };

  // テンプレート削除
  const handleDelete = async (id: string) => {
    if (!confirm("このテンプレートを削除してもよろしいですか？")) return;

    try {
      const response = await fetch(`/api/prompt-templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 成功したら一覧から削除
        setTemplates(templates.filter(template => template.id !== id));
      }
    } catch (error) {
      console.error("テンプレートの削除に失敗しました", error);
    }
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">プロンプトテンプレート</h1>
        <Link
          href="/settings/prompt-templates/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center gap-2"
        >
          <FiPlus size={16} />
          <span>新規作成</span>
        </Link>
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={includePublic}
            onChange={() => setIncludePublic(!includePublic)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2">公開テンプレートも表示</span>
        </label>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">テンプレートを読み込み中...</p>
        </div>
      ) : templates.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名前
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公開
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新日
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    {template.description && (
                      <div className="text-xs text-gray-500">{template.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{template.category || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      template.isPublic ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {template.isPublic ? "公開" : "非公開"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(template.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/settings/prompt-templates/${template.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye size={18} />
                      </Link>
                      <Link
                        href={`/settings/prompt-templates/${template.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FiEdit2 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">テンプレートがまだ作成されていません。</p>
          <Link
            href="/settings/prompt-templates/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            最初のテンプレートを作成する
          </Link>
        </div>
      )}
    </div>
  );
} 