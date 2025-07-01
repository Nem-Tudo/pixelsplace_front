import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import { useLanguage } from '@/context/LanguageContext';
import { usePopup } from '@/context/PopupContext';
import { hexToNumber } from '@/src/colorFunctions';

export default function AdminColorAdd({ closePopup, freeColors, setFreeColors }) {
    const { language } = useLanguage();
    const { openPopup } = usePopup();

    const [color, setColor] = useState("#000000");

    const handleSubmit = (e) => {
        e.preventDefault();

        const number = hexToNumber(color);

        if (isNaN(number)) {
            openPopup("error", { message: "Cor inválida: NaN" });
            return;
        }
        if (number < 0) {
            openPopup("error", { message: "Cor inválida: número menor que 0" });
            return;
        }
        if (number > 16777215) {
            openPopup("error", { message: "Cor inválida: número maior que 16777215" });
            return;
        }

        const newColors = [...freeColors, number];
        setFreeColors(newColors);

        openPopup("success", { message: "Cor adicionada com sucesso." });
        closePopup();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1 className={styles.title}>
                <PixelIcon codename="paint-bucket" />
                {'Adicionar cor gratuita'}
            </h1>

            <main className={styles.scrollable}>
                <input
                    type="color"
                    id="adminColorAdd_color"
                    name="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                    style={{width: '-webkit-fill-available'}}
                />
            </main>

            <footer className={styles.footer}>
                <CustomButton
                    label="Cancelar"
                    hierarchy={3}
                    color="#636363"
                    onClick={() => closePopup()}
                />
                <CustomButton
                    label="Adicionar"
                    type="submit"
                />
            </footer>
        </form>
    );
}
