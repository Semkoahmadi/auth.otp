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
    accessTokenSecret:"8f6df519a2125946820bc34a561164c2",
    refreshTokenSecret: "2b1de99ad2e00da88b0f5a6d113569a0",
}));
const DbConfig = registerAs(ConfigKeys.Db, () => ({
    port: 5432,
    host:"localhost",
    username:"postgres",
    password:"dointime",
    database:"auth-otp"
}));

export const configurations = [AppConfig,DbConfig,JwtConfig];