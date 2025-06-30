import styles from "@/components/popups/DisplayPopup.module.css"

//import popups
import PremiumRequired from "./PremiumRequired";
import Error from "./Error";
import NotImplementedYet from "./NotImplementedYet";
import Success from "./Success";
import Generic from "./Generic";

export default function DisplayPopup({ showingPopup, popupDivRef, closePopup }) {

    // Mapeamento de popups para componentes
    const popupComponents = {
        "premium_required": <PremiumRequired closePopup={closePopup} {...showingPopup?.settings} />,
        "error": <Error closePopup={closePopup} {...showingPopup?.settings} />,
        "not_implemented_yet": <NotImplementedYet closePopup={closePopup} {...showingPopup?.settings} />,
        "success": <Success closePopup={closePopup} {...showingPopup?.settings} />,
        "generic": <Generic closePopup={closePopup} {...showingPopup?.settings} />,
        // Adicione outros popups aqui
    };
    
    return (
        <>
            {showingPopup?.popupType && (
                <section className={styles.popups}>
                    <div ref={popupDivRef} className={styles.popup}>
                        {popupComponents[showingPopup.popupType] || null}
                        {
                            showingPopup.settings?.timeout &&
                            (setTimeout(() => {
                                closePopup()
                            }, showingPopup.settings.timeout))
                        }
                    </div>
                </section>
            )}
        </>
    )
}