import PixelIcon from "@/components/PixelIcon";
import Tippy from "@tippyjs/react";
import { useLanguage } from '@/context/LanguageContext';

export default function Badges({ list = [""] }) {
    const { language } = useLanguage();

    const BADGE_LIST = {
        "ADMIN": {
            label: language.getString("COMPONENTS.BADGES.ADMIN"),
            component: (<PixelIcon codename={'sliders-2'} style={{ color: "red" }} />)
        },
        "VACA": {
            label: language.getString("COMPONENTS.BADGES.VACA"),
            component: (<div><svg style={{ width: "1.5rem" }} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="200" cy="280" rx="80" ry="120" fill="#B8860B" transform="rotate(-30 200 280)" />
                <ellipse cx="210" cy="270" rx="40" ry="60" fill="#FDBCB4" transform="rotate(-30 210 270)" />
                <ellipse cx="600" cy="280" rx="80" ry="120" fill="#D3D3D3" transform="rotate(30 600 280)" />
                <ellipse cx="590" cy="270" rx="40" ry="60" fill="#FDBCB4" transform="rotate(30 590 270)" />
                <ellipse cx="280" cy="150" rx="30" ry="60" fill="#FFA500" />
                <ellipse cx="520" cy="150" rx="30" ry="60" fill="#FFA500" />
                <ellipse cx="400" cy="350" rx="250" ry="200" fill="#B8860B" />
                <ellipse cx="450" cy="350" rx="200" ry="180" fill="#D3D3D3" />
                <ellipse cx="330" cy="320" rx="25" ry="35" fill="#000000" />
                <ellipse cx="530" cy="320" rx="25" ry="35" fill="#000000" />
                <ellipse cx="400" cy="500" rx="120" ry="80" fill="#FDBCB4" />
                <ellipse cx="370" cy="490" rx="15" ry="25" fill="#333333" />
                <ellipse cx="430" cy="490" rx="15" ry="25" fill="#333333" />
            </svg></div>)
        }
    }

    let returnValue = Object.entries(BADGE_LIST).filter(([key, value]) => list.includes(key)).map(([flag, badge]) => (
        badge.label ? <Tippy key={flag} arrow={false} content={`${badge.label}`} placement="top">
            {badge.component}
        </Tippy> : <div key={flag}>{badge.component}</div>
    ));

    return (
        returnValue.length == 0 ? null : <>{returnValue}</>
    )
}