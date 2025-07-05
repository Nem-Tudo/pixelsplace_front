import styles from "./Billboard.module.css"

/**
 * Exibe um conteúdo centralizado e enfatizado
 * @param {Object} properties - Passagem de propriedades pro componente
 * @param {JSX.Element} properties.children - Elementos para a centralização
 */
export default function Billboard({ children }) {

    return (
        <main id={styles.main}>
            {children}
        </main>
    )
}