import DisplayPopup from "@/components/popups/DisplayPopup";
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

// Context com valor padrão mais explícito
const PopupContext = createContext({
    showingPopup: null,
    setShowingPopup: () => { },

    /**
     * Exibe um pop-up focalizado na tela atual
     * @param {string} popupType - O popup que será exibido 
     * @param {Object} settings - Passagem de propriedades pro pop-up
     */
    openPopup: () => { },

    /**
     * Fechar popup sendo exibido no momento
     */
    closePopup: () => { },
});

PopupContext.displayName = "PopupContext"

export default function PopupProvider({ children }) {
    const [showingPopup, setShowingPopup] = useState(null);
    const popupDivRef = useRef(null);

    //fecha se apertar ESC ou clicar fora
    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                return closePopup(null)
            }
        })

        function handleClickOutside(event) {
            if (popupDivRef.current && !popupDivRef.current.contains(event.target)) {
                closePopup();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, []);

    // Funções auxiliares para melhor UX
    const openPopup = useCallback((popupType, settings) => {
        setShowingPopup({ popupType, settings });
    }, []);

    const closePopup = useCallback(() => {
        setShowingPopup(null);
    }, []);

    return (
        <PopupContext.Provider value={{
            showingPopup,
            setShowingPopup,
            openPopup,
            closePopup,
        }}>
            <DisplayPopup showingPopup={showingPopup} popupDivRef={popupDivRef} closePopup={closePopup} />
            {children}
        </PopupContext.Provider>
    );
}

// Hook melhorado com verificação de contexto
export const usePopup = () => {
    const context = useContext(PopupContext);

    if (!context) {
        throw new Error("usePopup deve ser usado dentro de um PopupProvider");
    }

    return context;
};