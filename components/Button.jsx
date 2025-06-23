import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import styles from "./Button.module.css";

export default function Button({ href = undefined }) {
    if(href == undefined) {
        return <button className={styles.btn}></button>
    } else {
        return <a className={styles.btn} href={href}></a>
    };
}
