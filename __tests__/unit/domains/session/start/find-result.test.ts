import { DrivingSession } from '../../../../../src/domains/session/driving-session'
import { FindResult } from '../../../../../src/domains/session/start/find-result'

describe('FindResultのテスト', () => {
  const drivingSession: DrivingSession = {
    userId: 'user123',
    dateNumber: 20250101,
    operationDate: '2025-01-01',
    finished: false,
    startOdometer: 10000,
  }

  test('presentがtrueでdrivingSessionがundefinedなら例外を投げること', () => {
    expect(() => {
      FindResult.of(undefined)
    }).toThrow('drivingSession is required when result is present')
  })

  test('drivingSessionがあるとき、存在チェックメソッドが存在すると返すこと', () => {
    const findResult = FindResult.of(drivingSession)
    expect(findResult.exists()).toBe(true)
    expect(findResult.doesNotExist()).toBe(false)
  })

  test('drivingSessionがないとき、存在チェックメソッドが存在しないと返すこと', () => {
    const findResult = FindResult.ofEmpty()
    expect(findResult.exists()).toBe(false)
    expect(findResult.doesNotExist()).toBe(true)
  })

  test('drivingSessionがあるとき、getでそれを返すこと', () => {
    const findResult = FindResult.of(drivingSession)
    expect(findResult.get()).toEqual(drivingSession)
  })

  test('drivingSessionがないとき、getで例外を投げること', () => {
    const findResult = FindResult.ofEmpty()
    expect(() => findResult.get()).toThrow('drivingSession is not present')
  })
})
