export default function checkFlags(flags = [], flag, settings = { positive: true }) {
    if (settings.positive === true) {
        if (flags.includes("ADMIN")) return true;
    } else {
        if (flags.includes("ADMIN")) return false;
    }

    if (flags.includes(flag)) return true;
    return false;
}