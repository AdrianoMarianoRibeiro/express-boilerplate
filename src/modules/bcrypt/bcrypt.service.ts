import * as bcrypt from 'bcrypt';
import { injectable } from 'tsyringe';

@injectable()
export class BcryptService {
  private salt = 10;

  public async encrypt(str: string): Promise<string> {
    return bcrypt.hash(str, this.salt);
  }

  public async compare(plain: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(plain, encrypted);
  }
}
