// PremiumButton.jsx
import Link from 'next/link';

export default function PremiumButton({ as: Component = 'button', href, children, ...props }) {
  // Caso seja o Link do Next.js
  if (Component === Link) {
    return (
      <Component href={href} className="premiumOnly" {...props}>
        <div className="glassEffect" />
        {children}
      </Component>
    );
  }

  // Para 'button', 'a' ou outros componentes
  return (
    <Component className="premiumOnly" href={href} {...props}>
      <div className="glassEffect" />
      {children}
    </Component>
  );
}



{/*
//* <button/>:
<PremiumButton onClick={() => alert("NT viado")}>
  Histórico
</PremiumButton>

//* <a/>:
<PremiumButton as="a" href="https://commandbat.com.br">
  Ir para o site
</PremiumButton>
*/}