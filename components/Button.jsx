import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import styles from "./Button.module.css";

export default function Button({ label = 'Botão', href = undefined, hue = '#7289da' }) { // 207.04
    if(href == undefined) {
        return <button className={styles.btn} data-cor={hue}>{label}</button>
    } else {
        return <a className={styles.btn} data-cor={hue} href={href}>{label}</a>
    };
}
