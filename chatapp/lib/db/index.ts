import { PrismaClient } from "@prisma/client";

// PrismaClientの単一インスタンスを作成
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// global型定義
type GlobalWithDb = typeof globalThis & {
  db?: ReturnType<typeof prismaClientSingleton>;
};

// globalThisをキャストしてdbプロパティにアクセス
const globalWithDb = globalThis as GlobalWithDb;

// 開発環境では再読み込み時にも同じインスタンスを使用
export const db = globalWithDb.db ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalWithDb.db = db;
} 