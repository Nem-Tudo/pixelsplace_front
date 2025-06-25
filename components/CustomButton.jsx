import { useEffect, useRef } from 'react';
import Link from "next/link";
import styles from "./CustomButton.module.css";
import { darkenHex } from "@/src/colorFunctions";

export default function CustomButton({
    children,
    label = 'Botão',
    href = undefined,
    color = '#0076d6',
    onClick = undefined,
    hierarchy = 1,
    disabled = false,
    icon = '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M2 5h20v14H2V5zm2 2v2h16V7H4zm16 4H4v2h16v-2zm0 4H4v2h16v-2z" fill="currentColor"/> </svg>',
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
        return <button {...sharedProps} {...props} className={className}>{eval(icon)}{label}{children}</button>;
    } else if (onClick === undefined) {                    // com link e sem click
        return <Link {...sharedProps} {...props} className={className} href={href}>{eval(icon)}{label}{children}</Link>;
    } else if (href === undefined) {                        // sem link e com click
        return <button {...sharedProps} {...props} className={className} onClick={() => onClick()}>{eval(icon)}{label}{children}</button>;
    } else {                                                // com link e com click
        return <Link {...sharedProps} {...props} className={className} href={href} onClick={() => onClick()}>{eval(icon)}{label}{children}</Link>;
    }
}