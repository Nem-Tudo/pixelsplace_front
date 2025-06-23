import styles from "./Button.module.css";

export default function Button({ label = 'Botão', href = undefined, hue = 207.04, on_click = undefined, hierarchy = 1 }) {
    let importances = ['', styles.primary, styles.secondary, styles.tertiary];

    if(href == undefined && on_click == undefined) { // botão não tem href nem clique
        return <button className={styles.btn+importances[hierarchy]} data-hue={hue}>{label}</button>
    } else if(on_click == undefined) { // tem href e não tem clique
        return <a className={styles.btn+importances[hierarchy]} data-hue={hue} href={href}>{label}</a>
    } else if(href == undefined) { // tem clique e não tem href
        return <button className={styles.btn+importances[hierarchy]} data-hue={hue} onClick={() => on_click()}>{label}</button>
    } else { // tem href e tem clique
        return <a className={styles.btn+importances[hierarchy]} data-hue={hue} href={href} onClick={() => on_click()}>{label}</a>
    }
}
