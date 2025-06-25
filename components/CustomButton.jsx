import { useEffect, useRef } from 'react';
import Link from "next/link";
import styles from "./CustomButton.module.css";
import { darkenHex } from "@/src/colorFunctions";

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

    useEffect(() => {
        if (ref.current) {
            const el = ref.current;

            el.style.setProperty('--btn-color', color);
            el.style.setProperty('--btn-color-hover', darkenHex(color, 30));
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