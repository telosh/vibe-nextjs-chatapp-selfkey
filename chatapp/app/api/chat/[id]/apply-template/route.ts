import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";

// NodeJSランタイムを使用
export const runtime = 'nodejs';

interface RouteParams {
  params: {
    id: string;
  }
}

// チャットセッションにプロンプトテンプレートを適用
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatId = params.id;
    const { promptTemplateId } = await req.json();

    // チャットセッションの存在と所有権を確認
    const chatSession = await db.chatSession.findUnique({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // テンプレートIDが指定されていない場合、テンプレートをクリア
    if (!promptTemplateId) {
      const updatedChat = await db.chatSession.update({
        where: { id: chatId },
        data: {
          promptTemplateId: null,
          systemPrompt: null,
        },
      });
      return NextResponse.json(updatedChat);
    }

    // テンプレートの存在確認
    const template = await db.promptTemplate.findUnique({
      where: {
        id: promptTemplateId,
        OR: [
          { userId: session.user.id }, // 自分のテンプレート
          { isPublic: true } // または公開テンプレート
        ]
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Prompt template not found or not accessible" },
        { status: 404 }
      );
    }

    // チャットセッションを更新
    const updatedChat = await db.chatSession.update({
      where: { id: chatId },
      data: {
        promptTemplateId: template.id,
        systemPrompt: template.content,
      },
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error applying prompt template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 