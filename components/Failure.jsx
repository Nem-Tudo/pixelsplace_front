import { useState } from "react";
import styles from "./Failure.module.css";
import PixelIcon from "@/components/PixelIcon";

export default function Failure({ children, message="" }) {

    const [expanded, setExpanded] = useState(false)

    return <main id={styles.main}>
        <PixelIcon codename={'alert'} />
        <h1>Sentimos muito...</h1>
        <p>Um erro impossibilitou o carregamento da página.</p>
        {children}
    </main>
}
