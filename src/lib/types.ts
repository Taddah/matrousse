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
	grades?: Record<string, GradeItem[]>;
}

export type GradingSystem = 'percentage' | 'color' | 'letter';

export interface GradeItem {
	id: string;
	value: number;
	base: number;
	weight: number;
	date: string;
	type?: GradingSystem;
	comment?: string;
}

export type Grade = Student['grade'];

export interface AgendaSlot {
	id: string;
	user_id: string;
	start_time: string;
	end_time: string;
	is_booked: boolean;
	booked_by_session_id?: string | null;
	created_at?: string;
	studentName?: string;
	booked_by?: {
		recipient_name?: string;
		owner_recovery_token?: string;
		encrypted_blob?: string;
	} | null;
	studentDetail?: Partial<Student>;
	loadingStudent?: boolean;
	notes?: string;
}
