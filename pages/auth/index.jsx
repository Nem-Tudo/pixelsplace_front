import { useEffect, useState } from 'react'
import { useRouter } from 'next/router' // Note: 'next/router', não 'next/navigation'
import Cookies from 'js-cookie'
import { useAuth } from '@/context/AuthContext'

export default function Oauth2() {
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const { refreshUser } = useAuth()

    // No Pages Router, os query params vêm direto do router.query
    const { token, provider, redirectURL = '/' } = router.query

    useEffect(() => {
        // Aguarda o router estar pronto
        if (!router.isReady || isProcessing) return

        setIsProcessing(true)

        if (token) {
            Cookies.set('authorization', token, { expires: 365, path: '/' })
            Cookies.set('auth_provider', provider || '', { expires: 365, path: '/' })

            if (window.opener) {
                window.opener.postMessage(
                    { type: 'oauth_success', data: { provider } },
                    window.location.origin
                )
                window.close()
            } else {
                refreshUser()
                const targetURL = redirectURL.startsWith('/')
                    ? redirectURL
                    : `/${redirectURL}`
                router.push(targetURL)
            }
        } else {
            if (window.opener) {
                window.close()
            } else {
                const targetURL = redirectURL.startsWith('/')
                    ? redirectURL
                    : `/${redirectURL}`
                router.push(targetURL)
            }
        }
    }, [router.isReady, token, provider, redirectURL, isProcessing])

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