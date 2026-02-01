import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
    login: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return fail(400, { email, missing: true, message: 'Email et mot de passe requis' });
        }

        const { data, error } = await locals.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            let message = "Une erreur est survenue lors de la connexion.";

            if (error.message === "Invalid login credentials") {
                message = "Email ou mot de passe incorrect.";
            } else if (error.message === "Email not confirmed") {
                message = "Veuillez confirmer votre email avant de vous connecter.";
            }

            return fail(error.status || 400, {
                email,
                message,
                success: false
            });
        }

        return { success: true, session: data.session };
    },

    signup: async ({ request, locals }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return fail(400, { message: "Format d'email invalide" });
        }
        if (!password || password.length < 6) {
            return fail(400, { message: "Le mot de passe doit contenir au moins 6 caractères" });
        }

        const { data, error } = await locals.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });

        if (error) {
            let message = "Une erreur est survenue lors de l'inscription.";

            if (error.message.includes("User already registered")) {
                message = "Un compte existe déjà avec cet email.";
            } else if (error.message.includes("Password should be")) {
                message = "Le mot de passe est trop faible.";
            }

            return fail(error.status || 400, {
                message,
                error: error.message
            });
        }

        return { success: true };
    }
} satisfies Actions;
