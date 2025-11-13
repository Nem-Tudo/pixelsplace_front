export default function centsToPrice(cents) {
    return (cents / 100).toFixed(2).replace('.', ',');
}