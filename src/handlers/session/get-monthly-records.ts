import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { CorsHeaders } from '../../config/cors-headers'

export const getMonthlyRecordsHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // All log statements are written to CloudWatch
  console.info('received:', event)

  const parameters = event.multiValueQueryStringParameters || {}
  const year = parameters.year
  const month = parameters.month

  console.log(`Fetching records for Year: ${year}, Month: ${month}`)

  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({ message: 'success', receivedYear: year, receivedMonth: month }),
    headers: CorsHeaders.get(),
  }

  return result
}
