@echo off
echo SelfKey Chat Appセットアップツール
echo ==============================
echo.
echo このスクリプトは必要な依存関係をインストールし、データベースを設定します。
echo.

REM PowerShellチェック
powershell -Command "exit" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo PowerShellを使用してセットアップを実行します...
  powershell -Command "cd chatapp; npm install; npm run prisma:generate; npm run prisma:migrate"
) else (
  echo 通常のコマンドプロンプトを使用してセットアップを実行します...
  cd chatapp && npm install && npm run prisma:generate && npm run prisma:migrate
)

echo.
if %ERRORLEVEL% EQU 0 (
  echo ==============================
  echo セットアップが正常に完了しました！
  echo.
  echo アプリケーションを起動するには以下のコマンドを使用します：
  echo.
  echo PowerShellの場合: cd chatapp; npm run dev
  echo コマンドプロンプトの場合: cd chatapp ^&^& npm run dev
  echo または start.bat を実行
  echo ==============================
) else (
  echo ==============================
  echo セットアップ中にエラーが発生しました。
  echo 上記のエラーメッセージを確認してください。
  echo ==============================
)

pause 