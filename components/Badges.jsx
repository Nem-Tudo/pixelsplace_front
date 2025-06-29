import PixelIcon from "@/components/PixelIcon";
import Tippy from "@tippyjs/react";

const BADGE_LIST = {
    "ADMIN": {
        label: "Administrador",
        component: (<PixelIcon codename={'sliders-2'} style={{ color: "red" }} />)
    },
    "VACA": {
        label: "Vaca",
        component: (<PixelIcon codename={'cow'} />)
    }
}

// não precisa mexer
export default function Badges({ list = [""] }) {
    let returnValue = Object.entries(BADGE_LIST).filter(([key, value]) => list.includes(key)).map(([flag, badge]) => (
        badge.label ? <Tippy content={`${badge.label}`} placement="top">
            {value}
        </Tippy> : value

    ));

    return (
        returnValue.length == 0 ? null : <>{returnValue}</>
    )
}