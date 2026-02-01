import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
    const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading students:', error);
        return { students: [] };
    }

    return {
        students: students || []
    };
};
