// middleware.js (na raiz do projeto)
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
                httpOnly: false, // Permite acesso via JavaScript se necessário
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })

            return response
        }
    }

    // Verifica se há cookie de branch ativa
    const activeBranch = request.cookies.get('active-branch')?.value

    // Se há uma branch ativa e não é a main, faz rewrite interno
    if (activeBranch && activeBranch !== 'main' && activeBranch !== 'master') {
        // Constrói URL do preview deployment (ajustado para seu projeto)
        const previewUrl = `https://pixelsplace-front-git-${activeBranch}-nemtudos-projects.vercel.app${request.nextUrl.pathname}${request.nextUrl.search}`

        // Só faz rewrite se não estivermos já na URL do preview
        if (!request.url.includes('.vercel.app')) {
            // Usa rewrite ao invés de redirect - mantém o domínio original
            return NextResponse.rewrite(previewUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}