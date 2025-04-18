# モダンチャットアプリケーション設計書

## 1. プロジェクト概要

### 1.1 目的
- 汎用的なチャットアプリケーションのテンプレート作成
- 複数のAIモデルに対応可能な設計
- RAG（Retrieval-Augmented Generation）機能の実装
- 柔軟な認証システムの提供

### 1.2 技術スタック
- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- Prisma (データベースORM)
- NextAuth.js (認証基盤)
- OpenAI SDK
- Anthropic SDK
- Google Generative AI SDK

## 2. アプリケーション構造

### 2.1 ディレクトリ構造
```
chatapp/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   └── chat/
│   │       ├── route.ts
│   │       └── [id]/
│   │           ├── route.ts
│   │           └── messages/
│   │               └── route.ts
│   ├── chat/
│   │   ├── [id]/
│   │   └── page.tsx
│   ├── settings/
│   └── layout.tsx
├── components/
│   ├── chat/
│   ├── auth/
│   ├── ui/
│   └── shared/
├── lib/
│   ├── ai/
│   │   └── models.ts
│   ├── db/
│   │   └── index.ts
│   ├── auth/
│   │   └── index.ts
│   └── utils/
├── public/
└── prisma/
    └── schema.prisma
```

### 2.2 主要コンポーネント
- ChatInterface: メインのチャットUI
- MessageList: メッセージ履歴表示
- MessageInput: メッセージ入力フォーム
- ModelSelector: AIモデル選択
- RAGInterface: 外部データソース接続UI
- AuthProvider: 認証コンテキスト
- AdminDashboard: 管理者ダッシュボード
- UserManagement: ユーザー管理
- AnalyticsPanel: 分析パネル
- SystemSettings: システム設定

## 3. 機能仕様

### 3.1 チャット機能
- リアルタイムメッセージ送受信
- メッセージ履歴の永続化
- マークダウン対応
- コードブロックのシンタックスハイライト
- 画像添付機能

### 3.2 AIモデル統合
- 環境変数によるモデル設定
- 複数モデル対応
  - OpenAI (GPT-3.5, GPT-4)
  - Anthropic (Claude)
  - Google (Gemini)
- モデルごとのパラメータ設定
- ストリーミングレスポンス対応

### 3.3 API実装状況

#### 3.3.1 チャットセッション管理 API
```typescript
// チャットセッション一覧を取得
GET /api/chat
- 認証済みユーザーのチャットセッション一覧を返却
- アーカイブされていないセッションのみ表示
- 更新日時の降順でソート

// 新規チャットセッション作成
POST /api/chat
- 認証済みユーザー用の新しいチャットセッションを作成
- デフォルトタイトル「新しい会話」
- デフォルトAIモデルを設定

// 特定チャットセッションの詳細取得
GET /api/chat/[id]
- 指定されたIDのチャットセッション詳細を取得
- 関連するメッセージも含めて返却

// チャットセッション更新
PATCH /api/chat/[id]
- タイトル、モデル、アーカイブ状態などの更新
- 部分更新に対応

// チャットセッション削除
DELETE /api/chat/[id]
- チャットセッションを完全に削除
- 関連するメッセージも自動削除
```

#### 3.3.2 メッセージ管理 API
```typescript
// メッセージ送信とAI応答取得
POST /api/chat/[id]/messages
- ユーザーメッセージをデータベースに保存
- 選択されたAIモデルにメッセージを送信
- AIからの応答を取得してデータベースに保存
- 更新されたメッセージリストを返却
```

#### 3.3.3 型定義の最適化
Next.jsのApp Routerでの型定義に関する注意点：
```typescript
// 正しいルートパラメータの型定義
interface RouteParams {
  params: Promise<{
    id: string;
  }>
}

// パラメータの取得方法
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  const chatId = await params.then(p => p.id);
  // ... 以降の処理
}
```

### 3.4 認証システム
- 複数認証プロバイダー対応
  - Email/Password
  - OAuth (Google, GitHub, etc.)
  - Magic Link
- ロールベースアクセス制御
- セッション管理

### 3.5 管理者機能
- ダッシュボード
  - システム使用状況の概要
  - アクティブユーザー数
  - API使用量
  - エラー率モニタリング
  - パフォーマンスメトリクス

- ユーザー管理
  - ユーザー一覧表示
  - ユーザー詳細情報
  - ロール管理
  - アカウント制限/停止
  - ユーザーアクティビティログ

- システム設定
  - AIモデル設定
  - レート制限設定
  - ストレージ設定
  - バックアップ設定
  - セキュリティ設定

- 分析・レポート
  - 使用統計
  - コスト分析
  - パフォーマンスレポート
  - カスタムレポート生成
  - データエクスポート

### 3.6 添付ファイル処理システム

#### 3.6.1 ファイル処理パイプライン
1. **アップロード処理**
   - ファイルサイズ制限: 10MB
   - 対応フォーマット: PDF, DOCX, TXT, CSV, 画像ファイル
   - ウイルススキャン
   - メタデータ抽出

2. **ストレージ戦略**
   - クラウドストレージ（S3, GCS等）の利用
   - ファイルの一時保存と永続化
   - アクセス制御とセキュリティ
   - バージョン管理

3. **ファイル処理**
   - テキスト抽出（OCR対応）
   - フォーマット変換
   - メタデータ生成
   - ベクトル化（RAG用）

4. **セキュリティ対策**
   - ファイルタイプ検証
   - マルウェアスキャン
   - アクセス権限管理
   - 暗号化（保存時・転送時）

#### 3.6.2 ファイル処理コンポーネント
```typescript
interface FileProcessor {
  // ファイル処理の基本インターフェース
  process(file: File): Promise<ProcessedFile>;
  validate(file: File): Promise<ValidationResult>;
  store(file: ProcessedFile): Promise<StoredFile>;
}

interface ProcessedFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  content: string;
  metadata: FileMetadata;
  vector?: number[];
}

interface FileMetadata {
  title?: string;
  author?: string;
  creationDate?: Date;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}
```

#### 3.6.3 ストレージ設定
```typescript
interface StorageConfig {
  provider: 's3' | 'gcs' | 'azure';
  bucket: string;
  region: string;
  pathPrefix: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyRotation: boolean;
  };
  retention: {
    policy: 'temporary' | 'permanent';
    duration?: number;
  };
}
```

#### 3.6.4 ファイル処理フロー
1. **アップロード前処理**
   - ファイルサイズチェック
   - ファイルタイプ検証
   - ウイルススキャン
   - メタデータ抽出開始

2. **処理中**
   - テキスト抽出（OCR必要に応じて）
   - フォーマット変換
   - メタデータ生成
   - ベクトル化（RAG用）

3. **保存処理**
   - クラウドストレージへのアップロード
   - データベースへのメタデータ保存
   - アクセス権限の設定
   - バックアップの開始

4. **後処理**
   - キャッシュの更新
   - インデックスの更新
   - 通知の送信
   - クリーンアップ

#### 3.6.5 エラーハンドリング
```typescript
interface FileProcessingError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
  timestamp: Date;
}

// エラーコード定義
enum FileErrorCode {
  SIZE_LIMIT_EXCEEDED = 'SIZE_LIMIT_EXCEEDED',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  VIRUS_DETECTED = 'VIRUS_DETECTED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}
```

#### 3.6.6 パフォーマンス最適化
1. **アップロード最適化**
   - チャンクアップロード
   - 並列処理
   - プログレス表示
   - レジューム機能

2. **処理最適化**
   - 非同期処理
   - キューイング
   - キャッシング
   - バッチ処理

3. **ストレージ最適化**
   - CDN統合
   - キャッシュ戦略
   - 圧縮
   - ライフサイクル管理

## 4. データモデル

### 4.1 データベース設計

#### 4.1.1 テーブル構造
```sql
-- ユーザーテーブル
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB
);

-- チャットセッションテーブル
CREATE TABLE chat_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  model VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- メッセージテーブル
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  chat_session_id VARCHAR(36) NOT NULL REFERENCES chat_sessions(id),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tokens_used INTEGER,
  metadata JSONB,
  FOREIGN KEY (chat_session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- 添付ファイルテーブル
CREATE TABLE attachments (
  id VARCHAR(36) PRIMARY KEY,
  message_id VARCHAR(36) NOT NULL REFERENCES messages(id),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- ベクトルストアテーブル
CREATE TABLE vector_store (
  id VARCHAR(36) PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- システム設定テーブル
CREATE TABLE system_settings (
  id VARCHAR(36) PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーセッションテーブル
CREATE TABLE user_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_messages_chat_session_id ON messages(chat_session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_attachments_message_id ON attachments(message_id);
CREATE INDEX idx_vector_store_embedding ON vector_store USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
```

#### 4.1.2 データベース設計の特徴

1. **スケーラビリティ**
   - UUIDをプライマリーキーとして使用
   - 適切なインデックス設計
   - JSONBカラムによる柔軟なメタデータ管理

2. **パフォーマンス最適化**
   - ベクトル検索用のインデックス
   - 適切な外部キー制約
   - タイムスタンプベースのインデックス

3. **データ整合性**
   - 外部キー制約による参照整合性の保証
   - カスケード削除の適切な設定
   - NOT NULL制約の適切な使用

4. **拡張性**
   - メタデータカラムによる柔軟な拡張
   - システム設定の動的管理
   - 添付ファイルの管理

#### 4.1.3 データベースマイグレーション戦略

1. **バージョン管理**
   - Prisma Migrateを使用
   - マイグレーションファイルの命名規則
   - ロールバック手順の定義

2. **データ移行**
   - バッチ処理による大量データ移行
   - ゼロダウンタイム移行の実装
   - データ整合性チェック

3. **バックアップ戦略**
   - 定期的なフルバックアップ
   - インクリメンタルバックアップ
   - ポイントインタイムリカバリ

### 4.2 ユーザー
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  settings: UserSettings;
}
```

### 4.3 チャット
```typescript
interface Chat {
  id: string;
  userId: string;
  title: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}
```

### 4.4 メッセージ
```typescript
interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}
```

### 4.5 管理者設定
```typescript
interface AdminSettings {
  id: string;
  systemConfig: {
    rateLimit: number;
    maxStorage: number;
    backupFrequency: string;
    securityLevel: 'low' | 'medium' | 'high';
  };
  modelConfig: {
    defaultModel: string;
    availableModels: string[];
    modelParameters: Record<string, any>;
  };
  monitoringConfig: {
    alertThresholds: Record<string, number>;
    notificationSettings: NotificationSettings;
  };
}

interface SystemMetrics {
  id: string;
  timestamp: Date;
  activeUsers: number;
  apiCalls: number;
  errorRate: number;
  averageResponseTime: number;
  storageUsage: number;
}
```

## 5. UI/UXデザイン

### 5.1 デザインシステム
- モダンでミニマルなデザイン
- ダークモード対応
- レスポンシブデザイン
- アニメーションとトランジション

### 5.2 カラーパレット
```css
:root {
  --primary: #2563eb;
  --secondary: #4f46e5;
  --accent: #8b5cf6;
  --background: #ffffff;
  --foreground: #1f2937;
  --muted: #6b7280;
}
```

## 6. セキュリティ考慮事項

### 6.1 実装すべき対策
- APIキーの安全な管理
- レート制限
- XSS対策
- CSRF対策
- 入力バリデーション

### 6.2 データ保護
- メッセージの暗号化
- セキュアなセッション管理
- データバックアップ

## 7. パフォーマンス最適化

### 7.1 実装戦略
- サーバーサイドレンダリング
- 画像最適化
- コード分割
- キャッシュ戦略

### 7.2 監視と分析
- エラートラッキング
- パフォーマンスメトリクス
- ユーザー行動分析

## 8. 今後の拡張性

### 8.1 計画されている機能
- チーム機能
- ファイル共有
- カスタムAIモデル統合
- プラグインシステム

### 8.2 インテグレーション
- APIエンドポイント
- Webhook
- サードパーティ連携

## 9. 実装状況と課題

### 9.1 実装済み機能
- 基本的なチャットインターフェース
- 複数AIモデル対応（OpenAI、Anthropic、Google Gemini）
- チャットセッション管理
  - 作成
  - 閲覧
  - 更新
  - 削除
- メッセージ送受信機能
- 認証システム
- APIルートの型定義最適化

### 9.2 開発中の機能
- ファイル添付機能
- RAGシステム
- ストリーミングレスポンス
- 管理者ダッシュボード

### 9.3 発生した課題と解決策
- **Next.js App Routerの型定義問題**
  - 症状: ルートパラメータの型エラー
  - 原因: App RouterではパラメータがPromise型として提供される
  - 解決策: RouteParams型をPromiseに対応するよう修正
  
```typescript
// 修正前
interface RouteParams {
  params: {
    id: string;
  }
}

// 修正後
interface RouteParams {
  params: Promise<{
    id: string;
  }>
}
```

- **複数AIモデルの統一的なインターフェース**
  - 症状: 各AIプロバイダーのAPIが異なる
  - 解決策: アダプタパターンでインターフェースを統一

- **チャットセッションのタイトル自動生成**
  - 実装: 初回メッセージの内容から自動的にタイトルを生成

### 9.4 今後の開発計画
- レスポンシブデザインの完全対応
- オフライン対応機能
- プラグインシステムの実装
- パフォーマンス最適化
- セキュリティ強化
