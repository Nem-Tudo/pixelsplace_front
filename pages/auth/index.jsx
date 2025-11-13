import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useAuth } from '@/context/AuthContext'

function Oauth2Content() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)

    const { refreshUser } = useAuth();

    const token = searchParams.get('token')
    const provider = searchParams.get('provider')
    const redirectURL = searchParams.get('redirectURL') || '/'

    useEffect(() => {
        if (isProcessing) return
        setIsProcessing(true)

        if (token) {
            // Salva nos cookies (7 dias)
            Cookies.set('authorization', token, { expires: 365, path: '/' })
            Cookies.set('auth_provider', provider || '', { expires: 365, path: '/' })

            // Notificar a janela principal que o login foi bem-sucedido
            if (window.opener) {
                window.opener.postMessage(
                    { type: 'oauth_success', data: { provider } },
                    window.location.origin
                );
                window.close();
            } else {
                refreshUser();
                // Se não for um popup, redirecionar normalmente
                const targetURL = redirectURL.startsWith('/')
                    ? redirectURL
                    : `/${redirectURL}`

                router.push(targetURL)
            }
        } else {
            Cookies.remove("authorization");
            Cookies.remove("auth_provider");
            if (window.opener) {
                window.close();
            } else {
                const targetURL = redirectURL.startsWith('/')
                    ? redirectURL
                    : `/${redirectURL}`
                router.push(targetURL)
            }
        }
    }, [token, provider, redirectURL, router, isProcessing])

    return (
        <div style={{
            display: "flex",
            width: "100%",
            height: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <h1 style={{
                color: "black",
                fontSize: "1.5rem",
                fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif"
            }}>
                {token
                    ? `Logando com ${provider}...`
                    : `Redirecionando...`
                }
            </h1>
        </div>
    )
}

export default function Oauth2() {
    return (
        <Oauth2Content />
    )
}