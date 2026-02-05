import type { GradeItem } from '$lib/types';

export function calculateAverage(items: GradeItem[]): number | null {
    if (!items || items.length === 0) return null;

    let totalPoints = 0;
    let totalMax = 0;

    for (const item of items) {
        const normalizedValue = (item.value / item.base) * 100;
        totalPoints += normalizedValue * item.weight;
        totalMax += item.weight;
    }

    if (totalMax === 0) return null;
    return Math.round(totalPoints / totalMax);
}
