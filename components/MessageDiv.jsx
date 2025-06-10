import { useState } from "react";
import styles from "./MessageDiv.module.css"
import { MdExpandMore, MdExpandLess } from "react-icons/md";

export default function MessageDiv({ children, type, expand, centerscreen = false }) {

    const [expanded, setExpanded] = useState(false)

    return <div className={`${centerscreen ? styles.centerscreen : ""}`}>
        <div className={`${styles.messagediv} ${styles[type]}`}>
            <div className={styles.main}>
                <div className={styles.content}>
                    {children}
                </div>
                {
                    expand && !expanded && <div onClick={() => setExpanded(true)} className={styles.expand}><MdExpandMore color="white" /></div>
                }
                {
                    expand && expanded && <div onClick={() => setExpanded(false)} className={styles.expand}><MdExpandLess color="white" /></div>
                }
            </div>
            {
                expanded && expand
            }
        </div>
    </div>
}