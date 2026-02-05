import type { GradeItem } from '$lib/types';

export interface AssessmentResult {
    code: 'D' | 'A' | 'PA' | 'NA';
    label: string;
    color: string;
    score: number;
    progressionBonus: number;
}

/**
 * Computes a competency assessment based on a list of grades.
 *
 * Algorithm:
 * 1. Sort grades by date (oldest first).
 * 2. Calculate global weighted average.
 * 3. Apply a progression bonus if the student is improving (if > 3 grades, compare last 1/3 to the rest).
 * 4. Determine status (D, A, PA, NA) based on final score.
 *
 * @param grades - List of grades (GradeItem) for this sub-competency.
 * @returns The assessment result or null if no grades.
 */
export function assessCompetency(grades: GradeItem[]): AssessmentResult | null {
    if (!grades || grades.length === 0) return null;

    const sorted = [...grades].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const calculateMean = (items: GradeItem[]) => {
        let points = 0;
        let weight = 0;
        for (const g of items) {
            points += (g.value / g.base) * 100 * g.weight;
            weight += g.weight;
        }
        return weight === 0 ? 0 : points / weight;
    };

    const baseAverage = calculateMean(sorted);

    let progressionBonus = 0;
    if (sorted.length >= 3) {
        const splitIndex = Math.floor(sorted.length * 0.67);
        const recentGrades = sorted.slice(splitIndex);
        const olderGrades = sorted.slice(0, splitIndex);

        const recentAvg = calculateMean(recentGrades);
        const olderAvg = calculateMean(olderGrades);

        if (recentAvg > olderAvg) {
            progressionBonus = Math.min((recentAvg - olderAvg) * 0.2, 10);
        }
    }

    const finalScore = Math.min(baseAverage + progressionBonus, 100);

    if (finalScore >= 90) {
        return {
            code: 'D',
            label: 'Dépassé',
            color: 'bg-green-600 text-white',
            score: finalScore,
            progressionBonus
        };
    } else if (finalScore >= 75) {
        return {
            code: 'A',
            label: 'Acquis',
            color: 'bg-green-100 text-green-800',
            score: finalScore,
            progressionBonus
        };
    } else if (finalScore >= 40) {
        return {
            code: 'PA',
            label: 'Partiellement Acquis',
            color: 'bg-orange-100 text-orange-800',
            score: finalScore,
            progressionBonus
        };
    } else {
        return {
            code: 'NA',
            label: 'Non Atteint',
            color: 'bg-red-100 text-red-800',
            score: finalScore,
            progressionBonus
        };
    }
}
