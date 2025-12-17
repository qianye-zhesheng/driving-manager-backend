import { mockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { DashboardRepository } from '../../../../src/domains/dashboard/dashboard-repository'

describe('MonthlySessionsRepositoryのテスト', () => {
  const ddbMock = mockClient(DynamoDBDocumentClient)

  const checkAnswersTable = 'CheckAnswers'
  const drivingSessionsTable = 'DrvivingSessions'

  const userId = 'user123'

  const date = '2025-09-19'

  const latestCheckAnswer = {
    user_id: userId,
    date_time: '2025-09-19T10:00:00+09:00',
    im_safe_answer: {
      illness: 1,
      medication: 1,
      stress: 1,
      alcohol: 1,
      fatigue: 1,
      emotion: 1,
    },
    weather_answer: { wetRoad: 1, visibility: 1, icyRoad: 1, snow: 1 },
    judgement: '運行停止',
  }

  const activeDrivingSession = {
    user_id: userId,
    date_number: 20250919,
    operation_date: '2025-09-19',
    start_odometer: 13000,
    finished: false,
  }

  beforeEach(() => {
    ddbMock.reset()
    jest.restoreAllMocks()
  })

  test('findLatestCheckAnswerは該当レコードがなければnullを返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 0,
      Items: [],
    })

    const result = await new DashboardRepository(
      checkAnswersTable,
      drivingSessionsTable,
    ).findLatestCheckAnswer(userId, date)

    expect(result).toBeNull()
  })

  test('findLatestCheckAnswerは該当レコードがあればCheckResultを返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 1,
      Items: [latestCheckAnswer],
    })

    const result = await new DashboardRepository(
      checkAnswersTable,
      drivingSessionsTable,
    ).findLatestCheckAnswer(userId, date)

    expect(result).toEqual({ checkedAt: '2025-09-19T10:00:00+09:00', judgement: '運行停止' })
  })

  test('findActiveDrivingSessionは該当レコードがなければnullを返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 0,
      Items: [],
    })

    const result = await new DashboardRepository(
      checkAnswersTable,
      drivingSessionsTable,
    ).findActiveDrivingSession(userId)

    expect(result).toBeNull()
  })

  test('findActiveDrivingSessionは該当レコードがあればDrivingSessionを返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 1,
      Items: [activeDrivingSession],
    })

    const result = await new DashboardRepository(
      checkAnswersTable,
      drivingSessionsTable,
    ).findActiveDrivingSession(userId)

    expect(result).toEqual({ date: '2025-09-19', startOdometer: 13000 })
  })
})
