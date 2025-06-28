import styles from "@/components/popups/DisplayPopup.module.css"

//import popups
import PremiumRequired from "@/components/popups/PremiumRequired";


export default function DisplayPopup({ showingPopup, popupDivRef, closePopup }) {

    // Mapeamento de popups para componentes
    const popupComponents = {
        "premium_required": <PremiumRequired closePopup={closePopup} {...showingPopup?.settings} />,
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