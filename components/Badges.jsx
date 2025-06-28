import PixelIcon from "@/components/PixelIcon";

const BADGE_LIST = {
    'ADMIN': (<PixelIcon codename={'sliders-2'} />),
    'VACA': (<PixelIcon codename={'sliders-2'} />),
    'SOCKET_WHITELISTED': (<PixelIcon codename={'list'}/>)
};

export default function Badges({ list = [""] }) {
    let filteredBadges = Object.entries(BADGE_LIST).filter(badge => {list.includes(badge)}).map(badge => badge);
    return filteredBadges;
}