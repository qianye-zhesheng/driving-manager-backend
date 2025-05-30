import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { ImSafeAnswer, WeatherAnswer } from '../../logic/check/interfaces'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { PostAnswerValidator } from '../../validator/check/post-answer-validator'
import { AnswerParam } from '../../validator/check/answer-param'

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

  const validationResult = PostAnswerValidator.of(event.body).validate()

  if (validationResult.isInvalid()) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: validationResult.getErrorMessage(),
      }),
    }
  }

  const answerParam: AnswerParam = AnswerParam.safeParse(event.body)
  //TODO たぶん、safeParseしたあと、中身を取り出す処理が必要

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
    body: JSON.stringify(body),
  }

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`,
  )
  return response
}
