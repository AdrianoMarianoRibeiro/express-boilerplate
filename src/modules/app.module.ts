import { AppController } from "../controllers/app.controller";
import { Module } from "../decorators/module.decorator";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
