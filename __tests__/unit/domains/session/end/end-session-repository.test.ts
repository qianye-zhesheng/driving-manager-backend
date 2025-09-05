import { EndSessionRepository } from '../../../../../src/domains/session/end/end-session-repository'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { DrivingSession } from '../../../../../src/domains/session/driving-session'

describe('EndSessionRepositoryのテスト', () => {
  const ddbMock = mockClient(DynamoDBDocumentClient)

  const tableName = 'DrvivingSessions'

  const userId = 'user123'
  const dateNumber = 20250101

  beforeEach(() => {
    ddbMock.reset()
  })

  test('直後のレコードがある場合、findNextSessionIfExistsはそのレコードを含む結果を返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 1,
      Items: [
        {
          user_id: userId,
          date_number: 20250102,
          operation_date: '2025-01-02',
          finished: true,
          start_odometer: 10100,
          end_odometer: 10150,
        },
      ],
    })

    const result = await new EndSessionRepository(tableName).findNextSessionIfExists(
      userId,
      dateNumber,
    )

    expect(result.exists()).toBe(true)
    expect(result.get()).toEqual({
      userId: userId,
      dateNumber: 20250102,
      operationDate: '2025-01-02',
      finished: true,
      startOdometer: 10100,
      endOdometer: 10150,
    } as DrivingSession)
  })

  test('直後のレコードがない場合、findNextSessionIfExistsは空の結果を返す', async () => {
    ddbMock.on(QueryCommand).resolves({
      Count: 0,
    })

    const result = await new EndSessionRepository(tableName).findNextSessionIfExists(
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

    const result = await new EndSessionRepository(tableName).findSameDateSessionIfExists(
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

    const result = await new EndSessionRepository(tableName).findSameDateSessionIfExists(
      userId,
      dateNumber,
    )

    expect(result.exists()).toBe(false)
  })

  test('未終了のレコードを更新できる', async () => {
    ddbMock.on(UpdateCommand).resolves({})

    const repository = new EndSessionRepository(tableName)

    const existingSession: DrivingSession = {
      userId: userId,
      dateNumber: dateNumber,
      operationDate: '2025-01-01',
      finished: false,
      startOdometer: 10000,
    }

    const updatedSession: DrivingSession = {
      userId: userId,
      dateNumber: dateNumber,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 10000,
      endOdometer: 10050,
    }

    await repository.update(updatedSession, existingSession)

    expect(ddbMock.calls()).toHaveLength(1)
    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: tableName,
      Key: {
        user_id: userId,
        date_number: dateNumber,
      },
      UpdateExpression: 'set end_odometer = :endOdometer, finished = :finished',
      ConditionExpression: 'finished = :originalFinished',
      ExpressionAttributeValues: {
        ':endOdometer': 10050,
        ':finished': true,
        ':originalFinished': false,
      },
    })
  })

  test('既に終了しているレコードを更新できる', async () => {
    ddbMock.on(UpdateCommand).resolves({})

    const repository = new EndSessionRepository(tableName)

    const existingSession: DrivingSession = {
      userId: userId,
      dateNumber: dateNumber,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 10000,
      endOdometer: 10050,
    }

    const updatedSession: DrivingSession = {
      userId: userId,
      dateNumber: dateNumber,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 10000,
      endOdometer: 10100,
    }

    await repository.update(updatedSession, existingSession)

    expect(ddbMock.calls()).toHaveLength(1)
    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: tableName,
      Key: {
        user_id: userId,
        date_number: dateNumber,
      },
      UpdateExpression: 'set end_odometer = :endOdometer',
      ConditionExpression: 'end_odometer = :originalEndOdometer',
      ExpressionAttributeValues: {
        ':endOdometer': 10100,
        ':originalEndOdometer': 10050,
      },
    })
  })
})
