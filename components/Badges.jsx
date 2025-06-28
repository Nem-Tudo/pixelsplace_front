import PixelIcon from "@/components/PixelIcon";
import Tippy from "@tippyjs/react";

const BADGE_LIST = {
    // nome de uma flag: (componente jsx retornado se o cara tiver)
    'ADMIN': (<PixelIcon codename={'sliders-2'} style={{color: "red"}}/>),
    'VACA': (<PixelIcon codename={'list'} />),
};

// não precisa mexer
export default function Badges({ list = [""] }) {
    return (
        <>
            {Object.entries(BADGE_LIST).filter(([key, value]) => list.includes(key)).map(([key, value]) => (
                <Tippy content={`${key}`.replace('_', ' ')} placement="top">
                    {value}
                </Tippy>
            ))}
        </>
    )
}