import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import styles from "./Button.module.css";

export default function Button({ href = undefined }) {
    switch (href) {
        case undefined:
            return (
                <button className={styles.btn}></a>
            )
            break;
        default:
            return (
                <a className={styles.btn} href={href}></button>
            )
            break;
    }
}
