import dayjs from 'dayjs'
import { Month } from './month'
import { Year } from './year'
import { DateNumber } from '../date-number'

export class YearMonth {
  private readonly firstDateNumber: DateNumber
  private readonly lastDateNumber: DateNumber

  constructor(
    private readonly year: Year,
    private readonly month: Month,
  ) {
    const firstDate = dayjs()
      .year(this.year.get())
      .month(this.month.get() - 1)
      .date(1)
    this.firstDateNumber = DateNumber.at(firstDate.toDate())

    const lastDate = dayjs()
      .year(this.year.get())
      .month(this.month.get() - 1)
      .endOf('month')
    this.lastDateNumber = DateNumber.at(lastDate.toDate())
  }

  public getFirstDateNumber(): DateNumber {
    return this.firstDateNumber
  }

  public getLastDateNumber(): DateNumber {
    return this.lastDateNumber
  }
}
