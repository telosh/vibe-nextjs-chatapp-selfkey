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

// チャットセッションの詳細を取得
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatId = params.id;
    const chatSession = await db.chatSession.findUnique({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chatSession);
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// チャットセッションを更新
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatId = params.id;
    const { title, model, isArchived } = await req.json();

    // 更新するデータを準備
    const updateData: {
      title?: string;
      model?: string;
      isArchived?: boolean;
    } = {};
    
    if (title !== undefined) updateData.title = title;
    if (model !== undefined) updateData.model = model;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    // データが空の場合はエラー
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // チャットセッションを更新
    const updatedChat = await db.chatSession.update({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error updating chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// チャットセッションを削除
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatId = params.id;

    // チャットセッションを削除（関連するメッセージは自動的に削除される）
    await db.chatSession.delete({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 