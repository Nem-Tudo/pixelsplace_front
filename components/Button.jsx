import { useEffect, useRef } from 'react';
import Link from "next/link";
import styles from "./Button.module.css";

export default function Button({
    label = 'Botão',
    href = undefined,
    hue = 207.04,
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
            if(hue < 0) {
                el.style.setProperty('--btn-color', `hsl(0, 0%, ${-hue}%)`);
            el.style.setProperty('--btn-color-hover', `hsl(0, 0%, ${-hue-10}%)`);
            } else {
                el.style.setProperty('--btn-color', `hsl(${hue}, 100%, 41.76%)`);
                el.style.setProperty('--btn-color-hover', `hsl(${hue}, 100%, 31.76%)`);
            }
        }
    }, [hue]);

    const className = [
        styles.btn,
        importances[hierarchy-1],
        props.className || ''
    ].join(' ');

    const sharedProps = {
        ref,
        'data-hue': hue,
        disabled,
        ...props
    };

    if (href === undefined && onClick === undefined) {     // sem link e sem click
        return <button {...sharedProps} {...props} className={className}>{label}</button>;
    } else if (onClick === undefined) {                    // com link e sem click
        return <Link {...sharedProps} {...props} className={className} href={href}>{label}</Link>;
    } else if (href === undefined) {                        // sem link e com click
        return <button {...sharedProps} {...props} className={className} onClick={() => onClick()}>{label}</button>;
    } else {                                                // com link e com click
        return <Link {...sharedProps} {...props} className={className} href={href} onClick={() => onClick()}>{label}</Link>;
    }
}
