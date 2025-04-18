import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { getDefaultModel, getAllModels, getModelById } from "@/lib/ai/models";

// NodeJSランタイムを使用
export const runtime = 'nodejs';

/**
 * モデル一覧または特定モデルの詳細を取得するAPI
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // クエリパラメータからidを取得
    const url = new URL(req.url);
    const modelId = url.searchParams.get("id");

    if (modelId) {
      // 特定のモデル情報を取得
      const model = getModelById(modelId);
      if (!model) {
        return NextResponse.json({ error: "モデルが見つかりません" }, { status: 404 });
      }
      return NextResponse.json(model);
    } else {
      // 全モデル一覧を取得
      const models = getAllModels();
      return NextResponse.json(models);
    }
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

/**
 * デフォルトモデルを取得するエンドポイント
 */
export async function POST() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const defaultModel = getDefaultModel();
    return NextResponse.json(defaultModel);
  } catch (error) {
    console.error("Error fetching default model:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
} 