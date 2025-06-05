import settings from "@/settings";
import { parseCookies } from "nookies";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const cookies = parseCookies()

    useEffect(() => {
        updateUser()
    }, []);


    async function updateUser() {
        const token = cookies.authorization;

        if (!token) {
            setUser(null);
            return setLoading(false);
        }

        try {
            const res = await fetch(`${settings.apiURL}/users/@me`, {
                headers: {
                    authorization: token
                }
            });

            if (!res.ok) {
                setUser(null);
                return setLoading(false);
            }

            const user = await res.json();
            setUser(user);
            setLoading(false);
        } catch (err) {
            console.error("Erro ao buscar usuário:", err);
            setUser(null);
            return setLoading(false);
        }
    }

    return (
        <AuthContext.Provider value={{ loggedUser: user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
