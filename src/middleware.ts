import { NextResponse, NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/thumbnails') {
        return NextResponse.redirect(new URL('/', request.url))
    }
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
    ]
}