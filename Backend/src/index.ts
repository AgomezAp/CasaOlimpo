import dotenv from 'dotenv';
// import './utils/cron'
import Server from './models/server';

dotenv.config();
const server = new Server();