# SelfKey Chat Application

Next.js 15と複数のAIモデルを活用した最新のチャットアプリケーション。

## 機能

- 複数のAIモデル対応 (OpenAI, Anthropic, Google Gemini)
- チャット履歴の保存
- マークダウン対応 (コードブロックのシンタックスハイライト)
- 認証システム (Email/Password, Google, GitHub)
- ダークモード対応

## セットアップ

### 前提条件

- Node.js 18.17以上
- NPM 9.6以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/username/nextjs-chatapp-selfkey.git
cd nextjs-chatapp-selfkey

# セットアップスクリプトを実行
# PowerShellの場合
./setup.bat

# コマンドプロンプトの場合
setup.bat
```

### 環境変数

`.env`ファイルを作成し、以下の環境変数を設定してください:

```env
# データベース
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Models
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GEMINI_API_KEY="your-gemini-api-key"
```

### 開発サーバーの起動

```bash
# PowerShellの場合
start.bat
# または
cd chatapp; npm run dev

# コマンドプロンプトの場合
start.bat
# または
cd chatapp && npm run dev
```

## アプリケーション構造

### クライアント・サーバー処理の分離

このアプリケーションは、Next.js 15のApp Routerを使用し、クライアントとサーバーのコードを明確に分離しています。

#### サーバーサイド処理

- API routes (`app/api/`): データベース操作、AIモデルとの通信、認証処理などのバックエンド処理
- ミドルウェア: 基本的な認証チェック、ルートガード

#### クライアントサイド処理

- ページコンポーネント: すべてのページをクライアントコンポーネントとして実装し、認証状態に応じたUI表示を制御
- 状態管理: React Hooksを使用した状態管理とセッション処理
- APIとの通信: fetchを使用したAPIエンドポイントとの通信

### 認証フロー

1. ミドルウェアによる基本的なセッションチェック (cookie有無)
2. クライアントコンポーネントでのセッション状態確認 (useSession)
3. 認証状態に応じたリダイレクト処理または画面表示

### データフェッチング

1. クライアントコンポーネントでAPIエンドポイントを呼び出し
2. APIルート内でデータベース操作を実行
3. 結果をJSONとしてクライアントに返却
4. クライアント側で状態を更新しUIに反映

## トラブルシューティング

### PowerShellでのコマンド実行

PowerShellでは`&&`演算子が使えないため、セミコロン`;`を使って複数のコマンドを連結します:

```powershell
cd chatapp; npm run dev
```

または付属の`start.bat`スクリプトを使用してください。

### 認証関連のエラー

認証に問題がある場合は以下を確認してください:

1. 環境変数が正しく設定されているか
2. データベースが正常に初期化されているか (`npm run prisma:generate` と `npm run prisma:migrate` が実行されているか)
3. `.next`ディレクトリを削除して再ビルドを試す

### AI応答の問題

AI応答がない場合は、各プロバイダー(OpenAI, Anthropic, Google)のAPIキーが正しく設定されているか確認してください。

## ライセンス

MIT
