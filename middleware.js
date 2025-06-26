// middleware.js - Versão mais segura
import { NextResponse } from 'next/server'
import settings from './settings'

export function middleware(request) {

    try {
        // Evita loops infinitos - não processa requests que já vêm do preview
        if (request.nextUrl.hostname.endsWith('.vercel.app')) {
            return NextResponse.next()
        }

        // Verifica se há cookie de branch ativa
        const activeBranch = request.cookies.get('active-build-data')?.value

        // Se há uma branch ativa e não é a main, faz rewrite interno
        if (activeBranch && activeBranch !== 'main') {
            // Constrói URL do preview deployment
            const previewUrl = settings.branchURL(JSON.parse(activeBranch).branch, request.nextUrl.pathname, request.nextUrl.search)

            // Adiciona headers para evitar cache issues
            const response = NextResponse.rewrite(previewUrl)
            response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
            response.headers.set('Pragma', 'no-cache')
            response.headers.set('Expires', '0')

            return response
        }
    } catch (e) {
        return NextResponse.next();
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Inclui todos os paths
        '/(.*)',
    ],
}
