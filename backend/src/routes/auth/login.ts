import { FastifyInstance } from 'fastify';
import { supabase } from '../../supabase';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function loginRoute(server: FastifyInstance) {
    server.withTypeProvider<ZodTypeProvider>().post('/login', {
        schema: {
            body: z.object({
                email: z.string().email(),
                password: z.string()
            })
        }
    }, async (request, reply) => {
        const { email, password } = request.body;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            const status = error.status || 400;
            let message = "Une erreur est survenue lors de la connexion.";

            // Mappage des messages d'erreur courants
            // Note: Supabase peut changer les messages, donc on garde une approche défensive
            if (error.message === "Invalid login credentials") {
                message = "Email ou mot de passe incorrect.";
            } else if (error.message === "Email not confirmed") {
                message = "Veuillez confirmer votre email avant de vous connecter.";
            }

            reply.status(status).send({
                success: false,
                message,
                code: error.code
            });
            return;
        }

        return data;
    });
}
