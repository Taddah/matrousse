import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals: { supabase, getSession } }) => {
    const session = await getSession();

    if (!session) {
        throw error(401, 'Unauthorized');
    }

    const { id } = params;
    const userId = session.user.id;

    const { data, error: dbError } = await supabase
        .from('students')
        .select('id, encrypted_data')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

    if (dbError) {
        console.error('Database error fetching student:', dbError);
        throw error(500, 'Database error');
    }

    if (!data) {
        console.error(`Student not found. ID: ${id}, UserID: ${userId}`);
        throw error(404, 'Student not found');
    }

    return {
        student: data
    };
};
