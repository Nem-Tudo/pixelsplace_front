// // middleware.js - Versão mais segura
// import { NextResponse } from 'next/server'
// import settings from './settings'

// export function middleware(request) {

//     try {
//         // Evita loops infinitos - não processa requests que já vêm do preview
//         if (request.nextUrl.hostname.endsWith('.vercel.app')) {
//             return NextResponse.next()
//         }

//         // Verifica se há cookie de branch ativa
//         const activeBranch = request.cookies.get('active-build-data')?.value

//         // Se há uma branch ativa e não é a main, faz rewrite interno
//         if (activeBranch && activeBranch !== 'main') {
//             // Constrói URL do preview deployment
//             const previewUrl = settings.branchURL(JSON.parse(activeBranch).branch, request.nextUrl.pathname, request.nextUrl.search)

//             // Adiciona headers para evitar cache issues
//             const response = NextResponse.rewrite(previewUrl)
//             response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
//             response.headers.set('Pragma', 'no-cache')
//             response.headers.set('Expires', '0')

//             return response
//         }
//     } catch (e) {
//         return NextResponse.next();
//     }

//     return NextResponse.next()
// }

// export const config = {
//     matcher: [
//         // Inclui todos os paths
//         '/(.*)',
//     ],
// }

// middleware.js - Versão corrigida que mantém o comportamento atual
import { NextResponse } from 'next/server'
import settings from './settings'

export async function middleware(request) {
    try {
        // Evita loops infinitos
        if (request.nextUrl.hostname.endsWith('.vercel.app')) {
            return NextResponse.next()
        }

        // Pula arquivos estáticos e API routes
        if (request.nextUrl.pathname.startsWith('/api') || 
            request.nextUrl.pathname.startsWith('/_next') ||
            request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
            return NextResponse.next()
        }

        const activeBranch = request.cookies.get('active-build-data')?.value

        if (activeBranch && activeBranch !== 'main') {
            const branchData = JSON.parse(activeBranch)
            const previewUrl = settings.branchURL(branchData.branch, request.nextUrl.pathname, request.nextUrl.search)

            // SOLUÇÃO: Fetch o conteúdo e retorna como resposta direta
            const response = await fetch(previewUrl, {
                method: request.method,
                headers: {
                    // Passa headers relevantes, mas remove os problemáticos
                    'User-Agent': request.headers.get('user-agent') || '',
                    'Accept': request.headers.get('accept') || '',
                    'Accept-Language': request.headers.get('accept-language') || '',
                    // Não passa cookies para evitar conflitos
                },
                body: request.method !== 'GET' && request.method !== 'HEAD' ? 
                      await request.text() : undefined,
            })

            // Se é HTML, precisa processar para manter Next.js funcionando
            const contentType = response.headers.get('content-type') || ''
            
            if (contentType.includes('text/html')) {
                let html = await response.text()
                
                // Substitui URLs absolutas do preview para URLs relativas
                const previewDomain = new URL(previewUrl).origin
                html = html.replace(new RegExp(previewDomain, 'g'), '')
                
                // Garante que assets do Next.js apontem para o domínio correto
                html = html.replace(/\/_next\//g, `${previewDomain}/_next/`)
                
                return new NextResponse(html, {
                    status: response.status,
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0',
                    },
                })
            } else {
                // Para outros tipos de conteúdo (JSON, etc), passa direto
                const content = await response.arrayBuffer()
                
                return new NextResponse(content, {
                    status: response.status,
                    headers: {
                        'Content-Type': contentType,
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                    },
                })
            }
        }
    } catch (e) {
        console.error('Middleware error:', e)
        // Em caso de erro, continua normalmente
        return NextResponse.next()
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Processa todas as rotas exceto assets estáticos
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
}
