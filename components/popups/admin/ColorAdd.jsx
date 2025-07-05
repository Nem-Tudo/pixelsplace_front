import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import { usePopup } from '@/context/PopupContext';
import { hexToNumber } from '@/src/colorFunctions';

/**
 * Pop-up administrativo de adição de nova cor gratuita
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 * @param {[]} properties.freeColors - Array atual de cores gratuitas
 * @param {() => {}} properties.setFreeColors - Função de setar cores gratuitas
 */
export default function AdminColorAdd({ closePopup, freeColors, setFreeColors }) {
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
                <PixelIcon codename="fill-half" />
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
