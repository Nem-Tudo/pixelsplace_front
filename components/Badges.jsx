import PixelIcon from "@/components/PixelIcon";
import Tippy from "@tippyjs/react";

const BADGE_LIST = {
    'ADMIN': (<PixelIcon codename={'sliders-2'} />),
    'VACA': (<PixelIcon codename={'sliders-2'} />),
    'SOCKET_WHITELISTED': (<PixelIcon codename={'list'}/>)
};

export default function Badges({ list = [""] }) {
    return (
        <>
            {Object.entries(BADGE_LIST).filter(([key, value]) => list.includes(key)).map(([key, value]) => (
                <Tippy content={`${key}`.replace('_', '')} placement="top">
                    {value}
                </Tippy>
            ))}
        </>
    )
}