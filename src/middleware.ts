import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 관리자 페이지 경로인 경우만 체크
  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin_auth');

    // 쿠키가 없거나 값이 'true'가 아니면 로그인 페이지로 리다이렉트
    if (!authCookie || authCookie.value !== 'true') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ['/admin/:path*'],
};
