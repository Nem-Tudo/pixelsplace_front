import { useState } from "react";
import styles from "./Failure.module.css"
import { MdExpandMore, MdExpandLess } from "react-icons/md";

export default function Failure({ children, type, expand, centerscreen = false }) {

    const [expanded, setExpanded] = useState(false)

    return <div className={`${centerscreen ? styles.centerscreen : ""}`}>
        <div className={`${styles.messageDiv} ${styles[type]}`}>
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
