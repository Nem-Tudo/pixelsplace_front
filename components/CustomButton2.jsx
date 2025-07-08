import { useEffect, useRef } from 'react';
import Link from "next/link";
import styles from "@/components/CustomButton.module.css";
import { darkenHex, getBrightness } from "@/src/colorFunctions";
import PixelIcon from '@/components/PixelIcon';
import { useAuth } from "@/context/AuthContext";
import { usePopup } from "@/context/PopupContext";

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
    premium = false,
    ...props
}) {
    const ref = useRef();
    const importances = [styles.primary, styles.secondary, styles.tertiary];
    const paddings = [styles.lowestPadding, styles.lowerPadding, styles.regularPadding];

    const { loggedUser } = useAuth();
    const { openPopup } = usePopup();

    const isPremium = loggedUser?.premium || false;

    useEffect(() => {
        if (ref.current && color) {
            const el = ref.current;
            el.style.setProperty('--btn-color', color);
            el.style.setProperty('--btn-color-hover', darkenHex(color, 30));
            if (hierarchy == 1)
                el.style.setProperty(`--btn-text`, ['var(--btn-text-light)', 'var(--btn-text-dark)'][Math.round(getBrightness(color)/1.01)]);
            if (hierarchy == 1 || hierarchy == 2)
                el.style.setProperty(`--btn-text-hover`, ['var(--btn-text-light)', 'var(--btn-text-dark)'][Math.round(getBrightness(darkenHex(color, 30))/1.01)]);
        }
    }, [color]);

    const className = [
        styles.button,
        importances[hierarchy - 1],
        paddings[padding - 1],
        premium && !isPremium ? "premiumOnly" : "",
        props.className || ''
    ].join(' ');

    const handleClick = (e) => {
        if (disabled) return;

        if (premium && !isPremium) {
            e.preventDefault();
            openPopup("premium_required");
            return;
        }

        if (onClick) onClick(e);
    };

    const sharedProps = {
        ...props,
        ref,
        disabled,
        className,
        style: props.style || {},
    };

    const content = <>
        {icon ? <PixelIcon codename={icon}/> : null}
        {label}
        {children}
        {premium && !isPremium && <div className="glassEffect" />}
    </>;

    if (!href && !onClick) {
        return <button {...sharedProps}>{content}</button>;
    } else if (!onClick) {
        return <Link {...sharedProps} href={href} onClick={handleClick}>{content}</Link>;
    } else if (!href) {
        return <button {...sharedProps} onClick={handleClick}>{content}</button>;
    } else {
        return <Link {...sharedProps} href={href} onClick={handleClick}>{content}</Link>;
    }
}
