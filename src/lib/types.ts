export interface JournalEntry {
	id: string;
	content: string;
	date: string;
	updatedAt: string;
}

export interface Contact {
	id: string;
	firstName: string;
	lastName: string;
	relationship: string;
	email: string;
	phone: string;
}

export interface Student {
	id: string;
	lastName: string;
	firstName: string;
	grade: 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';
	gender?: 'M' | 'F' | string;
	birthDate?: string;
	generalInfo?: string;
	journalEntries?: JournalEntry[];
	contacts?: Contact[];
}

export type Grade = Student['grade'];

