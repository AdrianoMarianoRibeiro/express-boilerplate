import { createHash } from 'crypto';

export abstract class HashUtil {
  static async make(value: any, hashType: string = 'sha256'): Promise<string> {
    try {
      return createHash(hashType).update(value).digest('hex');
    } catch (error) {
      throw error;
    }
  }
}
