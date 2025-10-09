export const config = {
    database: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret',
    },
    server: {
        port: process.env.PORT || 3001,
    },
};
