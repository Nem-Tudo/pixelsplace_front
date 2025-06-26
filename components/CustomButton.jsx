import { useEffect, useRef } from 'react';
import Link from "next/link";
import styles from "./CustomButton.module.css";
import { darkenHex } from "@/src/colorFunctions";
import PixelIcon from '@/components/PixelIcon';

export default function CustomButton({
    children,
    label = '',
    href = undefined,
    color = '#0076d6',
    onClick = undefined,
    hierarchy = 1,
    disabled = false,
    icon,
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
        return <button {...sharedProps} {...props} className={className}>{icon ? <PixelIcon codename={icon}/> : ''}{label}{children}</button>;
    } else if (onClick === undefined) {                    // com link e sem click
        return <Link {...sharedProps} {...props} className={className} href={href}>{icon ? <PixelIcon codename={icon}/> : ''}{label}{children}</Link>;
    } else if (href === undefined) {                        // sem link e com click
        return <button {...sharedProps} {...props} className={className} onClick={() => onClick()}>{icon ? <PixelIcon codename={icon}/> : ''}{label}{children}</button>;
    } else {                                                // com link e com click
        return <Link {...sharedProps} {...props} className={className} href={href} onClick={() => onClick()}>{icon ? <PixelIcon codename={icon}/> : ''}{label}{children}</Link>;
    }
}