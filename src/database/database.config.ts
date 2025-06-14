import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3301"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_DATABASE || "express_app_mysql",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: ["src/**/*.entity.{ts,js}"],
  migrations: ["src/database/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});

export default AppDataSource;
