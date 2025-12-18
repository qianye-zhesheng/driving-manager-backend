import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { AnswerParam } from './answer-param'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Response } from './response'
import { CheckAnswer } from './check-answer'

export class AnswerRepository {
  private readonly ddbDocClient: DynamoDBDocumentClient
  private readonly tableName: string

  constructor(tableName: string) {
    const client = new DynamoDBClient({})
    this.ddbDocClient = DynamoDBDocumentClient.from(client)
    this.tableName = tableName
  }

  async saveAnswer(answerParam: AnswerParam, dateTime: string, userId: string): Promise<Response> {
    const checkAnswer: CheckAnswer = {
      userId: userId,
      dateTime: dateTime,
      imSafeAnswer: answerParam.imSafeAnswer,
      weatherAnswer: answerParam.weatherAnswer,
      judgement: answerParam.judgement,
    }

    const params = {
      TableName: this.tableName,
      Item: {
        user_id: checkAnswer.userId,
        date_time: checkAnswer.dateTime,
        im_safe_answer: checkAnswer.imSafeAnswer,
        weather_answer: checkAnswer.weatherAnswer,
        judgement: checkAnswer.judgement,
      },
    }

    return this.ddbDocClient
      .send(new PutCommand(params))
      .then(() => {
        return Response.of200(checkAnswer)
      })
      .catch((error) => {
        console.log('Error when saving answer:', error.stack)
        return Response.of500(error.message)
      })
  }
}
