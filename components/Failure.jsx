import { useState } from "react";
import styles from "./Failure.module.css";
import PixelIcon from "@/components/PixelIcon";

export default function Failure({ children, message="Um erro impossibilitou o carregamento da página." }) {

    const [expanded, setExpanded] = useState(false)

    return <main id={styles.main}>

        <PixelIcon codename={'alert'} />

        <div>
            <h1>Sentimos muito...</h1>
            <p>{message}</p>
        </div>

        {children}
    </main>
}
