import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { CorsHeaders } from '../../config/cors-headers'
import { MonthlyQueryValidator } from '../../domains/session/monthly/montyly-query-validator'
import { Response } from '../../domains/session/response'

export const getMonthlyRecordsHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // All log statements are written to CloudWatch
  console.info('received:', event)

  const validationResult = MonthlyQueryValidator.from(event.queryStringParameters).validate()

  if (validationResult.isInvalid()) {
    return Response.of400(validationResult.getErrorMessage()).toApiResult()
  }

  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({ message: 'success' }),
    headers: CorsHeaders.get(),
  }

  return result
}
