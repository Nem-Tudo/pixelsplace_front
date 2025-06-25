const icons = {
    'coffee': (<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 4h18v7h-4v5H4V4zm14 5h2V6h-2v3zm-2-3H6v8h10V6zm3 14H3v-2h16v2z" fill="currentColor"/> </svg>),
    'forward': (<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M14 5h-2v4H6v2H4v6h2v-2h6v4h2v-2h2v-2h2v-2h2v-2h-2V9h-2V7h-2V5z" fill="currentColor"/> </svg>),
    'gamepad': (<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M2 5h20v14H2V5zm18 12V7H4v10h16zM8 9h2v2h2v2h-2v2H8v-2H6v-2h2V9zm6 0h2v2h-2V9zm4 4h-2v2h2v-2z" fill="currentColor"/> </svg>),
    'hourglass': (<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M18 2H6v6h2v2h2v4H8v2H6v6h12v-6h-2v-2h-2v-4h2V8h2V2zm-2 6h-2v2h-4V8H8V4h8v4zm-2 6v2h2v4H8v-4h2v-2h4z" fill="currentColor"/> </svg>),
    'server': (<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm2 2v6h14V5H5zm14 8H5v6h14v-6zM7 7h2v2H7V7zm2 8H7v2h2v-2z" fill="currentColor"/> </svg>)
};

export default function PixelIcon({ codename = 'coffee' }) {
    return icons[codename] ?? icons['coffee'];
}