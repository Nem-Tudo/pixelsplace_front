import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import styles from "./Button.module.css";

export function Button({ href = undefined, children }) {
    if(href == undefined) {
        return <button className={styles.btn}>{children}</button>
    } else {
        return <a className={styles.btn} href={href}>{children}</a>
    };
}
