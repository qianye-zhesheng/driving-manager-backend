import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { CheckResult, DrivingSession } from './current-info'

export class DashboardRepository {
  private readonly ddbDocClient: DynamoDBDocumentClient
  private readonly checkAnswersTable: string
  private readonly drivingSessionsTable: string

  constructor(checkAnswersTable: string, drivingSessionsTable: string) {
    const client = new DynamoDBClient({})
    this.ddbDocClient = DynamoDBDocumentClient.from(client)
    this.checkAnswersTable = checkAnswersTable
    this.drivingSessionsTable = drivingSessionsTable
  }

  public async findLatestCheckAnswer(userId: string, date: string): Promise<CheckResult | null> {
    const latestCheckAnswer = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: this.checkAnswersTable,
        KeyConditionExpression: 'user_id = :userId AND begins_with(date_time, :date)',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':date': date,
        },
        ScanIndexForward: false,
        Limit: 1,
      }),
    )

    if (latestCheckAnswer.Count == 0) {
      return null
    }

    return {
      checkedAt: latestCheckAnswer.Items[0].date_time,
      judgement: latestCheckAnswer.Items[0].judgement,
    }
  }

  public async findActiveDrivingSession(userId: string): Promise<DrivingSession | null> {
    const activeSession = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: this.drivingSessionsTable,
        KeyConditionExpression: 'user_id = :userId',
        FilterExpression: 'finished = :finished',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':finished': false,
        },
      }),
    )

    if (activeSession.Count == 0) {
      return null
    }

    return {
      date: activeSession.Items[0].operation_date,
      startOdometer: activeSession.Items[0].start_odometer,
    }
  }
}
