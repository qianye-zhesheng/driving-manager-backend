import { StartSessionRepository } from '../../../../../src/domains/session/start/start-session-repository'
import { mockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { DrivingSession } from '../../../../../src/domains/session/driving-session'

describe('StartSessionRepositoryのテスト', () => {
  const ddbMock = mockClient(DynamoDBDocumentClient)

  const tableName = 'DrvivingSessions'

  const userId = 'user123'
  const dateNumber = 20250101

  beforeEach(() => {
    ddbMock.reset()
  })

  test('finishedではないレコードが1件もないとき、existUnfinishedSessionsはfalseを返す', async () => {
    ddbMock.on(QueryCommand).resolves({ Count: 0 })

    const result = await new StartSessionRepository(tableName).existUnfinishedSessions(
      userId,
      dateNumber,
    )

    expect(result).toBe(false)
  })

  test('finishedではないレコードが同一日のみの場合、existUnfinishedSessionsはfalseを返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 1,
      Items: [
        {
          user_id: userId,
          date_number: dateNumber,
          operation_date: '2025-01-01',
          finished: false,
          start_odometer: 10000,
        },
      ],
    })

    const result = await new StartSessionRepository(tableName).existUnfinishedSessions(
      userId,
      dateNumber,
    )

    expect(result).toBe(false)
  })

  test('finishedではないレコードが同一日とそれ以外にある場合、existUnfinishedSessionsはtrueを返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 2,
      Items: [
        {
          user_id: userId,
          date_number: dateNumber,
          operation_date: '2025-01-01',
          finished: false,
          start_odometer: 10000,
        },
        {
          user_id: userId,
          date_number: 20250102,
          operation_date: '2025-01-02',
          finished: false,
          start_odometer: 10100,
        },
      ],
    })

    const result = await new StartSessionRepository(tableName).existUnfinishedSessions(
      userId,
      dateNumber,
    )

    expect(result).toBe(true)
  })

  test('直前のレコードがある場合、findPreviousSessionIfExistsはそのレコードを含む結果を返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 1,
      Items: [
        {
          user_id: userId,
          date_number: 20241231,
          operation_date: '2024-12-31',
          finished: true,
          start_odometer: 9990,
          end_odometer: 9997,
        },
      ],
    })

    const result = await new StartSessionRepository(tableName).findPreviousSessionIfExists(
      userId,
      dateNumber,
    )

    expect(result.exists()).toBe(true)
    expect(result.get()).toEqual({
      userId: userId,
      dateNumber: 20241231,
      operationDate: '2024-12-31',
      finished: true,
      startOdometer: 9990,
      endOdometer: 9997,
    } as DrivingSession)
  })

  test('直前のレコードがない場合、findPreviousSessionIfExistsは空の結果を返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 0,
    })

    const result = await new StartSessionRepository(tableName).findPreviousSessionIfExists(
      userId,
      dateNumber,
    )

    expect(result.exists()).toBe(false)
  })

  test('同一日のレコードがある場合、findSameDateSessionIfExistsはそのレコードを含む結果を返す', async () => {
    ddbMock.on(GetCommand).resolves({
      Item: {
        user_id: userId,
        date_number: dateNumber,
        operation_date: '2025-01-01',
        finished: false,
        start_odometer: 10000,
      },
    })

    const result = await new StartSessionRepository(tableName).findSameDateSessionIfExists(
      userId,
      dateNumber,
    )

    expect(result.exists()).toBe(true)
    expect(result.get()).toEqual({
      userId: userId,
      dateNumber: dateNumber,
      operationDate: '2025-01-01',
      finished: false,
      startOdometer: 10000,
    } as DrivingSession)
  })

  test('同一日のレコードがない場合、findSameDateSessionIfExistsは空の結果を返す', async () => {
    ddbMock.on(GetCommand).resolves({})

    const result = await new StartSessionRepository(tableName).findSameDateSessionIfExists(
      userId,
      dateNumber,
    )

    expect(result.exists()).toBe(false)
  })
})
