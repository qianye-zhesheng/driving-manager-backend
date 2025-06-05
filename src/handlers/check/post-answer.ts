import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { ParamValidator } from '../../domains/check/post/param-validator'
import { ParamParser } from '../../domains/check/post/param-parser'
import { AnswerParam } from '../../domains/check/post/answer-param'

const client = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME: string = process.env.CHECK_ANSWERS_TABLE as string

dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE: string = 'Asia/Tokyo'

/**
 * 運行前チェック結果を受け取って保存する
 */
export const postAnswerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== 'POST') {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`)
  }

  // All log statements are written to CloudWatch
  console.info('received:', event)

  const validationResult = ParamValidator.of(event.body).validate()

  if (validationResult.isInvalid()) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: validationResult.getErrorMessage(),
      }),
    }
  }

  const answerParam: AnswerParam = ParamParser.from(event.body as string).parse()

  const dateTime: string = dayjs().tz(TIMEZONE).format()

  const params = {
    TableName: TABLE_NAME,
    Item: {
      user_id: answerParam.userId,
      date_time: dateTime,
      im_safe_answer: answerParam.imSafeAnswer,
      weather_answer: answerParam.imSafeAnswer,
      judgement: answerParam.judgement,
    },
  }

  try {
    const data = await ddbDocClient.send(new PutCommand(params))
    console.log('Success - item added or updated', data)
  } catch (err) {
    console.log('Error', err.stack)
  }

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify(answerParam),
  }

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`,
  )
  return response
}
