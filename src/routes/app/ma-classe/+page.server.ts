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

export const actions = {
	generateShareLink: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) return { error: 'Unauthorized' };

		const formData = await request.formData();
		const encrypted_blob = formData.get('encrypted_blob');
		const owner_recovery_token = formData.get('owner_recovery_token');
		const recipient_name = formData.get('recipient_name');
		const expires_at = formData.get('expires_at');

		const { data, error } = await supabase
			.from('shared_sessions')
			.insert({
				encrypted_blob,
				owner_recovery_token: owner_recovery_token ? JSON.parse(owner_recovery_token as string) : null,
				recipient_name,
				expires_at,
				created_by: session.user.id
			})
			.select('id')
			.single();

		if (error) {
			console.error('Error creating share session:', error);
			return { error: error.message };
		}

		return { success: true, id: data.id };
	}
};
