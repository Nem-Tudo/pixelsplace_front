import { useState } from "react";
import styles from "./Failure.module.css"

export default function Failure({ children, title="", message="" }) {

    const [expanded, setExpanded] = useState(false)

    return <main id={styles.main}>
        {children}
    </main>
}
