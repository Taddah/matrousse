import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/');
	}

	const { data: profileData } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', session.user.id)
		.single();

	if (profileData) {
		return {
			profile: {
				...profileData,
				email: session.user.email,
				full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
			}
		};
	}

	const { user } = session;
	return {
		profile: {
			full_name:
				`${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim(),
			email: user.email,
			first_name: user.user_metadata.first_name,
			last_name: user.user_metadata.last_name
		}
	};
};

export const actions = {
	updateProfile: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const firstName = formData.get('first_name') as string;
		const lastName = formData.get('last_name') as string;
		const gradingSystem = formData.get('grading_system') as string;

		const { error } = await supabase
			.from('profiles')
			.update({
				first_name: firstName,
				last_name: lastName,
				grading_system: gradingSystem
			})
			.eq('id', session.user.id);

		if (error) {
			return fail(500, { message: error.message });
		}

		return { success: true };
	}
};
