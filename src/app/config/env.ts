
import dotenv from 'dotenv';
dotenv.config()


interface EnvConfig {

    MONGO_DB_URL: string,
    ADMIN_EMAIL: string,
    ADMIN_PASS: string,
    PASSWORD_HASH_SALT: string,
    NODE_ENV: string,
    JWT_ACCESS_SECRET: string,
    JWT_ACCESS_EXPIRES: string,

    CLOUD_API_KEY: string, //cloudinary config
    CLOUD_NAME: string,
    CLOUD_API_SECRET: string,


    TYPE : string,
    PROJECT_ID: string, //firebase config
    PRIVATE_KEY_ID: string,
    PRIVATE_KEY: string,
    CLIENT_EMAIL: string,
    CLIENT_ID: string,
    AUTH_URI: string,
    TOKEN_URI: string,
    AUTH_PROVIDER_X509_CART_URL: string,
    CLIENT_X509_CERT_URL: string,
    UNIVERSE_DOMAIN: string
}



const LoadEnvVariables = (): EnvConfig => {



    const requiredVariables: string[] = [

        'MONGO_DB_URL', 'ADMIN_EMAIL', 'ADMIN_PASS',
        'PASSWORD_HASH_SALT', 'NODE_ENV', 'JWT_ACCESS_EXPIRES',
        'JWT_ACCESS_SECRET', 'CLOUD_API_KEY', 'CLOUD_NAME', 'CLOUD_API_SECRET',
        'PROJECT_ID', 'PRIVATE_KEY_ID', 'PRIVATE_KEY', 'CLIENT_EMAIL', 'CLIENT_ID', 'AUTH_URI',
        'TOKEN_URI', 'AUTH_PROVIDER_X509_CART_URL', 'CLIENT_X509_CERT_URL', 'UNIVERSE_DOMAIN','TYPE'
    ]


    requiredVariables.forEach((key) => {

        if (!process.env[key]) {
            throw new Error(`Missing require enviroment variable  ${key}`)
        }
    })



    return {

        MONGO_DB_URL: process.env.MONGO_DB_URL as string,

        ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
        ADMIN_PASS: process.env.ADMIN_PASS as string,

        PASSWORD_HASH_SALT: process.env.PASSWORD_HASH_SALT as string,
        NODE_ENV: process.env.NODE_ENV as string,


        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,


        CLOUD_API_KEY: process.env.CLOUD_API_KEY as string,
        CLOUD_NAME: process.env.CLOUD_NAME as string,
        CLOUD_API_SECRET: process.env.CLOUD_API_SECRET as string,



        TYPE : process.env.TYPE as string,
        UNIVERSE_DOMAIN : process.env.UNIVERSE_DOMAIN as string,
        CLIENT_X509_CERT_URL : process.env.CLIENT_X509_CERT_URL as string,
        AUTH_PROVIDER_X509_CART_URL : process.env.AUTH_PROVIDER_X509_CART_URL as string,
        TOKEN_URI : process.env.TOKEN_URI as string,
        AUTH_URI : process.env.AUTH_URI as string,
        CLIENT_ID : process.env.CLIENT_ID as string,
        CLIENT_EMAIL : process.env.CLIENT_EMAIL as string,
        PRIVATE_KEY : process.env.PRIVATE_KEY as string,
        PRIVATE_KEY_ID : process.env.PRIVATE_KEY_ID as string,
        PROJECT_ID : process.env.PROJECT_ID as string,

    }
}

export const envVars = LoadEnvVariables()