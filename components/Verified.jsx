import { MdVerified } from "react-icons/md"

import styles from "./Verified.module.css"

export default function Verified({ verified }) {
    if (!verified) return <></>
    return (
        <>
            <MdVerified className={styles.verified} />
        </>
    )
}