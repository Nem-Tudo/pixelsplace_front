import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import styles from "@/components/popups/DisplayPopup.module.css";
import localStyles from "@/components/popups/faction/Create.module.css";
import PixelIcon from "@/components/PixelIcon";
import ToggleSwitch from "@/components/ToggleSwitch";
import { usePopup } from '@/context/PopupContext';
import settings from "@/settings.js";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from '@/context/LanguageContext';
import updateStateKey from "@/src/updateStateKey";

/**
 * Pop-up administrativo de criação de nova Build baseada em uma branch do github
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 */
export default function FactionCreate({ closePopup }) {

    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [description, setDescription] = useState('');
    const [iconUrl, setIconUrl] = useState('');

    const { token, loggedUser } = useAuth();
    const { openPopup } = usePopup();
    const { language } = useLanguage();

    const [user, setUser] = useState(loggedUser);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const request = await fetch(`${settings.apiURL}/factions`, {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                "Authorization": token
                },
                body: JSON.stringify({ name, handle, description, icon_url: iconUrl })
            })

            const response = await request.json();

            if (!request.ok) {
                console.error(response, request)
                return openPopup("error", { message: `${response.message}` })
            }

            openPopup("success", { 
                message: `${language.getString("POPUPS.FACTION_CREATE.SUCCESS", { factionName: response.faction.name })}`,
                timeout: 1000,
                onTimeout: () => {location.href = `/faction/${response.faction.id}`},
            })
            updateStateKey(setUser, user, ["faction", response.faction], ["factionId", response.faction.id])

        } catch (err) {
            openPopup("error", { message: `${err.message}` });
        }
        
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1 className={styles.title}>
                <PixelIcon codename={'alert'} />
                {language.getString("POPUPS.FACTION_CREATE.TITLE")}
            </h1>

            <main className={[styles.scrollable, localStyles.main].join(' ')}>
                <div>
                    <label htmlFor="factionCreate_name">{language.getString("POPUPS.FACTION_CREATE.NAME")}</label>
                    <input
                        type="text"
                        name="name"
                        id="factionCreate_name"
                        placeholder={language.getString("POPUPS.FACTION_CREATE.NAME_PLACEHOLDER")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        minLength="4"
                        maxLength="100"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="factionCreate_handle">{language.getString("POPUPS.FACTION_CREATE.HANDLE")}</label>
                    <input
                        type="text"
                        name="handle"
                        id="factionCreate_handle"
                        value={"#"+handle}
                        minLength="2"
                        onChange={(e) => {
                            // Filtra apenas caracteres permitidos e converte para minúscula
                            const filteredValue = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                            setHandle(filteredValue);
                        }}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="factionCreate_description">{language.getString("POPUPS.FACTION_CREATE.DESCRIPTION")}</label>
                    <textarea 
                        name="description"
                        id="factionCreate_description"
                        placeholder={language.getString("POPUPS.FACTION_CREATE.DESCRIPTION_PLACEHOLDER")}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="factionCreate_iconUrl">{language.getString("POPUPS.FACTION_CREATE.ICON_URL")}</label>
                    <input
                        type="url"
                        name="iconUrl"
                        placeholder={language.getString("POPUPS.FACTION_CREATE.ICON_URL_PLACEHOLDER")}
                        pattern="https://.*"
                        id="factionCreate_iconUrl"
                        value={iconUrl}
                        onChange={(e) => setIconUrl(e.target.value)}
                        required
                    />
                </div>

                <div style={{flexDirection: 'row', alignItems: 'center'}}>
                    <label htmlFor="factionCreate_public">{language.getString("POPUPS.FACTION_CREATE.PUBLIC")}</label>
                    <ToggleSwitch
                        name="public"
                        id="factionCreate_public"
                        checked={false}
                    />
                </div>
                
            </main>

            <footer className={styles.footer}>
                <CustomButton
                    label={language.getString("COMMON.CANCEL")}
                    hierarchy={3}
                    color={'#636363'}
                    onClick={() => closePopup()}
                />
                <CustomButton
                    label={language.getString("COMMON.CREATE")}
                    type="submit"
                />
            </footer>
        </form>
    );
}
