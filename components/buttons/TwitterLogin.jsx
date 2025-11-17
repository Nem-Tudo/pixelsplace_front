import { useState, useEffect, useRef } from 'react';
import styles from './Login.module.css';
import { useAuth } from '@/context/AuthContext';
import isMobile from "@/src/isMobile";
import { usePopup } from '@/context/PopupContext';
import settings from '@/settings';
import Cookies from 'js-cookie';

export default function TwitterLogin({ onUpdateLoading = () => { }, customStyle = {} }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState({ error: false, reason: "" });
    const iconRef = useRef(null);

    const { refreshUser } = useAuth();
    const { closePopup } = usePopup()

    useEffect(() => {
        onUpdateLoading(isLoading)
    }, [isLoading])

    useEffect(() => {
        // Listener para mensagens do popup
        const handleMessage = (event) => {
            // Verificar se a mensagem é do nosso popup
            if (event.data?.type === 'oauth_success' && event.data?.data?.provider === "twitter") {
                console.log("Twitter login")
                // location.reload();
                Cookies.set('authorization', event.data?.data?.token, { expires: 365, path: '/' })
                Cookies.set('auth_provider', event.data?.data?.provider || '', { expires: 365, path: '/' })
                setIsLoading(false);

                refreshUser();
                closePopup();

            }
            if (event.data?.type === 'oauth_error' && event.data?.data?.provider === "twitter") {
                setIsLoading(false);
                setIsError({ error: true, reason: event.data?.data?.reason });
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const handleLogin = () => {
        setIsLoading(true);

        // Executar animação no ícone
        // achei meio estranho no Twitter
        // if (iconRef.current) {
        //     iconRef.current.classList.add(styles.rotate);
        //     setTimeout(() => {
        //         iconRef.current?.classList.remove(styles.rotate);
        //     }, 500);
        // }

        const authUrl = `${settings.apiURL}/auth/twitter`;

        if (isMobile()) {
            // Redirect direto no mobile
            window.location.href = authUrl;
            return;
        }

        // Popup no desktop
        const width = 830;
        const height = 626;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            authUrl,
            'Twitter Login',
            `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0`
        );

        // Fallback se popup foi bloqueado
        if (!popup) {
            window.location.href = authUrl;
            return;
        }

        // Detectar quando o popup fechar manualmente
        const checkPopup = setInterval(() => {
            if (popup && popup.closed) {
                clearInterval(checkPopup);
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <button
            className={styles.button}
            onClick={handleLogin}
            disabled={isLoading}
            style={customStyle}
        >
            <img style={{ objectFit: "unset" }} ref={iconRef} className={styles.icon} src='/assets/twitter.svg' />
            <span className={styles.text} style={isError.error ? { color: "red" } : {}}>
                {
                    isError.error ? `Erro: ${isError.reason}` : (isLoading ? 'Entrando...' : 'Entrar com Twitter')
                }
            </span>
        </button>
    );
}