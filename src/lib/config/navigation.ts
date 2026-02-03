export interface NavigationLink {
    label: string;
    href: string;
    icon: string;
    color: {
        base: string;
        text: string;
        hover: string;
        activeRing: string;
    };
    mobileColor: {
        bg: string;
        text: string;
    }
}

export const navigationLinks: NavigationLink[] = [
    {
        label: 'Accueil',
        href: '/app',
        icon: '🏠',
        color: {
            base: 'bg-emerald-200 border-indigo-800/20 text-emerald-900',
            text: 'text-emerald-900',
            hover: 'opacity-100',
            activeRing: 'ring-emerald-300'
        },
        mobileColor: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-900'
        }
    },
    {
        label: 'Ma Classe',
        href: '/app/ma-classe',
        icon: '🎓',
        color: {
            base: 'bg-rose-200 border-indigo-800/20 text-rose-900',
            text: 'text-rose-900',
            hover: 'opacity-100',
            activeRing: 'ring-rose-300'
        },
        mobileColor: {
            bg: 'bg-rose-100',
            text: 'text-rose-900'
        }
    },
    {
        label: 'Appréc-IA',
        href: '/app/appreciations',
        icon: '✨',
        color: {
            base: 'bg-amber-200 border-indigo-800/20 text-amber-900',
            text: 'text-amber-900',
            hover: 'opacity-100',
            activeRing: 'ring-amber-300'
        },
        mobileColor: {
            bg: 'bg-amber-100',
            text: 'text-amber-900'
        }
    }
];
