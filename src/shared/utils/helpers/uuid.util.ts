import { v4 as uuidv4 } from 'uuid';

export abstract class UUIDUtil {
  static make(): string {
    return uuidv4();
  }
}
