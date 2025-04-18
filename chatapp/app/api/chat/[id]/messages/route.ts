import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { db } from "@/lib/db";
import { OpenAI } from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { getModelById } from "@/lib/ai/models";
import { GoogleGenAI } from "@google/genai";

// NodeJSランタイムを使用
export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// GoogleGenAI APIの初期化
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface RouteParams {
  params: {
    id: string;
  }
}

// メッセージの型定義
interface Message {
  id: string;
  chatSessionId: string;
  role: string;
  content: string;
  createdAt: Date;
}

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
    const { content, model: modelId } = await req.json();

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

    // ユーザーメッセージをデータベースに保存
    await db.message.create({
      data: {
        chatSessionId: chatId,
        role: "user",
        content,
      },
    });

    // モデル情報を取得
    const modelInfo = getModelById(modelId || chatSession.model);
    if (!modelInfo) {
      return NextResponse.json(
        { error: "Invalid model specified" },
        { status: 400 }
      );
    }

    // 過去のメッセージを取得して会話履歴を構築
    const previousMessages = await db.message.findMany({
      where: {
        chatSessionId: chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
    }) as Message[];

    let aiResponse: string;

    // AIプロバイダーに応じた処理
    if (modelInfo.provider === "google") {
      try {
        if (!genAI) {
          throw new Error("Google Gemini APIが初期化されていません");
        }
        
        // 新しいGemini SDKの使用方法に合わせて修正
        const response = await genAI.models.generateContent({
          model: modelInfo.modelName,
          contents: previousMessages.map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          })),
        });
        
        // 応答を取得
        aiResponse = response.text ?? "応答がありませんでした。";
      } catch (error) {
        console.error("Error with Google Generative AI:", error);
        return NextResponse.json(
          { error: "Google AIの応答生成中にエラーが発生しました。APIキーが正しく設定されているか確認してください。" },
          { status: 500 }
        );
      }
    } else if (modelInfo.provider === "openai") {
      const chatCompletion = await openai.chat.completions.create({
        model: modelInfo.modelName,
        messages: previousMessages.map((msg: Message) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })),
      });

      aiResponse = chatCompletion.choices[0].message.content || "応答がありませんでした。";
    } else if (modelInfo.provider === "anthropic") {
      // Anthropic SDKを使用（v0.12.0）
      const response = await anthropic.completions.create({
        model: modelInfo.modelName,
        prompt: generateAnthropicPrompt(previousMessages),
        max_tokens_to_sample: 1000,
      });

      aiResponse = response.completion;
    } else {
      // 未対応のプロバイダー
      aiResponse = "このプロバイダーはまだサポートされていません。";
    }

    // AIの応答をデータベースに保存
    await db.message.create({
      data: {
        chatSessionId: chatId,
        role: "assistant",
        content: aiResponse,
      },
    });

    // タイトルが「新しい会話」の場合は最初のメッセージから自動生成
    if (chatSession.title === "新しい会話" && previousMessages.length <= 2) {
      const truncatedTitle =
        content.length > 30 ? content.substring(0, 30) + "..." : content;
      
      await db.chatSession.update({
        where: { id: chatId },
        data: { title: truncatedTitle },
      });
    }

    // 更新されたメッセージリストを返す
    const updatedMessages = await db.message.findMany({
      where: {
        chatSessionId: chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      messages: updatedMessages,
    });
  } catch (error) {
    console.error("Error processing message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Anthropic用のプロンプト生成
function generateAnthropicPrompt(messages: Message[]): string {
  let prompt = "\n\nHuman: ";
  
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.role === "user") {
      prompt += message.content;
      
      // 次のメッセージがassistantの場合
      if (i + 1 < messages.length && messages[i + 1].role === "assistant") {
        prompt += "\n\nAssistant: ";
      } else if (i + 1 < messages.length) {
        prompt += "\n\nHuman: ";
      }
    } else if (message.role === "assistant") {
      prompt += message.content;
      
      // 次のメッセージがuserの場合
      if (i + 1 < messages.length && messages[i + 1].role === "user") {
        prompt += "\n\nHuman: ";
      } else if (i + 1 < messages.length) {
        prompt += "\n\nAssistant: ";
      }
    }
  }
  
  // 最後にAssistantのプロンプト部分を追加
  prompt += "\n\nAssistant: ";
  
  return prompt;
} 