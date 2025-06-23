import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import styles from "./Button.module.css";

export function Button({ label, href = undefined }) {
    if(href == undefined) {
        return <button className={styles.btn}>{label}</button>
    } else {
        return <a className={styles.btn} href={href}>{label}</a>
    };
}
