import dayjs from 'dayjs'
import { Month } from './month'
import { Year } from './year'
import { DateNumber } from '../date-number'

export class YearMonthQuery {
  private constructor(
    private readonly year: Year,
    private readonly month: Month,
    private readonly firstDateNumber: DateNumber,
    private readonly lastDateNumber: DateNumber,
  ) {}

  public static of(year: Year, month: Month): YearMonthQuery {
    const firstDate = dayjs()
      .year(year.get())
      .month(month.get() - 1)
      .date(1)
    const firstDateNumber = DateNumber.at(firstDate.toDate())

    const lastDate = dayjs()
      .year(year.get())
      .month(month.get() - 1)
      .endOf('month')
    const lastDateNumber = DateNumber.at(lastDate.toDate())

    return new YearMonthQuery(year, month, firstDateNumber, lastDateNumber)
  }

  public from(): DateNumber {
    return this.firstDateNumber
  }

  public to(): DateNumber {
    return this.lastDateNumber
  }

  public getYear(): Year {
    return this.year
  }

  public getMonth(): Month {
    return this.month
  }
}
