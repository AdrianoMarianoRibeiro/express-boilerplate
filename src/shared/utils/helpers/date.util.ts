import dayjs, { ManipulateType } from 'dayjs';

export abstract class DateUtil {
  static now(): Date {
    return new Date();
  }

  static customDate(custom: string): Date {
    const date = new Date(custom);

    return date;
  }

  static format(format: string, date: Date = new Date()): string {
    return dayjs(date).format(format);
  }

  static formatDateTimePtBR(date: Date): string {
    return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
  }

  static formatDateTimeEN(date: Date): string {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  }

  static formatDatePtBR(date: Date): string {
    return dayjs(date).format('DD/MM/YYYY');
  }

  static formatTimePtBR(date: Date): string {
    return dayjs(date).format('HH:mm:ss');
  }

  static formatDateTimePtBRWithAs(date: Date): string {
    return dayjs(date).format('DD/MM/YYYY [às] HH:mm:ss');
  }

  /**
   * @param UnitTypeShort = 'd' | 'D' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms'
   * @param UnitTypeLong = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | 'date'
   * @param UnitTypeLongPlural = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years' | 'dates'
   */
  static addMoreTime(time: number, manipulateType: ManipulateType): Date {
    return dayjs(this.now()).add(time, manipulateType).toDate();
  }

  /**
   * @param UnitTypeShort = 'd' | 'D' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms'
   * @param UnitTypeLong = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | 'date'
   * @param UnitTypeLongPlural = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years' | 'dates'
   */
  static addLessTime(time: number, manipulateType: ManipulateType): Date {
    return dayjs(this.now()).subtract(time, manipulateType).toDate();
  }

  static getExpirationTime(expirationTime: string | Date): number {
    const expirationDate = dayjs(expirationTime);
    const currentTime = dayjs();

    return expirationDate.diff(currentTime, 'minute');
  }

  static convertTimestamp(timestamp: number, format: string): string {
    return dayjs(timestamp).format(format);
  }
}
