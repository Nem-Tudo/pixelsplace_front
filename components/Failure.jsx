import styles from "./Failure.module.css";
import PixelIcon from "@/components/PixelIcon";

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
