import styles from "@/components/popups/DisplayPopup.module.css"

//import popups
import PremiumRequired from "@/components/popups/PremiumRequired";
import Error from "@/components/popups/Error";
import NotImplementedYet from "@/components/popups/Error";

export default function DisplayPopup({ showingPopup, popupDivRef, closePopup }) {

    // Mapeamento de popups para componentes
    const popupComponents = {
        "premium_required": <PremiumRequired closePopup={closePopup} {...showingPopup?.settings} />,
        "error": <Error closePopup={closePopup} {...showingPopup?.settings} />,
        "not_implemented_yet": <NotImplementedYet closePopup={closePopup} {...showingPopup?.settings} />,
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