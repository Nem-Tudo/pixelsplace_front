import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import { usePopup } from '@/context/PopupContext';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Pop-up de download do canvas
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 * @param {{}} properties.canvasRef - Referência do canvas
 * @param {() => {}} properties.downloadCanvasImage - Função de download
 */
export default function CanvasDownload({ closePopup, canvasRef, downloadCanvasImage }) {
    const { openPopup } = usePopup();

    const [multiplier, setMultiplier] = useState(10);

    const { language } = useLanguage();

    const handleSubmit = (e) => {
        e.preventDefault();
        downloadCanvasImage(canvasRef.current, `canvas-x${multiplier}-${Date.now()}.png`, multiplier);
        closePopup();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1 className={styles.title}>
                <PixelIcon codename="image" />
                {language.getString('POPUPS.CANVAS_DOWNLOAD.TITLE')}
            </h1>

            <main className={styles.scrollable}>
                <label htmlFor="canvasDownload_multiplier">{language.getString('POPUPS.CANVAS_DOWNLOAD.LABEL')}</label>
                <input
                    type="number"
                    id="canvasDownload_multiplier"
                    name="multiplier"
                    value={multiplier}
                    onChange={(e) => setMultiplier(Number(e.target.value))}
                    required
                />
            </main>

            <footer className={styles.footer}>
                <CustomButton
                    label={language.getString('COMMON.CANCEL')}
                    hierarchy={3}
                    color="#636363"
                    onClick={() => closePopup()}
                />
                <CustomButton
                    label={language.getString('COMMON.DOWNLOAD')}
                    icon='download'
                    type="submit"
                />
            </footer>
        </form>
    );
}
