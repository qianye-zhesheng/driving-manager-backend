import { DrivingSession } from '../driving-session'

export class FindResult {
  private constructor(
    private readonly present: boolean,
    private readonly drivingSession?: DrivingSession,
  ) {
    if (present && drivingSession == undefined) {
      throw new Error('drivingSession is required when result is present')
    }
  }

  public static of(drivingSession: DrivingSession): FindResult {
    return new FindResult(true, drivingSession)
  }

  public static ofEmpty(): FindResult {
    return new FindResult(false)
  }

  public exists(): boolean {
    return this.present
  }

  public notExist(): boolean {
    return !this.present
  }

  public get(): DrivingSession {
    if (!this.present) {
      throw new Error('drivingSession is not present')
    }
    return this.drivingSession as DrivingSession
  }
}
