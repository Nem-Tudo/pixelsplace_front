import updateStateKey from "@/src/updateStateKey";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from 'js-cookie';
import settings from "@/settings";

const AuthContext = createContext({
    loggedUser: null,
    loading: true,
    token: null,
    provider: null,
    setUser: () => { },
    updateStateKey: () => { },
    fetchWithAuth: async () => { },
    refreshUser: () => { },
    logout: () => { }
});

AuthContext.displayName = "AuthContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [provider, setProvider] = useState(null);

    useEffect(() => {
        refreshUser();
    }, []);

    async function refreshUser() {
        const token = Cookies.get("authorization");
        setToken(token);

        if (!token) {
            setProvider(null);
            setUser(null);
            return setLoading(false);
        }

        try {
            const res = await fetch(`${settings.apiURL}/users/@me`, {
                headers: {
                    authorization: token
                }
            }).catch(() => { });

            if (!res.ok) {
                setUser(null);
                return setLoading(false);
            }

            const user = await res.json();
            setUser(user);
            setProvider(Cookies.get("auth_provider"));
            setLoading(false);
        } catch (err) {
            console.log("Erro ao buscar usuário:", err);
            setUser(null);
            setProvider(null);
            return setLoading(false);
        }
    }

    function updateUserKey(...changes) {
        updateStateKey(setUser, user, ...changes);
    }

    function fetchWithAuth(path, options = {}) {
        if (!options.headers) options.headers = {};
        options.headers['authorization'] = token;
        options.headers['Content-Type'] = "application/json";

        if (typeof options.body != "string") options.body = JSON.stringify(options.body);

        return fetch(`${settings.apiURL}${path}`, options);
    }

    function logout() {
        Cookies.remove("authorization");
        Cookies.remove("auth_provider");
        setUser(null);
        setToken(null);
        setProvider(null);
        setLoading(false);
    }

    return (
        <AuthContext.Provider value={{ loggedUser: user, loading, token, setUser, updateUserKey, fetchWithAuth, refreshUser, logout, provider }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);