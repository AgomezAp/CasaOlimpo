import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in the environment variables');
}

const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        useUTC: true,
        ssl: {
            require: true,
            rejectUnauthorized: false 
        }
    },
   
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

export default sequelize;