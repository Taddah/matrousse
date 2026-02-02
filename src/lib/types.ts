export interface JournalEntry {
	id: string;
	content: string;
	date: string;
	updatedAt: string;
}

export interface Student {
	id: string;
	lastName: string;
	firstName: string;
	grade: 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';
	birthDate?: string;
	generalInfo?: string;
	journalEntries?: JournalEntry[];
}

export type Grade = Student['grade'];

