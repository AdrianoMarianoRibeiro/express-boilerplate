export abstract class MaskUtil {
  /**
   * EXEMPLO: example: ###.###.###-##
   */
  static make(mask: string, value: string): string {
    value = value.replace(/\s/g, '');

    for (let i = 0; i < value.length; i++) {
      mask = mask.replace('#', value[i]);
    }

    return mask;
  }

  static remove(value: string): string {
    return value.replace(/[^0-9]/g, '');
  }

  static hideCPF(cpf: string): string {
    return this.remove(cpf).replace(/\d{3}(\d{3})(\d{3})\d{2}/, '***.$1.$2-**');
  }
}
