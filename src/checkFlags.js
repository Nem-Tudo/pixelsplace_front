export default function checkFlags(flags = [], flag) {
    if (!flag) return false;
    if (flags.includes("ADMIN")) return true;
    if (flags.includes(flag)) return true;
    return false;
}