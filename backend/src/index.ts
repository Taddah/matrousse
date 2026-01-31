import fastify from 'fastify';

const server = fastify();

server.get('/', async () => {
    return 'Hello World';
});

server.get('/health', async () => {
    return { status: 'ok' };
});

const start = async () => {
    try {
        const address = await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log(`Server listening on ${address}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
