export abstract class DecimalUtil {
  static toPtBR(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  static toFixed(value: number, fixed: number = 2): number {
    return Number(value.toFixed(fixed));
  }
}
