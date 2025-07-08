// PremiumButton.jsx
import Link from 'next/link';
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./CustomButton.module.css";
import { usePopup } from '@/context/PopupContext';
import { darkenHex, getBrightness } from "@/src/colorFunctions";

export default function PremiumButton({ 
  setStyle, 
  setClass = "", 
  onClick, 
  redirect, 
  as: Component = 'button', 
  href, 
  icon, 
  color = '#0075d5', 
  children, 
  ...props 
}) {
  const { loggedUser } = useAuth();

  const { openPopup } = usePopup()

  const handleClick = (event) => {
    if (loggedUser?.premium || redirect) {
      if (onClick) onClick(event);
    } else {
      event.preventDefault();
      openPopup("premium_required");
    }
  };

  // useEffect(() => {
  //   console.log(loggedUser);
  // },[])

  // avatar: "3b1a8bd0e926cab98eeef77f5fcd1c45"
  // createdAt : "2025-06-05T15:55:59.953Z"
  // flags : ['ADMIN']
  // id : "385478022670843904"
  // lastPaintPixel : "2025-06-20T01:06:08.084Z"
  // premium : false
  // updatedAt : "2025-06-20T01:06:08.085Z"
  // username : "commandbat"

  let buttonStylePrimary = {};
  let buttonStyleSecondary = {};

  if(color) {
    buttonStylePrimary['--btn-color'] = color;
    buttonStylePrimary['--btn-color-hover'] = darkenHex(color, 30);
    buttonStyleSecondary['--btn-color'] = color;
    buttonStyleSecondary['--btn-color-hover'] = darkenHex(color, 30);
    buttonStylePrimary[`--btn-text`] = ['var(--color-text-light)', 'var(--color-text-dark)'][Math.round(getBrightness(color)/1.01)];
    buttonStylePrimary[`--btn-text-hover`] = ['var(--color-text-light)', 'var(--color-text-dark)'][Math.round(getBrightness(darkenHex(color, 30))/1.01)];
    buttonStyleSecondary[`--btn-text-hover`] = ['var(--color-text-light)', 'var(--color-text-dark)'][Math.round(getBrightness(darkenHex(color, 30))/1.01)];
  }
  

  // Caso seja o Link do Next.js
  if (Component === Link) {
    if (loggedUser?.premium) return (
      <>
        <Component className={[styles.button, styles.secondary, styles.regularPadding, setClass].join(' ')} href={href} onClick={handleClick} {...props} style={buttonStyleSecondary}>
          {children}
        </Component>
      </>
    );
    return (
      <>
        <Component href={href} className={[styles.button, styles.primary, styles.regularPadding, "premiumOnly", setClass].join(' ')} onClick={handleClick} {...props} style={buttonStylePrimary}>
          <div className="glassEffect" />
          {children}
        </Component>
      </>
    );
  }

  if (Component === "icon") {
    const clonedIcon = React.cloneElement(icon, {
      onClick: loggedUser?.premium ? icon.props.onClick : () => openPopup("premium_required"),
    });

    return (
      <>
        {clonedIcon}
      </>
    );
  }

  // Para 'button', 'a' ou outros componentes
  if (loggedUser?.premium) return (
    <>
      <Component className={[styles.button, styles.secondary, styles.regularPadding, setClass].join(' ')} href={href} onClick={handleClick} {...props} style={buttonStyleSecondary}>
        {children}
      </Component>
    </>
  );
  return (
    <>
      <Component className={[styles.button, styles.primary, styles.regularPadding, "premiumOnly", setClass].join(' ')} href={href} onClick={handleClick} {...props} style={buttonStylePrimary}>
        <div className="glassEffect" />
        {children}
      </Component>
    </>
  );
}



{/*
//* <button/>:
<PremiumButton setClass={styles.btn} onClick={() => alert("NT viado")}>
  Histórico
</PremiumButton>

//* <a/>:
<PremiumButton setClass={styles.btn} as="a" href="https://commandbat.com.br">
  Ir para o site
</PremiumButton>

//* <link/>
<PremiumButton setClass={styles.btn} as={Link} href="https://commandbat.com.br">
  Ir para o site
</PremiumButton>

//* icon
<PremiumButton as="icon" icon={ <icon style={} onClick={() => alert()}/> }></PremiumButton>

//* redirect
<PremiumButton setClass={styles.button} as={Link} redirect={true} href="/premium">
  bypass premium, go to link 
</PremiumButton>
*/}