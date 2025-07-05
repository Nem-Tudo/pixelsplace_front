import styles from "@/components/ToggleSwitch.module.css";

/**
 * Toggle switch com a exata mesma funcionalidade de um input checkbox
 * @param {Object} properties - Passagem de propriedades pro componente
 * @param {string} [properties.name] - Propriedade HTML Name
 * @param {string} [properties.id] - Propriedade HTML Id
 * @param {any} [properties.props] - Outras propriedades HTML (opcional)
 */
export default function ToggleSwitch({ name, id, ...props }) {
    const className = [
        styles.toggleSwitch,
        props.className || ''
    ].join(' ');

    return <input type="checkbox" name={name} id={id} {...props} className={className} />
}