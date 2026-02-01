import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { signupRoute } from './routes/auth/signup';
import { loginRoute } from './routes/auth/login';
import { healthRoute } from './routes/health';

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(helmet, { global: true });
server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
});

server.register(cors, {
    origin: ['http://localhost:5173'], // Restrict to frontend
});

server.get('/', async () => {
    return 'Hello World';
});

server.register(healthRoute);
server.register(signupRoute);
server.register(loginRoute);

const start = async () => {
    try {
        const address = await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log(`Server listening on ${address}`);
    } catch (err) {
        console.error(err);
        server.log.error(err);
        process.exit(1);
    }
};

start();
