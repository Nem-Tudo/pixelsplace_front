import { useState, useEffect, useRef } from 'react';
import styles from './DiscordLogin.module.css';
import { useAuth } from '@/context/AuthContext';
import isMobile from "@/src/isMobile";
import { usePopup } from '@/context/PopupContext';
import settings from '@/settings';
import Cookies from 'js-cookie';

export default function DiscordLogin({ onUpdateLoading = () => { }, customStyle = {} }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState({ error: false, reason: "" });
    const iconRef = useRef(null);
    const buttonRef = useRef(null);

    const { refreshUser } = useAuth();
    const { closePopup } = usePopup()

    useEffect(() => {
        onUpdateLoading(isLoading)
    }, [isLoading])

    useEffect(() => {
        // Listener para mensagens do popup
        const handleMessage = (event) => {
            // Verificar se a mensagem é do nosso popup
            if (event.data?.type === 'oauth_success' && event.data?.data?.provider === "discord") {
                Cookies.set('authorization', event.data?.data?.token, { expires: 365, path: '/' })
                Cookies.set('auth_provider', event.data?.data?.provider || '', { expires: 365, path: '/' })

                setIsLoading(false);
                // Recarregar a página principal
                window.location.reload();
                refreshUser();
                closePopup();
            }
            if (event.data?.type === 'oauth_error' && event.data?.data?.provider === "discord") {
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
        if (iconRef.current) {
            iconRef.current.classList.add(styles.rotate);
            // Remove a classe após a animação terminar para poder reutilizar
            setTimeout(() => {
                iconRef.current?.classList.remove(styles.rotate);
            }, 1000);
        }

        const authUrl = `${settings.apiURL}/auth/discord`;

        if (isMobile()) {
            // Redirect direto no mobile
            window.location.href = authUrl;
            return;
        }

        // Popup no desktop
        const width = 500;
        const height = 830;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            authUrl,
            'Discord Login',
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
            ref={buttonRef}
            className={styles.button}
            onClick={handleLogin}
            disabled={isLoading}
            style={customStyle}
        >
            <img style={{ objectFit: "unset" }} ref={iconRef} className={styles.icon} src='/assets/discord.svg' />
            <span className={styles.text} style={isError.error ? { color: "red" } : {}}>
                {
                    isError.error ? `Erro: ${isError.reason}` : (isLoading ? 'Entrando...' : 'Entrar com Discord')
                }
            </span>
        </button>
    );
}