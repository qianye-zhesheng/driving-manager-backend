import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { date } from 'zod/v4'

dayjs.extend(customParseFormat)

export class DateNumber {
  private static readonly FORMAT: string = 'YYYY-MM-DD'
  private static readonly YEAR_DIGITS: number = 10000
  private static readonly MONTH_DIGITS: number = 100

  private constructor(
    private readonly year: number,
    private readonly month: number,
    private readonly day: number,
  ) {}

  public static of(dateString: string): DateNumber {
    const date = dayjs(dateString, DateNumber.FORMAT, true)

    if (!date.isValid()) {
      throw new Error(`dateString is not the format of ${DateNumber.FORMAT}`)
    }

    const year: number = date.year()
    const month: number = date.month() + 1
    const day: number = date.date()
    return new DateNumber(year, month, day)
  }

  public get(): number {
    return this.year * DateNumber.YEAR_DIGITS + this.month * DateNumber.MONTH_DIGITS + this.day
  }
}
