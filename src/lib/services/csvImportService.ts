import type { Student } from '$lib/types';

export function parseCSVLine(line: string): string[] {
    const separator = line.includes(';') ? ';' : ',';

    if (line.includes('"')) {
        const matches = [];
        let current = '';
        let inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === separator && !inQuote) {
                matches.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        matches.push(current);
        return matches.map((s) => s.replace(/^"|"$/g, '').trim());
    }

    return line.split(separator).map((s) => s.trim());
}

export function parseCsvContent(text: string): { headers: string[]; content: string[][] } {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
    if (lines.length < 2) {
        throw new Error("Le fichier semble vide ou ne contient pas d'en-tête.");
    }

    const allRows = lines.map(parseCSVLine);
    return {
        headers: allRows[0],
        content: allRows.slice(1)
    };
}

export function autoGuessMapping(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {
        lastName: '',
        firstName: '',
        birthDate: '',
        contactLastName: '',
        contactFirstName: '',
        contactEmail: '',
        contactPhone: '',
        gender: '',
        grade: ''
    };

    headers.forEach((header, index) => {
        const h = header.toLowerCase();
        // Student
        if (h === 'nom' || h === 'eleve_nom' || h === 'nom usage')
            mapping.lastName = index.toString();
        if ((h.includes('prénom') || h.includes('prenom')) && !h.includes('resp'))
            mapping.firstName = index.toString();
        if (h.includes('naissance') || h.includes('né')) mapping.birthDate = index.toString();
        if (h === 'sexe' || h === 'genre' || h === 'civilité') mapping.gender = index.toString();
        if (h.includes('niveau') || h === 'classe' || h.includes('grade'))
            mapping.grade = index.toString();

        // Contacts
        if (h.includes('mail') || h.includes('courriel')) mapping.contactEmail = index.toString();
        if (h.includes('tel') || h.includes('tél') || h.includes('mobile'))
            mapping.contactPhone = index.toString();
        if ((h.includes('nom') && h.includes('resp')) || h.includes('tuteur'))
            mapping.contactLastName = index.toString();
        if ((h.includes('prénom') || h.includes('prenom')) && h.includes('resp'))
            mapping.contactFirstName = index.toString();
    });

    return mapping;
}

export function convertRowsToStudents(
    rows: string[][],
    mapping: Record<string, string>
): Omit<Student, 'id'>[] {
    return rows
        .map((row) => {
            const lastName = mapping.lastName ? row[parseInt(mapping.lastName)] || '' : '';
            const firstName = mapping.firstName ? row[parseInt(mapping.firstName)] || '' : '';
            const rawBirthDate = mapping.birthDate ? row[parseInt(mapping.birthDate)] || '' : '';
            const gender = mapping.gender ? row[parseInt(mapping.gender)] || '' : undefined;
            const rawGrade = mapping.grade ? row[parseInt(mapping.grade)] || '' : undefined;

            // Date Parsing
            let birthDate = undefined;
            if (rawBirthDate) {
                const dateMatch = rawBirthDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (dateMatch) {
                    const [_, day, month, year] = dateMatch;
                    birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                } else if (rawBirthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    birthDate = rawBirthDate;
                }
            }

            // Gender Normalization
            let normalizedGender = gender;
            if (gender) {
                const g = gender.trim().toUpperCase();
                if (['F', 'FILLE', 'FEMME', 'FEMININ'].includes(g)) normalizedGender = 'F';
                else if (['M', 'G', 'GARÇON', 'HOMME', 'MASCULIN'].includes(g)) normalizedGender = 'M';
            }

            // Grade Normalization
            let grade: Student['grade'] = 'CP';
            if (rawGrade) {
                const g = rawGrade.trim().toUpperCase();
                if (['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(g)) {
                    grade = g as Student['grade'];
                }
            }

            // Contacts
            const contactLastName = mapping.contactLastName
                ? row[parseInt(mapping.contactLastName)] || ''
                : '';
            const contactFirstName = mapping.contactFirstName
                ? row[parseInt(mapping.contactFirstName)] || ''
                : '';
            const contactPhone = mapping.contactPhone ? row[parseInt(mapping.contactPhone)] || '' : '';
            const contactEmail = mapping.contactEmail ? row[parseInt(mapping.contactEmail)] || '' : '';

            const contacts = [];
            if (contactLastName || contactFirstName || contactPhone || contactEmail) {
                contacts.push({
                    id: crypto.randomUUID(),
                    lastName: contactLastName,
                    firstName: contactFirstName,
                    phone: contactPhone,
                    email: contactEmail,
                    relationship: 'Responsable'
                });
            }

            return {
                lastName: lastName.trim(),
                firstName: firstName.trim(),
                birthDate,
                gender: normalizedGender,
                grade,
                contacts
            };
        })
        .filter((s) => s.lastName && s.firstName);
}
