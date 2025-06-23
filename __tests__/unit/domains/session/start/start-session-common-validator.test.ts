import { DateNumber } from '../../../../../src/domains/session/date-number'
import { DrivingSession } from '../../../../../src/domains/session/driving-session'
import { FindResult } from '../../../../../src/domains/session/start/find-result'
import { StartSessionCommonValidator } from '../../../../../src/domains/session/start/start-session-common-validator'
import { StartSessionRepository } from '../../../../../src/domains/session/start/start-session-repository'

describe('StartSessionCommonValidatorのテスト', () => {
  const tableName = 'DrivingSessions'

  const drivingSession: DrivingSession = {
    userId: 'user123',
    dateNumber: 20250101,
    operationDate: '2025-01-01',
    finished: false,
    startOdometer: 10000,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('終了していない運行記録がある場合、バリデートエラーを返すこと', async () => {
    jest.spyOn(StartSessionRepository.prototype, 'existUnfinishedSessions').mockResolvedValue(true)
    jest
      .spyOn(StartSessionRepository.prototype, 'findPreviousSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())

    const result = await new StartSessionCommonValidator(
      new StartSessionRepository(tableName),
      drivingSession,
    ).validate()

    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe('終了していない運行記録を先に終了させてください')

    expect(StartSessionRepository.prototype.existUnfinishedSessions).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findPreviousSessionIfExists).toHaveBeenCalledTimes(0)
  })

  test('直前の運行記録がない場合、バリデートOKを返すこと', async () => {
    jest.spyOn(StartSessionRepository.prototype, 'existUnfinishedSessions').mockResolvedValue(false)
    jest
      .spyOn(StartSessionRepository.prototype, 'findPreviousSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())

    const result = await new StartSessionCommonValidator(
      new StartSessionRepository(tableName),
      drivingSession,
    ).validate()

    expect(result.isValid()).toBe(true)

    expect(StartSessionRepository.prototype.existUnfinishedSessions).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findPreviousSessionIfExists).toHaveBeenCalledTimes(1)
  })

  test('開始 < 直前の終了の場合、バリデートエラーを返すこと', async () => {
    jest.spyOn(StartSessionRepository.prototype, 'existUnfinishedSessions').mockResolvedValue(false)
    jest.spyOn(StartSessionRepository.prototype, 'findPreviousSessionIfExists').mockResolvedValue(
      FindResult.of({
        userId: 'user123',
        dateNumber: 20241231,
        operationDate: '2024-12-31',
        finished: true,
        startOdometer: 9990,
        endOdometer: 10001,
      }),
    )

    const result = await new StartSessionCommonValidator(
      new StartSessionRepository(tableName),
      drivingSession,
    ).validate()

    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe(
      '開始メーター値は、前回の終了メーター値よりも大きい値を指定してください',
    )

    expect(StartSessionRepository.prototype.existUnfinishedSessions).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findPreviousSessionIfExists).toHaveBeenCalledTimes(1)
  })

  test('開始 = 直前の終了の場合、バリデートOKを返すこと', async () => {
    jest.spyOn(StartSessionRepository.prototype, 'existUnfinishedSessions').mockResolvedValue(false)
    jest.spyOn(StartSessionRepository.prototype, 'findPreviousSessionIfExists').mockResolvedValue(
      FindResult.of({
        userId: 'user123',
        dateNumber: 20241231,
        operationDate: '2024-12-31',
        finished: true,
        startOdometer: 9990,
        endOdometer: 10000,
      }),
    )

    const result = await new StartSessionCommonValidator(
      new StartSessionRepository(tableName),
      drivingSession,
    ).validate()

    expect(result.isValid()).toBe(true)

    expect(StartSessionRepository.prototype.existUnfinishedSessions).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findPreviousSessionIfExists).toHaveBeenCalledTimes(1)
  })

  test('開始 > 直前の終了の場合、バリデートOKを返すこと', async () => {
    jest.spyOn(StartSessionRepository.prototype, 'existUnfinishedSessions').mockResolvedValue(false)
    jest.spyOn(StartSessionRepository.prototype, 'findPreviousSessionIfExists').mockResolvedValue(
      FindResult.of({
        userId: 'user123',
        dateNumber: 20241231,
        operationDate: '2024-12-31',
        finished: true,
        startOdometer: 9990,
        endOdometer: 9999,
      }),
    )

    const result = await new StartSessionCommonValidator(
      new StartSessionRepository(tableName),
      drivingSession,
    ).validate()

    expect(result.isValid()).toBe(true)

    expect(StartSessionRepository.prototype.existUnfinishedSessions).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findPreviousSessionIfExists).toHaveBeenCalledTimes(1)
  })
})
