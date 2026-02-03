import { readable } from 'svelte/store';
import { browser } from '$app/environment';

const MOBILE_MAX_WIDTH = 768;

export const isMobile = readable(false, (set) => {
    if (!browser) return;

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);

    const update = () => set(mediaQuery.matches);

    update();

    mediaQuery.addEventListener('change', update);

    return () => {
        mediaQuery.removeEventListener('change', update);
    };
});
