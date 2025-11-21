import { CiCircleAlert } from "react-icons/ci";
import GoogleLogin from "../buttons/GoogleLogin";
import DiscordLogin from "../buttons/DiscordLogin";
import { useState } from "react";
import TwitterLogin from "../buttons/TwitterLogin";

import popupstyles from "@/components/popups/DisplayPopup.module.css";
import CustomButton from "../CustomButton";


/**
 * Pop-up genérico (em substituição da função nativa alert() do javascript)
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 * @param {string} properties.message - Mensagem a ser exibida pro usuário
 */
export default function SelectLogin({ closePopup }) {

    const [openingMethod, setOpeningMethod] = useState(null);

    // return (
    //     <>
    //         <h1 className={popupstyles.title}>
    //             <CiCircleAlert />
    //             Selecione o método de login
    //         </h1>

    //         <main className={popupstyles.scrollable} style={{ gap: "5px" }}>

    //             {/* <GoogleLogin
    //                 customStyle={
    //                     openingMethod === "google"
    //                         ? { opacity: 1, zIndex: 1, backgroundColor: "#e8e8e8" }
    //                         : openingMethod === "discord" || openingMethod === "twitter"
    //                             ? { marginBottom: "-53px" }
    //                             : {}
    //                 }
    //                 onUpdateLoading={(loading) => loading ? setOpeningMethod("google") : setOpeningMethod(null)}
    //             /> */}

    //             <DiscordLogin
    //                 customStyle={
    //                     openingMethod === "discord"
    //                         ? { opacity: 1, zIndex: 1, backgroundColor: "#e8e8e8" }
    //                         : {}
    //                 }
    //                 onUpdateLoading={(loading) => loading ? setOpeningMethod("discord") : setOpeningMethod(null)}
    //             />

    //             {/* <TwitterLogin
    //                 customStyle={
    //                     openingMethod === "twitter"
    //                         ? { opacity: 1, zIndex: 1, backgroundColor: "#e8e8e8" }
    //                         : openingMethod === "google" || openingMethod === "discord"
    //                             ? { marginTop: "-53px" }
    //                             : {}
    //                 }
    //                 onUpdateLoading={(loading) => loading ? setOpeningMethod("twitter") : setOpeningMethod(null)}
    //             /> */}

    //         </main>

    //         <footer className={popupstyles.footer}>
    //             <CustomButton label={"Cancelar"} hierarchy={3} color="#959595ff" onClick={() => closePopup()} />
    //         </footer>
    //     </>
    // );

    return (
        <>
            <h1 className={popupstyles.title}>
                <CiCircleAlert />
                Selecione o método de login
            </h1>

            <main className={popupstyles.scrollable} style={{ gap: "5px" }}>

                <GoogleLogin
                    customStyle={
                        openingMethod === "google"
                            ? { opacity: 1, zIndex: 1, backgroundColor: "#e8e8e8" }
                            : openingMethod === "discord" || openingMethod === "twitter"
                                ? { marginBottom: "-53px" }
                                : {}
                    }
                    onUpdateLoading={(loading) => loading ? setOpeningMethod("google") : setOpeningMethod(null)}
                />

                <DiscordLogin
                    customStyle={
                        openingMethod === "discord"
                            ? { opacity: 1, zIndex: 1, backgroundColor: "#e8e8e8" }
                            : openingMethod === "google"
                                ? { marginTop: "-53px" }
                                : openingMethod === "twitter"
                                    ? { marginBottom: "-53px" }
                                    : {}
                    }
                    onUpdateLoading={(loading) => loading ? setOpeningMethod("discord") : setOpeningMethod(null)}
                />

                <TwitterLogin
                    customStyle={
                        openingMethod === "twitter"
                            ? { opacity: 1, zIndex: 1, backgroundColor: "#e8e8e8" }
                            : openingMethod === "google" || openingMethod === "discord"
                                ? { marginTop: "-53px" }
                                : {}
                    }
                    onUpdateLoading={(loading) => loading ? setOpeningMethod("twitter") : setOpeningMethod(null)}
                />

            </main>

            <footer className={popupstyles.footer}>
                <CustomButton label={"Cancelar"} hierarchy={3} color="#959595ff" onClick={() => closePopup()} />
            </footer>
        </>
    );
}