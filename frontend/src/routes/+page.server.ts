import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

import { BACKEND_URL } from '$env/static/private';

export const actions = {
    login: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            return fail(400, { email, missing: true, message: 'Email et mot de passe requis' });
        }

        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                return fail(response.status, {
                    email,
                    message: result.message || result.error_description || 'Erreur de connexion'
                });
            }

            // Fix: Persist the session in cookies so hooks.server.ts can read it
            if (result.session) {
                await locals.supabase.auth.setSession(result.session);
            }

            return { success: true, session: result.session };
        } catch (error) {
            console.error('Login action error:', error);
            return fail(500, { email, message: 'Erreur serveur interne' });
        }
    },

    signup: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');

        try {
            const response = await fetch(`${BACKEND_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName
                        }
                    }
                })
            });

            const result = await response.json();

            if (!response.ok) {
                return fail(response.status, {
                    message: result.message || result.error_description || "Erreur lors de l'inscription"
                });
            }

            if (result.session) {
                await locals.supabase.auth.setSession(result.session);
            }

            return { success: true };
        } catch (error) {
            console.error('Signup action error:', error);
            return fail(500, { message: 'Erreur serveur interne' });
        }
    }
} satisfies Actions;
