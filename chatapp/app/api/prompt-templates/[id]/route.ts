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

// プロンプトテンプレートの詳細を取得
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const promptTemplate = await db.promptTemplate.findUnique({
      where: {
        id,
      },
    });

    if (!promptTemplate) {
      return NextResponse.json(
        { error: "Prompt template not found" },
        { status: 404 }
      );
    }

    // 公開されていないテンプレートは所有者のみアクセス可能
    if (!promptTemplate.isPublic && promptTemplate.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(promptTemplate);
  } catch (error) {
    console.error("Error fetching prompt template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// プロンプトテンプレートを更新
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const { name, description, content, category, isPublic } = await req.json();

    // 既存のテンプレートを確認
    const existingTemplate = await db.promptTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Prompt template not found" },
        { status: 404 }
      );
    }

    // 所有者のみ更新可能
    if (existingTemplate.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // 更新するデータを準備
    const updateData: {
      name?: string;
      description?: string | null;
      content?: string;
      category?: string | null;
      isPublic?: boolean;
    } = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // データが空の場合はエラー
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // テンプレートを更新
    const updatedTemplate = await db.promptTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Error updating prompt template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// プロンプトテンプレートを削除
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // 既存のテンプレートを確認
    const existingTemplate = await db.promptTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Prompt template not found" },
        { status: 404 }
      );
    }

    // 所有者のみ削除可能
    if (existingTemplate.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // 関連するチャットセッションから参照を削除
    await db.chatSession.updateMany({
      where: { promptTemplateId: id },
      data: { promptTemplateId: null },
    });

    // テンプレートを削除
    await db.promptTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prompt template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 