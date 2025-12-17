import { CorsHeaders } from '../../../../src/config/cors-headers'
import event from '../../../../events/dashboard/event-get-current-info.json'
import { getCurrentInfoHandler } from '../../../../src/handlers/dashboard/get-current-info'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { AuthUserInfo } from '../../../../src/auth/auth-user-info'
import { Response } from '../../../../src/domains/dashboard/response'
import { DashboardRepository } from '../../../../src/domains/dashboard/dashboard-repository'
import { CheckResult, DrivingSession } from '../../../../src/domains/dashboard/current-info'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE: string = 'Asia/Tokyo'

describe('getMonthlyRecords handler', () => {
  const headers: { [header: string]: string } = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }

  const checkResult: CheckResult = {
    checkedAt: '2025-12-01T10:00:00+09:00',
    judgement: '運行停止',
  }

  const drivingSession: DrivingSession = {
    date: '2025-12-01',
    startOdometer: 13000,
  }

  const today = dayjs().tz(TIMEZONE).format('YYYY-MM-DD')

  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()

    jest.spyOn(CorsHeaders, 'get').mockReturnValue(headers)
  })

  test('認証されていない場合は、401を返すこと', async () => {
    jest.spyOn(AuthUserInfo.prototype, 'isNotAuthenticated').mockReturnValue(true)
    jest.spyOn(DashboardRepository.prototype, 'findLatestCheckAnswer').mockResolvedValue(null)
    jest.spyOn(DashboardRepository.prototype, 'findActiveDrivingSession').mockResolvedValue(null)

    const result = await getCurrentInfoHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(401)
    expect(result.body).toBe(JSON.stringify({ message: 'Unauthorized' }))

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
    expect(AuthUserInfo.prototype.isNotAuthenticated).toHaveBeenCalledTimes(1)
    expect(DashboardRepository.prototype.findLatestCheckAnswer).toHaveBeenCalledTimes(0)
    expect(DashboardRepository.prototype.findActiveDrivingSession).toHaveBeenCalledTimes(0)
  })

  test('findLatestCheckAnswerでサーバーエラーの場合は、500を返すこと', async () => {
    jest
      .spyOn(AuthUserInfo, 'from')
      .mockReturnValue({ isNotAuthenticated: () => false, getUserId: () => 'user123' } as any)

    jest
      .spyOn(DashboardRepository.prototype, 'findLatestCheckAnswer')
      .mockRejectedValue(new Error('search error'))

    jest.spyOn(DashboardRepository.prototype, 'findActiveDrivingSession').mockResolvedValue(null)

    const result = await getCurrentInfoHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(JSON.stringify({ message: 'search error' }))

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
    expect(AuthUserInfo.from).toHaveBeenCalledTimes(1)
    expect(DashboardRepository.prototype.findLatestCheckAnswer).toHaveBeenCalledTimes(1)
    expect(DashboardRepository.prototype.findActiveDrivingSession).toHaveBeenCalledTimes(0)
  })

  test('findActiveDrivingSessionでサーバーエラーの場合は、500を返すこと', async () => {
    jest
      .spyOn(AuthUserInfo, 'from')
      .mockReturnValue({ isNotAuthenticated: () => false, getUserId: () => 'user123' } as any)

    jest.spyOn(DashboardRepository.prototype, 'findLatestCheckAnswer').mockResolvedValue(null)

    jest
      .spyOn(DashboardRepository.prototype, 'findActiveDrivingSession')
      .mockRejectedValue(new Error('search error'))

    const result = await getCurrentInfoHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(JSON.stringify({ message: 'search error' }))

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
    expect(AuthUserInfo.from).toHaveBeenCalledTimes(1)
    expect(DashboardRepository.prototype.findLatestCheckAnswer).toHaveBeenCalledTimes(1)
    expect(DashboardRepository.prototype.findActiveDrivingSession).toHaveBeenCalledTimes(1)
  })

  test('正常終了した場合は、200を返すこと', async () => {
    jest
      .spyOn(AuthUserInfo, 'from')
      .mockReturnValue({ isNotAuthenticated: () => false, getUserId: () => 'user123' } as any)

    jest
      .spyOn(DashboardRepository.prototype, 'findLatestCheckAnswer')
      .mockResolvedValue(checkResult)

    jest.spyOn(DashboardRepository.prototype, 'findActiveDrivingSession').mockResolvedValue(null)

    const result = await getCurrentInfoHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ todaysCheck: checkResult }))

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
    expect(AuthUserInfo.from).toHaveBeenCalledTimes(1)
    expect(DashboardRepository.prototype.findLatestCheckAnswer).toHaveBeenCalledWith(
      'user123',
      today,
    )
    expect(DashboardRepository.prototype.findActiveDrivingSession).toHaveBeenCalledTimes(1)
  })
})
