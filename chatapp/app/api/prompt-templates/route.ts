import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";

// NodeJSランタイムを使用
export const runtime = 'nodejs';

// プロンプトテンプレート一覧を取得
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const includePublic = searchParams.get('includePublic') === 'true';

    // クエリの組み立て
    const whereClause = includePublic
      ? { OR: [{ userId }, { isPublic: true }] }
      : { userId };

    const promptTemplates = await db.promptTemplate.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        // contentは大きい可能性があるため、一覧では取得しない
      },
    });

    return NextResponse.json(promptTemplates);
  } catch (error) {
    console.error("Error fetching prompt templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 新しいプロンプトテンプレートを作成
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { name, description, content, category, isPublic } = await req.json();

    // 必須フィールドの検証
    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }

    const newPromptTemplate = await db.promptTemplate.create({
      data: {
        userId,
        name,
        description,
        content,
        category,
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json(newPromptTemplate);
  } catch (error) {
    console.error("Error creating prompt template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 