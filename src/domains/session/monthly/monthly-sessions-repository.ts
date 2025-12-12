import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { DrivingSession } from '../driving-session'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { YearMonthQuery } from './year-month-query'
import { FindResult } from './find-result'

export class MonthlySessionsRepository {
  private readonly ddbDocClient: DynamoDBDocumentClient
  private readonly tableName: string

  constructor(tableName: string) {
    const client = new DynamoDBClient({})
    this.ddbDocClient = DynamoDBDocumentClient.from(client)
    this.tableName = tableName
  }

  public async searchSessionsByYearMonth(
    userId: string,
    yearMonthQuery: YearMonthQuery,
  ): Promise<DrivingSession[]> {
    const drivingSessions = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'user_id = :userId AND date_number BETWEEN :from AND :to',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':from': yearMonthQuery.from().get(),
          ':to': yearMonthQuery.to().get(),
        },
      }),
    )

    if (drivingSessions.Count == 0) {
      return []
    }

    return drivingSessions.Items.map((item) => this.toEntity(item))
  }

  public async findPreviousMonthLatestSessionIfExists(
    userId: string,
    currentYearMonth: YearMonthQuery,
  ): Promise<FindResult> {
    const previousSession = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'user_id = :userId AND date_number < :dateNumber',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':dateNumber': currentYearMonth.from().get(),
        },
        ScanIndexForward: false,
        Limit: 1,
      }),
    )

    if (previousSession.Count == 0) {
      return FindResult.ofEmpty()
    }

    return FindResult.of(this.toEntity(previousSession.Items[0]))
  }

  private toEntity(item: Record<string, any>): DrivingSession {
    return {
      userId: item.user_id,
      dateNumber: item.date_number,
      operationDate: item.operation_date,
      finished: item.finished,
      startOdometer: item.start_odometer,
      endOdometer: item.end_odometer,
    } as DrivingSession
  }
}
