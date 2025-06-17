// PremiumButton.jsx
import Link from 'next/link';

export default function PremiumButton({ setClass , as: Component = 'button', href, children, ...props }) {
  // Caso seja o Link do Next.js
  if (Component === Link) {
    return (
      <Component href={href} className={"premiumOnly "+setClass} {...props}>
        <div className="glassEffect" />
        {children}
      </Component>
    );
  }

  // Para 'button', 'a' ou outros componentes
  return (
    <Component className={"premiumOnly "+setClass} href={href} {...props}>
      <div className="glassEffect" />
      {children}
    </Component>
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

*/}