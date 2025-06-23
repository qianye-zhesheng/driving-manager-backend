import { DrivingSession } from '../../../../../src/domains/session/driving-session'
import { StartSessionUpdateValidator } from '../../../../../src/domains/session/start/start-session-update-validator'

describe('StartSessionUpdateValidator', () => {
  const drivingSession: DrivingSession = {
    userId: 'user123',
    dateNumber: 20250101,
    operationDate: '2025-01-01',
    finished: false,
    startOdometer: 10000,
  }

  test('既存の運行がまだ終了していないなら、バリデートOKを返す', () => {
    const existingDrivingSession: DrivingSession = {
      userId: 'user123',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: false,
      startOdometer: 9990,
    }

    const result = new StartSessionUpdateValidator(
      drivingSession,
      existingDrivingSession,
    ).validate()

    expect(result.isValid()).toBe(true)
  })

  test('開始 > 終了ならバリデートエラーを返す', () => {
    const existingDrivingSession: DrivingSession = {
      userId: 'user123',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 9990,
      endOdometer: 9999,
    }

    const result = new StartSessionUpdateValidator(
      drivingSession,
      existingDrivingSession,
    ).validate()

    expect(result.isValid()).toBe(false)
    expect(result.getErrorMessage()).toBe(
      '開始メーター値は、終了メーター値よりも小さい値を指定してください',
    )
  })

  test('開始 = 終了ならバリデートOKを返す', () => {
    const existingDrivingSession: DrivingSession = {
      userId: 'user123',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 9990,
      endOdometer: 10000,
    }

    const result = new StartSessionUpdateValidator(
      drivingSession,
      existingDrivingSession,
    ).validate()

    expect(result.isValid()).toBe(true)
  })

  test('開始 < 終了ならバリデートOKを返す', () => {
    const existingDrivingSession: DrivingSession = {
      userId: 'user123',
      dateNumber: 20250101,
      operationDate: '2025-01-01',
      finished: true,
      startOdometer: 9990,
      endOdometer: 10001,
    }

    const result = new StartSessionUpdateValidator(
      drivingSession,
      existingDrivingSession,
    ).validate()

    expect(result.isValid()).toBe(true)
  })
})
