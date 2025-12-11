import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda'
import { ValidationResult } from '../validation-result'
import { Year } from './year'
import { Month } from './month'

export class QueryValidator {
  private constructor(
    private readonly queryParams: APIGatewayProxyEventQueryStringParameters | null,
  ) {}

  public static from(
    queryParams: APIGatewayProxyEventQueryStringParameters | null,
  ): QueryValidator {
    return new QueryValidator(queryParams)
  }

  public validate(): ValidationResult {
    if (this.queryParams == null) {
      return ValidationResult.invalid('query parameters are missing')
    }

    const year = this.queryParams.year
    const month = this.queryParams.month

    try {
      Year.of(year)
      Month.of(month)
    } catch (error) {
      return ValidationResult.invalid(error.message)
    }

    return ValidationResult.valid()
  }
}
