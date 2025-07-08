import styles from "@/components/popups/DisplayPopup.module.css"

// Popups
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
import FactionDelete from "./faction/Delete"

/**
 * Função padrão para exibir pop-ups usando o contexto
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {JSON} properties.showingPopup - Propriedades do pop-up
 * @param {string} properties.popupDivRef - Div de referência onde o pop-up será exibido
 * @param {string} properties.closePopup - Código de fechamento do pop-up
 */
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
        "faction_delete": <FactionDelete closePopup={closePopup} {...showingPopup?.settings} />,
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