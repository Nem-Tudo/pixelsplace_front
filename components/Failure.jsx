import styles from "./Failure.module.css";
import PixelIcon from "@/components/PixelIcon";

/**
 * Conteúdo da página se houver algum grande erro
 * @param {Object} properties - Passagem de propriedades pro componente
 * @param {JSX.Element} [properties.children] - Elementos para a linha de ações inferior da página (opcional)
 * @param {string} [properties.message] - Mensagem de erro (opcional)
 * @param {string} [properties.details] - Detalhes sobre o erro (opcional)
 */
export default function Failure({
    children,
    message="Um erro impossibilitou o carregamento da página.",
    details
}) {

    return <main id={styles.main}>

        <PixelIcon codename={'alert'} />

        <div>
            <h1>Sentimos muito...</h1>
            <p>{message}</p>
            {details && <h3>
                {details}
            </h3>}
        </div>

        <footer id={styles.actionRow}>
            {children}
        </footer>
    </main>
}
