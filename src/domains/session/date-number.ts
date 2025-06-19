import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { date } from 'zod/v4'

dayjs.extend(customParseFormat)

export class DateNumber {
  private static readonly FORMAT: string = 'YYYY-MM-DD'
  private static readonly YEAR_DIGITS: number = 10000
  private static readonly MONTH_DIGITS: number = 100

  private constructor(private readonly dateString: string) {
    if (!dayjs(dateString, 'YYYY-MM-DD', true).isValid()) {
      throw new Error(`dateString is not the format of ${DateNumber.FORMAT}`)
    }
  }

  public static of(dateString: string): DateNumber {
    return new DateNumber(dateString)
  }

  public get(): number {
    const date = dayjs(this.dateString, DateNumber.FORMAT, true)
    const year: number = date.year()
    const month: number = date.month() + 1
    const day: number = date.date()
    return year * DateNumber.YEAR_DIGITS + month * DateNumber.MONTH_DIGITS + day
  }
}
