export abstract class ArithmeticOperationUtil {
  private static roundToPrecision(num: number, precision = 10) {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  }

  static addition(a: number, b: number) {
    const operation = a + b;
    return this.roundToPrecision(operation);
  }

  static subtraction(a: number, b: number) {
    const operation = a - b;
    return this.roundToPrecision(operation);
  }

  static multiplication(a: number, b: number) {
    return this.roundToPrecision(a * b, 3);
  }

  static division(a: number, b: number) {
    return this.roundToPrecision(a / b, 2);
  }
}
