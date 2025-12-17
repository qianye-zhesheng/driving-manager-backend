import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { Response } from '../../domains/dashboard/response'
import { AuthUserInfo } from '../../auth/auth-user-info'
import { DashboardRepository } from '../../domains/dashboard/dashboard-repository'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { CurrentInfo, CurrentInfoFactory } from '../../domains/dashboard/current-info'

const CHECK_ANSWERS_TABLE: string = process.env.CHECK_ANSWERS_TABLE as string
const DRIVING_SESSIONS_TABLE: string = process.env.DRIVING_SESSIONS_TABLE as string

const repository: DashboardRepository = new DashboardRepository(
  CHECK_ANSWERS_TABLE,
  DRIVING_SESSIONS_TABLE,
)

dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE: string = 'Asia/Tokyo'

export const getCurrentInfoHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // All log statements are written to CloudWatch
  console.info('received:', event)

  const authInfo = AuthUserInfo.from(event)
  if (authInfo.isNotAuthenticated()) {
    return Response.of401('Unauthorized').toApiResult()
  }

  const userId = authInfo.getUserId()
  const date = dayjs().tz(TIMEZONE).format('YYYY-MM-DD')

  let response: Response

  try {
    const checkResult = await repository.findLatestCheckAnswer(userId, date)
    const activeSession = await repository.findActiveDrivingSession(userId)

    const currentInfo = CurrentInfoFactory.create(checkResult, activeSession)
    response = Response.of200(currentInfo)
  } catch (error) {
    console.log(error.stack)
    response = Response.of500(error.message)
  }

  console.info(
    `response from: ${event.path} statusCode: ${response.getStatusCode()} body: ${response.getBody()}`,
  )
  return response.toApiResult()
}
