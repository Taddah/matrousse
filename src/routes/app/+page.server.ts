import { redirect } from '@sveltejs/kit';
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
