import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export class DateUtil {
  static today(): Date {
    return dayjs().utc().toDate();
  }

  static dateAfter(days: number): Date {
    return dayjs.utc().add(days, "day").toDate();
  }

  static afterMinutes(minutes: number, fromDate?: Date): Date {
    const baseDate = fromDate || dayjs.utc().toDate();
    return dayjs(baseDate).add(minutes, "minute").utc().toDate();
  }

  static afterHours(hours: number, fromDate?: Date): Date {
    const baseDate = fromDate || dayjs.utc().toDate();
    return dayjs(baseDate).add(hours, "hour").utc().toDate();
  }

  static afterDays(days: number, fromDate?: Date): Date {
    const baseDate = fromDate || dayjs.utc().toDate();
    return dayjs(baseDate).add(days, "day").utc().toDate();
  }

  static afterMonths(months: number, fromDate?: Date): Date {
    const baseDate = fromDate || dayjs.utc().toDate();
    return dayjs(baseDate).add(months, "month").utc().toDate();
  }

  static afterYears(years: number, fromDate?: Date): Date {
    const baseDate = fromDate || dayjs.utc().toDate();
    return dayjs(baseDate).add(years, "year").utc().toDate();
  }

  static isAfter(date: Date): boolean {
    return dayjs.utc().isAfter(date);
  }
}
