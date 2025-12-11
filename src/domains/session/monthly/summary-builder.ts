import { MonthlyRecords, SessionRecord, Summary } from './monthly-records'
import { YearMonthQuery } from './year-month-query'
import { Response } from './response'

export class SummaryBuilder {
  constructor(
    private readonly sessionRecords: SessionRecord[],
    private readonly yearMonth: YearMonthQuery,
  ) {}

  public summarize(): Response {
    const totalOfficialDistance = this.sessionRecords.reduce(
      (sum, record) => sum + record.officialDistance,
      0,
    )
    const totalPrivateDistance = this.sessionRecords.reduce(
      (sum, record) => sum + record.privateDistance,
      0,
    )
    const totalDistance = totalOfficialDistance + totalPrivateDistance

    const officialPercentage =
      totalDistance === 0 ? 0 : Math.round((totalOfficialDistance / totalDistance) * 100)

    // 家事按分のためのパーセンテージなので、合計100%になるようにする
    const privatePercentage = totalDistance === 0 ? 0 : 100 - officialPercentage

    const summary: Summary = {
      year: this.yearMonth.getYear().get(),
      month: this.yearMonth.getMonth().get(),
      totalOfficialDistance,
      totalPrivateDistance,
      officialPercentage,
      privatePercentage,
    }

    const monthlyRecords: MonthlyRecords = {
      summary: summary,
      records: this.sessionRecords,
    }

    return Response.of200(monthlyRecords)
  }
}
