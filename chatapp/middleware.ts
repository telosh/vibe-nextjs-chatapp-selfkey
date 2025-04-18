import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge環境と互換性のある形に修正
export async function middleware(request: NextRequest) {
  // 認証が必要なルートのパスパターン
  const authRoutes = ['/chat'];
  
  // 現在のパスが認証必須かどうかをチェック
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // 認証が必要なルートで未認証の場合はログインページにリダイレクト
  // authはサーバーコンポーネントでのみ使用し、middlewareでは簡易チェックのみ行う
  const authCookie = request.cookies.get('next-auth.session-token') || 
                     request.cookies.get('__Secure-next-auth.session-token');
  
  if (isAuthRoute && !authCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 