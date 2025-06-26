import settings from "@/settings";
import updateStateKey from "@/src/updateStateKey";
import { parseCookies } from "nookies";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    const [stressTestCount, setStressTestCount] = useState(0);

    const cookies = parseCookies();

    let uid = null;
    let utoken = null;

    useEffect(() => {
        updateUser()
        stressTest()
    }, []);


    async function updateUser() {
        const token = cookies.authorization;
        setToken(token)

        if (!token) {
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
            setLoading(false);
            uid = user.id;
            utoken = token;
        } catch (err) {
            console.log("Erro ao buscar usuário:", err);
            setUser(null);
            return setLoading(false);
        }
    }


    let count = 0;
    async function stressTest() {
        const [request, request2] = await Promise.all([
            fetch(`${settings.apiURL}/canvas/pixels?id=${uid}`),
            fetch(`${settings.apiURL}/canvas/pixel?id=${uid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": utoken
                },
                body: JSON.stringify({
                    x: randomIntFromInterval(123, 138),
                    y: randomIntFromInterval(59, 68),
                    c: randomIntFromInterval(1, 16777214)
                })
            })
        ]);
        const response = await request.arrayBuffer();
        const response2 = await request2.arrayBuffer();
        console.log(request, response, response2);
        count++;
        setStressTestCount(count)
        socket();

        setTimeout(() => {
            stressTest()
        }, 50)
    }

    async function socket() {
        console.log("socket")
        io(settings.socketURL, {
            auth: {
                token: utoken // Usa o token do cookie
            }
        })
    }

    function updateUserKey(...changes) {
        updateStateKey(setUser, user, ...changes)
    }

    return (
        <AuthContext.Provider value={{ loggedUser: user, loading, token, setUser, updateUserKey, stressTestCount }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

function generateRandomString(count) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < count; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}