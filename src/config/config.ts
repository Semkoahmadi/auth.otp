import { registerAs } from "@nestjs/config";

export enum ConfigKeys {
    App = "App",
    Db = "Db",
    Jwt = "Jwt",
}
const AppConfig = registerAs(ConfigKeys.App, () => ({
    port: 3000,
}));
const JwtConfig = registerAs(ConfigKeys.Jwt, () => ({
    accessTokenSecret:"a39730b7d46d6c38f1f28c832ea18e12",
    refreshTokenSecret: "8d389ad4c68ef56d7ab929b0974631e7",
}));
const DbConfig = registerAs(ConfigKeys.Db, () => ({
    port: 5432,
    host:"localhost",
    username:"postgres",
    password:"dointime",
    database:"auth-otp"
}));

export const configurations = [AppConfig,DbConfig,JwtConfig];