import settings from "@/settings";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export async function getServerSideProps(context) {
    const { t } = context.query;

    return {
        props: { buildtoken: t },
    };
}

export default function BuildOverride({ buildtoken }) {

    const [pageMessage, setPageMessage] = useState("Loading build...");
    const [build, setBuild] = useState(null);
    const [tokenSignedBy, setTokenSignedBy] = useState(null);

    let loaded = false;
    useEffect(() => {
        if (loaded) return;
        loaded = true;

        if (buildtoken) {
            fetchBuild(buildtoken);
        } else {
            setPageMessage("Removing builds...");
            updateCookies(null);
        }
    }, [])

    async function fetchBuild(token) {
        if (!token || token === "main") {
            setPageMessage("Removing builds...");
            return updateCookies(null);
        }
        try {
            const request = await fetch(`${settings.apiURL}/builds/parsetoken/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: Cookies.get("authorization")
                },
            })
            if (request.status === 404) return setPageMessage("Invalid build");

            const response = await request.json();
            if (request.status != 200) return setPageMessage(response.message || "Error fetching build");
            setBuild(response.build);
            setTokenSignedBy(response.signedBy);

            if (response.build.forceOnLink) return updateCookies(token, response.build);
            setPageMessage("");

        } catch (error) {
            console.error('Error fetching branch:', error)
        }
    }

    async function updateCookies(token, data) {
        console.log("updating build...")
        if (token) {
            await fetch(`${settings.apiURL}/builds/${data.id}/newuse`, { method: "POST" })
            Cookies.set("active-build-token", token, { expires: 365, secure: true, sameSite: 'Lax' });
            Cookies.set("active-build-data", JSON.stringify(data), { expires: 365, secure: true, sameSite: 'Lax' });
        } else {
            Cookies.remove("active-build-token");
            Cookies.remove("active-build-data");
        }
        location.href = '/';
    }


    // ATENÇÃO!!! TODO O CSS DESSA PÁGINA DEVE SER INLINE!!!

    console.log(build)
    return (
        <>
            <span>{pageMessage}</span>
            {
                build && !build.forceOnLink && <div style={{ margin: "50px" }}>
                    <h1 style={{ fontWeight: "bold" }}>Deseja utilizar uma build customizada no PixelsPlace?</h1>
                    <br />
                    <span>Nome: <span style={{ color: "blue" }}>{build.name}</span></span>
                    <br />
                    <span>Autor: {build.author}</span>
                    <br />
                    <span>Assinada por: {tokenSignedBy}</span>
                    <br />
                    <br />
                    <button style={{ cursor: "pointer", background: "gray", color: "white", padding: "10px", marginRight: "5px" }} onClick={() => location.href = "/"}>Cancelar</button>
                    <button style={{ cursor: "pointer", background: "green", color: "white", padding: "10px" }} onClick={() => {
                        setPageMessage("Updating build...")
                        updateCookies(buildtoken, build)
                    }}>Utilizar</button>
                    <br />
                    <br />
                    <span>Caso você queira remover depois, basta clicar nas configurações do seu perfil</span>
                    <br />
                    <img src="/assets/removebuild.png" style={{ width: "190px" }} />
                </div>
            }
        </>
    )
}
