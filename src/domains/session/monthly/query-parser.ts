import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda'
import { QueryValidator } from './query-validator'
import { YearMonthQuery } from './year-month-query'
import { Year } from './year'
import { Month } from './month'

export class QueryParser {
  private constructor(private readonly queryParams: APIGatewayProxyEventQueryStringParameters) {}

  public static from(queryParams: APIGatewayProxyEventQueryStringParameters | null): QueryParser {
    if (QueryValidator.from(queryParams).validate().isInvalid()) {
      throw new Error('Invalid query parameters')
    }
    return new QueryParser(queryParams)
  }

  public parse(): YearMonthQuery {
    const year = Year.of(this.queryParams.year as string)
    const month = Month.of(this.queryParams.month as string)
    return YearMonthQuery.of(year, month)
  }
}
