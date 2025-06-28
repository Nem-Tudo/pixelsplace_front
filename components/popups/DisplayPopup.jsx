import styles from "./DisplayPopup.module.css"

//import popups
import PremiumPopup from "@/components/popups/PremiumPopup";


export default function DisplayPopup({ showingPopup, popupDivRef, closePopup }) {

    // Mapeamento de popups para componentes
    const popupComponents = {
        "required_premium": <PremiumPopup closePopup={closePopup} {...showingPopup?.settings} />,
        // Adicione outros popups aqui
    };


    return (
        <>
            {showingPopup?.popupType && (
                <section className={styles.popups}>
                    <div ref={popupDivRef} className={styles.popup}>
                        {popupComponents[showingPopup.popupType] || null}
                    </div>
                </section>
            )}
        </>
    )
}