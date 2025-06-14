import { Module } from "../decorators/module.decorator";
import { AppController } from "../controllers/app.controller";
import { UserModule } from "./user.module";

@Module({
  imports: [UserModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
