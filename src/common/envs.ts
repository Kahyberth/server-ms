import 'dotenv/config';

import * as joi from 'joi';


interface EnvVars {
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;

    WS_PORT: number;
    FRONTEND_URL: string;
    PORT: number;
    NATS_SERVERS: string[];
}


const envSchema = joi.object({
    PORT: joi.number().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_DATABASE: joi.string().required(),
    WS_PORT: joi.number().required(),
    FRONTEND_URL: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
}).unknown(true);


const { error, value } = envSchema.validate({
    ...process.env, 
    NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,
    WS_PORT: process.env.WS_PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
    PORT: process.env.PORT,
})


if (error) throw new Error(`Config validation error: ${error.message}`);


const envVars: EnvVars = value;


export const envs = {
    PORT: envVars.PORT,
    NATS_SERVERS: envVars.NATS_SERVERS,
    DB_HOST: envVars.DB_HOST,
    DB_PORT: envVars.DB_PORT,
    DB_USERNAME: envVars.DB_USERNAME,
    DB_PASSWORD: envVars.DB_PASSWORD,
    DB_DATABASE: envVars.DB_DATABASE,
    WS_PORT: envVars.WS_PORT,
    FRONTEND_URL: envVars.FRONTEND_URL,
}