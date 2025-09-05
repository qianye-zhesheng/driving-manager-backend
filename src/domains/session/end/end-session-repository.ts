import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import { DrivingSession } from '../driving-session'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { FindResult } from './find-result'

export class EndSessionRepository {
  private readonly ddbDocClient: DynamoDBDocumentClient
  private readonly tableName: string

  constructor(tableName: string) {
    const client = new DynamoDBClient({})
    this.ddbDocClient = DynamoDBDocumentClient.from(client)
    this.tableName = tableName
  }

  public async findNextSessionIfExists(userId: string, dateNumber: number): Promise<FindResult> {
    const nextSession = await this.ddbDocClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'user_id = :userId AND date_number > :dateNumber',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':dateNumber': dateNumber,
        },
        ScanIndexForward: true,
        Limit: 1,
        ConsistentRead: true,
      }),
    )

    if (nextSession.Count == 0) {
      return FindResult.ofEmpty()
    }

    return FindResult.of(this.toEntity(nextSession.Items[0]))
  }

  public async findSameDateSessionIfExists(
    userId: string,
    dateNumber: number,
  ): Promise<FindResult> {
    const sameDateSession = await this.ddbDocClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          user_id: userId,
          date_number: dateNumber,
        },
        ConsistentRead: true,
      }),
    )

    if (sameDateSession.Item == undefined) {
      return FindResult.ofEmpty()
    }

    return FindResult.of(this.toEntity(sameDateSession.Item))
  }

  public async update(
    drivingSession: DrivingSession,
    existingDrivingSession: DrivingSession,
  ): Promise<void> {
    if (existingDrivingSession.finished) {
      await this.updateAlreadyFinished(drivingSession, existingDrivingSession)
      return
    }
    await this.updateUnfinished(drivingSession, existingDrivingSession)
  }

  private async updateUnfinished(
    drivingSession: DrivingSession,
    existingDrivingSession: DrivingSession,
  ): Promise<void> {
    await this.ddbDocClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          user_id: existingDrivingSession.userId,
          date_number: existingDrivingSession.dateNumber,
        },
        UpdateExpression: 'set end_odometer = :endOdometer, finished = :finished',
        ConditionExpression: 'finished = :originalFinished',
        ExpressionAttributeValues: {
          ':endOdometer': drivingSession.endOdometer,
          ':finished': drivingSession.finished,
          ':originalFinished': existingDrivingSession.finished,
        },
      }),
    )
  }

  private async updateAlreadyFinished(
    drivingSession: DrivingSession,
    existingDrivingSession: DrivingSession,
  ): Promise<void> {
    await this.ddbDocClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          user_id: existingDrivingSession.userId,
          date_number: existingDrivingSession.dateNumber,
        },
        UpdateExpression: 'set end_odometer = :endOdometer',
        ConditionExpression: 'end_odometer = :originalEndOdometer',
        ExpressionAttributeValues: {
          ':endOdometer': drivingSession.endOdometer,
          ':originalEndOdometer': existingDrivingSession.endOdometer,
        },
      }),
    )
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
