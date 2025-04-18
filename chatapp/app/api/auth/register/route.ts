import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// NodeJSランタイムを使用
export const runtime = 'nodejs';

// 入力バリデーションスキーマ
const registerSchema = z.object({
  name: z.string().min(2, "名前は2文字以上である必要があります"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(6, "パスワードは6文字以上である必要があります"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 入力バリデーション
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((error) => ({
        path: error.path.join("."),
        message: error.message,
      }));
      
      return NextResponse.json(
        { message: "Invalid input", errors },
        { status: 400 }
      );
    }

    const { name, email } = result.data;
    // パスワードは後の実装のためにここでは使用しないがバリデーションは行う

    // メールアドレスの重複チェック
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    // 実際のプロジェクトではパスワードをハッシュ化する必要があります
    // この実装はデモ用で、本番環境では必ずbcryptなどを使用してハッシュ化してください
    // const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーをデータベースに保存
    // 実際の実装ではhashedPasswordを使用します
    const user = await db.user.create({
      data: {
        name,
        email,
        // ハッシュ化されていないパスワードは保存しませんが、デモ用にコメントとして残しています
        // passwordHash: hashedPassword,
        role: "user",
      },
    });

    // パスワード情報を除外してユーザーデータを返す
    const { id, role, createdAt } = user;

    return NextResponse.json({
      id,
      name,
      email,
      role,
      createdAt,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "ユーザー登録中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 