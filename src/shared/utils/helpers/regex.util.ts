export abstract class RegexUtil {
  static replaceSpaceWith(value: string, replace: string): string {
    return value.replace(/\s+/g, replace);
  }

  static removeAccents(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  static removeSpecialCharactersAndParentheses(value: string): string {
    return value.replace(/[^\w\s]/g, '');
  }

  static unmask(value: string): string {
    return value.replace(/\D/g, '');
  }
}
