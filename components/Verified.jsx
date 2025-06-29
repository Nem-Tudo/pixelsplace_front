import styles from "./Verified.module.css"
import PixelIcon from "@/components/PixelIcon"
import Tippy from "@tippyjs/react";
import { useLanguage } from '@/context/LanguageContext';

export default function Verified({ verified }) {
    const { language } = useLanguage();

    return verified ? 
        <Tippy content={language.getString("COMMON.VERIFIED")} placement="top">
            <PixelIcon codename={'check'} className={styles.verified} /> 
        </Tippy>
    : <></>
}