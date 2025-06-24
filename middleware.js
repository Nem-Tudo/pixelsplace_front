// middleware.js - Versão mais segura
import { NextResponse } from 'next/server'

export function middleware(request) {
    // Verifica se é a rota de mudança de branch
    if (request.nextUrl.pathname.startsWith('/changebranch/')) {
        const branchName = request.nextUrl.pathname.split('/changebranch/')[1]

        if (branchName) {
            // Cria resposta com redirect para home
            const response = NextResponse.redirect(new URL('/', request.url))

            // Define o cookie com a branch escolhida
            response.cookies.set('active-branch', branchName, {
                maxAge: 60 * 60 * 24 * 30, // 30 dias
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })

            return response
        }
    }

    // Evita loops infinitos - não processa requests que já vêm do preview
    if (request.url.includes('.vercel.app')) {
        return NextResponse.next()
    }

    // Verifica se há cookie de branch ativa
    const activeBranch = request.cookies.get('active-branch')?.value

    // Se há uma branch ativa e não é a main, faz rewrite interno
    if (activeBranch && activeBranch !== 'main' && activeBranch !== 'master') {
        // Constrói URL do preview deployment
        const previewUrl = `https://pixelsplace-front-git-${activeBranch}-nemtudos-projects.vercel.app${request.nextUrl.pathname}${request.nextUrl.search}`

        // Log para debug (remova em produção)
        console.log(`Rewriting ${request.nextUrl.pathname} to ${previewUrl}`)

        // Adiciona headers para evitar cache issues
        const response = NextResponse.rewrite(previewUrl)
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')

        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Inclui todos os paths, incluindo static files
        '/(.*)',
    ],
}