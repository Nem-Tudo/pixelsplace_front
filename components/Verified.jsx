import styles from "./Verified.module.css"
import PixelIcon from "@/components/PixelIcon"

export default function Verified({ verified }) {
    return verified ? <PixelIcon codename={'check'} className={styles.verified} /> : <></>
}