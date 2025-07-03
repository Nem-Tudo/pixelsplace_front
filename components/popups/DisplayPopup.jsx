import styles from "@/components/popups/DisplayPopup.module.css"

//import popups
import PremiumRequired from "./PremiumRequired";
import Error from "./Error";
import NotImplementedYet from "./NotImplementedYet";
import Success from "./Success";
import Generic from "./Generic";
import Confirm from "./Confirm";
import AdminBuildAdd from "./admin/BuildAdd";
import AdminColorAdd from "./admin/ColorAdd";
import AdminFlagAdd from "./admin/FlagAdd";
import AdminKick from "./admin/Kick";

export default function DisplayPopup({ showingPopup, popupDivRef, closePopup }) {

    // Mapeamento de popups para componentes
    const popupComponents = {
        "premium_required": <PremiumRequired closePopup={closePopup} {...showingPopup?.settings} />,
        "error": <Error closePopup={closePopup} {...showingPopup?.settings} />,
        "not_implemented_yet": <NotImplementedYet closePopup={closePopup} {...showingPopup?.settings} />,
        "success": <Success closePopup={closePopup} {...showingPopup?.settings} />,
        "generic": <Generic closePopup={closePopup} {...showingPopup?.settings} />,
        "confirm": <Confirm closePopup={closePopup} {...showingPopup?.settings} />,
        "admin_build_add": <AdminBuildAdd closePopup={closePopup} {...showingPopup?.settings} />,
        "admin_color_add": <AdminColorAdd closePopup={closePopup} {...showingPopup?.settings} />,
        "admin_flag_add": <AdminFlagAdd closePopup={closePopup} {...showingPopup?.settings} />,
        "admin_kick": <AdminKick closePopup={closePopup} {...showingPopup?.settings} />,
    };
    
    showingPopup?.settings?.timeout &&
    (setTimeout(() => {
        closePopup()
    }, showingPopup.settings.timeout))

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