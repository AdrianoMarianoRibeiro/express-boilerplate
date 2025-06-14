import { Module } from "../../decorators/module.decorator";
import { HttpService } from "./http.service";

@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
