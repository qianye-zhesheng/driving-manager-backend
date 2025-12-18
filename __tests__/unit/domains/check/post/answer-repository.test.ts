import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { mockClient } from 'aws-sdk-client-mock'
import { AnswerRepository } from '../../../../../src/domains/check/post/answer-repository'
import { AnswerParam } from '../../../../../src/domains/check/post/answer-param'

describe('AnswerRepositoryのテスト', () => {
  const ddbMock = mockClient(DynamoDBDocumentClient)

  const userId = 'user123'

  beforeEach(() => {
    ddbMock.reset()
  })

  test('saveAnswer should save answer and return 200 response', async () => {
    const tableName = 'TestTable'
    const repository = new AnswerRepository(tableName)

    const answerParam: AnswerParam = {
      imSafeAnswer: {
        illness: 1,
        medication: 1,
        stress: 1,
        alcohol: 1,
        fatigue: 1,
        emotion: 1,
      },
      weatherAnswer: {
        wetRoad: 1,
        visibility: 1,
        icyRoad: 1,
        snow: 1,
      },
      judgement: '制限なし',
    }
    const dateTime = '2025-01-01T10:00:00+09:00'

    ddbMock.on(PutCommand).resolves({})

    const response = await repository.saveAnswer(answerParam, dateTime, userId)

    expect(response.getStatusCode()).toBe(200)
    expect(JSON.parse(response.getBody())).toEqual({
      userId: userId,
      dateTime: dateTime,
      imSafeAnswer: answerParam.imSafeAnswer,
      weatherAnswer: answerParam.weatherAnswer,
      judgement: answerParam.judgement,
    })
  })

  test('saveAnswer should return 500 response on error', async () => {
    const tableName = 'TestTable'
    const repository = new AnswerRepository(tableName)

    const answerParam: AnswerParam = {
      imSafeAnswer: {
        illness: 1,
        medication: 1,
        stress: 1,
        alcohol: 1,
        fatigue: 1,
        emotion: 1,
      },
      weatherAnswer: {
        wetRoad: 1,
        visibility: 1,
        icyRoad: 1,
        snow: 1,
      },
      judgement: '制限なし',
    }
    const dateTime = '2025-01-01T10:00:00+09:00'

    ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'))

    const response = await repository.saveAnswer(answerParam, dateTime, userId)

    expect(response.getStatusCode()).toBe(500)
    expect(JSON.parse(response.getBody())).toEqual({ message: 'DynamoDB error' })
  })
})
