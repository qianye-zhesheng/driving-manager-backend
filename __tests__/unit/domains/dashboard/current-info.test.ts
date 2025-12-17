import { CurrentInfoFactory } from '../../../../src/domains/dashboard/current-info'

describe('CurrentInfoFactoryのテスト', () => {
  it('both null should return empty object', () => {
    const result = CurrentInfoFactory.create(null, null)
    expect(result).toEqual({})
  })

  it('only todaysCheck should be set', () => {
    const todaysCheck = {
      checkedAt: '2025-12-17T10:00:00+09:00',
      judgement: '運行可能',
    }

    const result = CurrentInfoFactory.create(todaysCheck, null)

    expect(result).toEqual({
      todaysCheck: todaysCheck,
    })
  })

  it('only activeSession should be set', () => {
    const activeSession = {
      date: '2025-12-17',
      startOdometer: 20000,
    }

    const result = CurrentInfoFactory.create(null, activeSession)

    expect(result).toEqual({
      activeSession: activeSession,
    })
  })

  it('both present should set both fields', () => {
    const todaysCheck = {
      checkedAt: '2025-12-17T10:00:00+09:00',
      judgement: '運行停止',
    }
    const activeSession = {
      date: '2025-12-17',
      startOdometer: 25000,
    }

    const result = CurrentInfoFactory.create(todaysCheck, activeSession)

    expect(result).toEqual({
      todaysCheck: todaysCheck,
      activeSession: activeSession,
    })
  })
})
