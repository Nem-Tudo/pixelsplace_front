import { useEffect, useRef } from 'react';
import Link from "next/link";
import styles from "./CustomButton.module.css";

export default function CustomButton({
    children,
    label = 'Botão',
    href = undefined,
    color = '#3b82f6', // Cor padrão em hex (azul)
    onClick = undefined,
    hierarchy = 1,
    disabled = false,
    ...props
}) {
    const ref = useRef();
    const importances = [styles.primary, styles.secondary, styles.tertiary];

    // Função para escurecer uma cor hex
    const darkenHex = (hex, amount = 20) => {
        // Remove o # se presente
        hex = hex.replace('#', '');

        // Converte para RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Escurece cada componente
        const newR = Math.max(0, r - amount);
        const newG = Math.max(0, g - amount);
        const newB = Math.max(0, b - amount);

        // Converte de volta para hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };

    useEffect(() => {
        if (ref.current) {
            const el = ref.current;

            // Define a cor principal
            el.style.setProperty('--btn-color', color);

            // Define a cor de hover (mais escura)
            const hoverColor = darkenHex(color, 30);
            el.style.setProperty('--btn-color-hover', hoverColor);
        }
    }, [color]);

    const className = [
        styles.btn,
        importances[hierarchy - 1],
        props.className || ''
    ].join(' ');

    const sharedProps = {
        ref,
        'data-hex': color,
        disabled,
        ...props
    };

    if (href === undefined && onClick === undefined) {     // sem link e sem click
        return <button {...sharedProps} {...props} className={className}>{label}{children}</button>;
    } else if (onClick === undefined) {                    // com link e sem click
        return <Link {...sharedProps} {...props} className={className} href={href}>{label}{children}</Link>;
    } else if (href === undefined) {                        // sem link e com click
        return <button {...sharedProps} {...props} className={className} onClick={() => onClick()}>{label}{children}</button>;
    } else {                                                // com link e com click
        return <Link {...sharedProps} {...props} className={className} href={href} onClick={() => onClick()}>{label}{children}</Link>;
    }
}