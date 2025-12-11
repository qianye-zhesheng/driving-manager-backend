import { CorsHeaders } from '../../../../src/config/cors-headers'
import event from '../../../../events/session/event-get-monthly-records.json'
import { QueryValidator } from '../../../../src/domains/session/monthly/query-validator'
import { ValidationResult } from '../../../../src/domains/session/validation-result'
import { getMonthlyRecordsHandler } from '../../../../src/handlers/session/get-monthly-records'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { AuthUserInfo } from '../../../../src/auth/auth-user-info'
import { QueryParser } from '../../../../src/domains/session/monthly/query-parser'
import { DrivingSessionSearcher } from '../../../../src/domains/session/monthly/driving-session-searcher'
import { Response } from '../../../../src/domains/session/monthly/response'
import { Year } from '../../../../src/domains/session/monthly/year'
import { YearMonthQuery } from '../../../../src/domains/session/monthly/year-month-query'
import { Month } from '../../../../src/domains/session/monthly/month'
import { MonthlyRecords } from '../../../../src/domains/session/monthly/monthly-records'

describe('getMonthlyRecords handler', () => {
  const headers: { [header: string]: string } = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  }

  const monthlyRecords: MonthlyRecords = {
    summary: {
      year: 2025,
      month: 1,
      totalOfficialDistance: 0,
      totalPrivateDistance: 0,
      officialPercentage: 0,
      privatePercentage: 0,
    },
    records: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()

    jest.spyOn(CorsHeaders, 'get').mockReturnValue(headers)
    jest
      .spyOn(QueryParser.prototype, 'parse')
      .mockReturnValue(YearMonthQuery.of(Year.of('2025'), Month.of('1')))
  })

  test('クエリのバリデーションエラーの場合は、400を返すこと', async () => {
    jest
      .spyOn(QueryValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.invalid('year is required'))

    jest.spyOn(AuthUserInfo.prototype, 'isNotAuthenticated').mockReturnValue(false)

    jest.spyOn(DrivingSessionSearcher.prototype, 'search').mockResolvedValue({} as any)

    const result = await getMonthlyRecordsHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(400)
    expect(result.body).toBe(JSON.stringify({ message: 'year is required' }))

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
    expect(QueryValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(AuthUserInfo.prototype.isNotAuthenticated).toHaveBeenCalledTimes(0)
    expect(QueryParser.prototype.parse).toHaveBeenCalledTimes(0)
    expect(DrivingSessionSearcher.prototype.search).toHaveBeenCalledTimes(0)
  })

  test('認証されていない場合は、401を返すこと', async () => {
    jest.spyOn(QueryValidator.prototype, 'validate').mockReturnValue(ValidationResult.valid())

    jest.spyOn(AuthUserInfo.prototype, 'isNotAuthenticated').mockReturnValue(true)

    jest.spyOn(DrivingSessionSearcher.prototype, 'search').mockResolvedValue({} as any)

    const result = await getMonthlyRecordsHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(401)
    expect(result.body).toBe(JSON.stringify({ message: 'Unauthorized' }))

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
    expect(QueryValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(AuthUserInfo.prototype.isNotAuthenticated).toHaveBeenCalledTimes(1)
    expect(QueryParser.prototype.parse).toHaveBeenCalledTimes(0)
    expect(DrivingSessionSearcher.prototype.search).toHaveBeenCalledTimes(0)
  })

  test('サーバーエラーの場合は、500を返すこと', async () => {
    jest.spyOn(QueryValidator.prototype, 'validate').mockReturnValue(ValidationResult.valid())

    jest
      .spyOn(AuthUserInfo, 'from')
      .mockReturnValue({ isNotAuthenticated: () => false, getUserId: () => 'user123' } as any)

    jest
      .spyOn(DrivingSessionSearcher.prototype, 'search')
      .mockRejectedValue(new Error('search error'))

    const result = await getMonthlyRecordsHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(500)
    expect(result.body).toBe(JSON.stringify({ message: 'search error' }))

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
    expect(QueryValidator.prototype.validate).toHaveBeenCalled()
    expect(AuthUserInfo.from).toHaveBeenCalledTimes(1)
    expect(QueryParser.prototype.parse).toHaveBeenCalledTimes(1)
    expect(DrivingSessionSearcher.prototype.search).toHaveBeenCalledTimes(1)
  })

  test('正常終了した場合は、200を返すこと', async () => {
    jest.spyOn(QueryValidator.prototype, 'validate').mockReturnValue(ValidationResult.valid())

    jest
      .spyOn(AuthUserInfo, 'from')
      .mockReturnValue({ isNotAuthenticated: () => false, getUserId: () => 'user123' } as any)

    jest.spyOn(DrivingSessionSearcher.prototype, 'search').mockResolvedValue({
      calc: () => ({ summarize: () => Response.of200(monthlyRecords) }),
    } as any)

    const result = await getMonthlyRecordsHandler(event as APIGatewayProxyEvent)

    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify(monthlyRecords))

    expect(CorsHeaders.get).toHaveBeenCalledTimes(1)
    expect(QueryValidator.prototype.validate).toHaveBeenCalled()
    expect(AuthUserInfo.from).toHaveBeenCalledTimes(1)
    expect(QueryParser.prototype.parse).toHaveBeenCalledTimes(1)
    expect(DrivingSessionSearcher.prototype.search).toHaveBeenCalledTimes(1)
  })
})
