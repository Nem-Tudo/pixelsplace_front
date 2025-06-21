// PremiumButton.jsx
import Link from 'next/link';
import React, { useEffect, useState } from "react";
import PremiumWarning from "@/components/PremiumWarning";
import { useAuth } from "@/context/AuthContext";

  



export default function PremiumButton({ setStyle, setClass, onClick, redirect, as: Component = 'button', href, icon, children, ...props }) {
  const { loggedUser } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  const handleClick = (event) => {
  if (loggedUser?.premium || redirect) {
    if (onClick) onClick(event);
  } else {
    event.preventDefault();
    setShowWarning(true);
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

  // Caso seja o Link do Next.js
  if (Component === Link) {
    return (
      <>
        {showWarning && <PremiumWarning onClose={() => setShowWarning(false)} />}
      <Component href={href} className={"premiumOnly "+setClass} onClick={handleClick} {...props}>
        <div className="glassEffect" />
        {children}
      </Component>
      </>
    );
  }

  if (Component === "icon") {
  const clonedIcon = React.cloneElement(icon, {
    onClick: loggedUser?.premium ? icon.props.onClick : () => setShowWarning(true),
  });

  return (
    <>
      {showWarning && <PremiumWarning onClose={() => setShowWarning(false)} />}
      {clonedIcon}
    </>
  );
}

  // Para 'button', 'a' ou outros componentes
  return (
      <>
        {showWarning && <PremiumWarning onClose={() => setShowWarning(false)} />}
    <Component className={"premiumOnly "+setClass} href={href} onClick={handleClick} {...props}>
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