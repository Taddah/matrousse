import { FastifyInstance } from 'fastify';
import { supabase } from '../../supabase';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function signupRoute(server: FastifyInstance) {
    server.withTypeProvider<ZodTypeProvider>().post('/signup', {
        schema: {
            body: z.object({
                email: z.string().email("Format d'email invalide"),
                password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
                options: z.any().optional()
            })
        }
    }, async (request, reply) => {
        const { email, password, options } = request.body;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options
        });

        if (error) {
            let message = "Une erreur est survenue lors de l'inscription.";

            if (error.message.includes("User already registered")) {
                message = "Un compte existe déjà avec cet email.";
            } else if (error.message.includes("Password should be")) {
                message = "Le mot de passe est trop faible.";
            }

            reply.status(400).send({ message, error: error.message });
            return;
        }

        return data;
    });
}
