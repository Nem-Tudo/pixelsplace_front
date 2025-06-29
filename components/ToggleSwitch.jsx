import styles from "@/components/ToggleSwitch.module.css";

export default function ToggleSwitch({ name, id, ...props }) {
    const className = [
        styles.toggleSwitch,
        props.className || ''
    ].join(' ');

    return <input type="checkbox" name={name} id={id} {...props} className={className} />
}