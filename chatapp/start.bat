@echo off
echo SelfKey Chat Appを起動しています...
echo.

REM PowerShellチェック
powershell -Command "exit" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo PowerShellを使用して起動します...
  powershell -Command "cd chatapp; npm run dev"
) else (
  echo 通常のコマンドプロンプトを使用して起動します...
  cd chatapp && npm run dev
)

pause 