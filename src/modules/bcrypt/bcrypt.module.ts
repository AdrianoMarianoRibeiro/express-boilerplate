import { Module } from '../../decorators';
import { BcryptService } from './bcrypt.service';

@Module({
  providers: [BcryptService],
  exports: [BcryptService],
})
export class BcryptModule {}
