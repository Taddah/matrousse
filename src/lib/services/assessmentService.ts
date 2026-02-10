import type { GradeItem, GradingSystem } from '$lib/types';

export interface AssessmentResult {
    status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
    score: number;
    progressionBonus: number;
    formattedValue: string; // e.g., "A", "95%", "Acquis"
}

// Configuration for distinct grading logics
const CONFIG = {
    letter: {
        thresholds: [
            { min: 90, status: 'EXCELLENT', label: 'D' }, // Dépasse
            { min: 75, status: 'GOOD', label: 'A' }, // Acquis
            { min: 40, status: 'AVERAGE', label: 'PA' }, // Partiellement Acquis
            { min: 0, status: 'POOR', label: 'NA' } // Non Atteint
        ]
    },
    color: {
        thresholds: [
            { min: 80, status: 'EXCELLENT', label: 'Vert' },
            { min: 60, status: 'GOOD', label: 'Bleu' },
            { min: 40, status: 'AVERAGE', label: 'Orange' },
            { min: 0, status: 'POOR', label: 'Rouge' }
        ]
    },
    percentage: {
        // Linear scale, label is the percentage itself
    }
} as const;

/**
 * Computes a competency assessment based on a list of grades.
 *
 * @param grades - List of grades (GradeItem).
 * @param system - The grading system to use for formatting and thresholds.
 * @returns The assessment result or null if no grades.
 */
export function assessCompetency(
    grades: GradeItem[],
    system: GradingSystem = 'percentage'
): AssessmentResult | null {
    if (!grades || grades.length === 0) return null;

    const sorted = [...grades].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 1. Calculate Weighted Average
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

    // 2. Calculate Progression Bonus
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

    // 3. Determine Status and Formatted Value based on System
    let status: AssessmentResult['status'] = 'POOR';
    let formattedValue = `${Math.round(finalScore)}%`;

    if (system === 'letter' || system === 'color') {
        const config = CONFIG[system];
        // Find the first threshold that matches
        const match = config.thresholds.find((t) => finalScore >= t.min);
        if (match) {
            status = match.status as AssessmentResult['status'];
            formattedValue = match.label;
        }
    } else {
        // Percentage default
        if (finalScore >= 90) status = 'EXCELLENT';
        else if (finalScore >= 75) status = 'GOOD';
        else if (finalScore >= 50) status = 'AVERAGE';
        else status = 'POOR';
    }

    return {
        status,
        score: finalScore,
        progressionBonus,
        formattedValue
    };
}
