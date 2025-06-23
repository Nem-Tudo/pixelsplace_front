import { useEffect, useRef } from 'react';
import styles from "./Button.module.css";

export default function Button({
    label = 'Botão',
    href = undefined,
    hue = 207.04,
    on_click = undefined,
    hierarchy = 1
}) {
    const ref = useRef();
    const importances = ['', ' ' + styles.primary, ' ' + styles.secondary, ' ' + styles.tertiary];

    useEffect(() => {
        if (ref.current) {
            const el = ref.current;
            el.style.setProperty('--btn-color', `hsl(${hue}, 100%, 41.76%)`);
            el.style.setProperty('--btn-color-hover', `hsl(${hue}, 100%, 31.76%)`);
        }
    }, [hue]);

    const className = styles.btn + importances[hierarchy];

    const sharedProps = {
        ref,
        className,
        'data-hue': hue
    };

    if (href === undefined && on_click === undefined) {     // sem link e sem click
        return <button {...sharedProps}>{label}</button>;
    } else if (on_click === undefined) {                    // com link e sem click
        return <a {...sharedProps} href={href}>{label}</a>;
    } else if (href === undefined) {                        // sem link e com click
        return <button {...sharedProps} onClick={() => on_click()}>{label}</button>;
    } else {                                                // com link e com click
        return <a {...sharedProps} href={href} onClick={() => on_click()}>{label}</a>;
    }
}
