export interface Student {
	id: string;
	lastName: string;
	firstName: string;
	grade: 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';
}

export type Grade = Student['grade'];
