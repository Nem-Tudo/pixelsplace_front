import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import styles from "./CustomButton.module.css";

export default function CustomButton({ href = undefined }) {
    if(href == undefined) {
        return <button className={styles.btn}></a>
    } else {
        return <a className={styles.btn} href={href}></button>
    };
}
