import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { AnswerParam } from './answer-param'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Response } from './response'

export class AnswerRepository {
  private readonly ddbDocClient: DynamoDBDocumentClient
  private readonly tableName: string

  constructor(tableName: string) {
    const client = new DynamoDBClient({})
    this.ddbDocClient = DynamoDBDocumentClient.from(client)
    this.tableName = tableName
  }

  async saveAnswer(answerParam: AnswerParam, dateTime: string): Promise<Response> {
    const params = {
      TableName: this.tableName,
      Item: {
        user_id: answerParam.userId,
        date_time: dateTime,
        im_safe_answer: answerParam.imSafeAnswer,
        weather_answer: answerParam.weatherAnswer,
        judgement: answerParam.judgement,
      },
    }

    return this.ddbDocClient
      .send(new PutCommand(params))
      .then(() => {
        return Response.of200(answerParam, dateTime)
      })
      .catch((error) => {
        console.log('Error when saving answer:', error.stack)
        return Response.of500(error.message)
      })
  }
}
