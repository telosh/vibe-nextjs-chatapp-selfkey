import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDefaultModel } from "@/lib/ai/models";

// NodeJSランタイムを使用
export const runtime = 'nodejs';

// チャットセッション一覧を取得
export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const chatSessions = await db.chatSession.findMany({
      where: {
        userId,
        isArchived: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        model: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(chatSessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 新しいチャットセッションを作成
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const defaultModel = getDefaultModel();

    // リクエストボディの取得（テンプレートIDが指定されている場合）
    const request = await req.json().catch(() => ({}));
    const { promptTemplateId } = request;

    // 基本データ
    const chatData: {
      userId: string;
      title: string;
      model: string;
      promptTemplateId?: string;
      systemPrompt?: string;
    } = {
      userId,
      title: "新しい会話",
      model: defaultModel.id,
    };

    // プロンプトテンプレートIDが指定されている場合
    if (promptTemplateId) {
      // テンプレートの存在確認
      const template = await db.promptTemplate.findUnique({
        where: {
          id: promptTemplateId,
          OR: [
            { userId }, // 自分のテンプレート
            { isPublic: true } // または公開テンプレート
          ]
        }
      });

      if (template) {
        chatData.promptTemplateId = template.id;
        chatData.systemPrompt = template.content; 
        
        // テンプレート名をタイトルの一部として使用
        chatData.title = `${template.name} - 新しい会話`;
      }
    }

    // チャットセッションの作成
    const newChat = await db.chatSession.create({
      data: chatData,
    });

    return NextResponse.json(newChat);
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 