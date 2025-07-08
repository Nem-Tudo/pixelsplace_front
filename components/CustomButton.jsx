import { useEffect, useRef } from 'react';
import Link from "next/link";
import styles from "@/components/CustomButton.module.css";
import { darkenHex, getBrightness } from "@/src/colorFunctions";
import PixelIcon from '@/components/PixelIcon';

/**
 * Botão personalizado, em substituição ao button nativo
 * @param {Object} properties - Passagem de propriedades pro botão
 * @param {JSX.Element} [properties.children] - Elementos internos do botão (opcional)
 * @param {string} [properties.label] - Texto principal do botão (opcional)
 * @param {string} [properties.href] - Link que o botão redireciona (opcional)
 * @param {string} [properties.color] - Código hexadecimal da cor do botão (opcional)
 * @param {() => {}} [properties.onClick] - Função executada ao clicar no botão (opcional)
 * @param {number} [properties.hierarchy] - Botão primário (1), secundário (2) ou terciário (3) (opcional)
 * @param {number} [properties.padding] - Nível de padding do botão (opcional)
 * @param {boolean} [properties.disabled] - Botão desabilitado ou habilitado (opcional)
 * @param {string} [properties.icon] - Codinome do ícone (PixelIcon) do botão (opcional)
 * @param {any} [properties.props] - Outras propriedades HTML (opcional)
 */
export default function CustomButton({
    children,
    label = '',
    href = undefined,
    color,
    onClick = undefined,
    hierarchy = 1,
    padding = 3,
    disabled = false,
    icon,
    ...props
}) {
    const ref = useRef();
    const importances = [styles.primary, styles.secondary, styles.tertiary];
    const paddings = [styles.lowestPadding, styles.lowerPadding, styles.regularPadding];

    useEffect(() => {
        if (ref.current && color) {
            const el = ref.current;
            el.style.setProperty('--btn-color', color);
            el.style.setProperty('--btn-color-hover', darkenHex(color, 30));
            hierarchy==1 && el.style.setProperty(`--btn-text`, ['var(--color-text-light)', 'var(--color-text-dark)'][Math.round(getBrightness(color)/1.01)]);
            (hierarchy==1 || hierarchy==2) && el.style.setProperty(`--btn-text-hover`, ['var(--color-text-light)', 'var(--color-text-dark)'][Math.round(getBrightness(darkenHex(color, 30))/1.01)]);
        }
    }, [color]);

    const className = [
        styles.button,
        importances[hierarchy - 1],
        paddings[padding - 1],
        props.className || ''
    ].join(' ');

    const sharedProps = {
        ...props,
        ref,
        disabled,
        className
    };

    if (href === undefined && onClick === undefined) {     // sem link e sem click
        return <button {...sharedProps}>{icon ? <PixelIcon codename={icon}/> : ''}{label}{children}</button>;
    } else if (onClick === undefined) {                    // com link e sem click
        return <Link {...sharedProps} href={href}>{icon ? <PixelIcon codename={icon}/> : ''}{label}{children}</Link>;
    } else if (href === undefined) {                        // sem link e com click
        return <button {...sharedProps} onClick={() => onClick()}>{icon ? <PixelIcon codename={icon}/> : ''}{label}{children}</button>;
    } else {                                                // com link e com click
        return <Link {...sharedProps} href={href} onClick={() => onClick()}>{icon ? <PixelIcon codename={icon}/> : ''}{label}{children}</Link>;
    }
}