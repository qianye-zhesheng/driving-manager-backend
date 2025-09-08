import { EndSessionRepository } from '../../../../../src/domains/session/end/end-session-repository'
import { EndSessionValidator } from '../../../../../src/domains/session/end/end-session-validator'
import { FindResult } from '../../../../../src/domains/session/end/find-result'

describe('EndSessionValidatorのテスト', () => {
  const tableName = 'DrivingSessions'
  const userId = 'user123'
  const dateNumber = 20250101
  const endOdometer = 1000

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('同日の運行記録がない場合、バリデートエラーを返すこと', async () => {
    jest
      .spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())
    jest
      .spyOn(EndSessionRepository.prototype, 'findNextSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())

    const result = await new EndSessionValidator(
      new EndSessionRepository(tableName),
      userId,
      dateNumber,
      endOdometer,
    ).validate()

    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe('先に運行を開始してください')

    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findNextSessionIfExists).toHaveBeenCalledTimes(0)
  })

  test('終了メーター値 < 同日の開始メーター値の場合、バリデートエラーを返すこと', async () => {
    jest.spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists').mockResolvedValue(
      FindResult.of({
        userId: 'user123',
        dateNumber: 20250101,
        operationDate: '2025-01-01',
        finished: false,
        startOdometer: 1001,
      }),
    )
    jest
      .spyOn(EndSessionRepository.prototype, 'findNextSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())

    const result = await new EndSessionValidator(
      new EndSessionRepository(tableName),
      userId,
      dateNumber,
      endOdometer,
    ).validate()

    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe(
      '終了メーター値は、開始メーター値よりも大きい値を指定してください',
    )

    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findNextSessionIfExists).toHaveBeenCalledTimes(0)
  })

  test('終了メーター値 = 同日の開始メーター値で、次回運行がない場合、バリデートOKを返すこと', async () => {
    jest.spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists').mockResolvedValue(
      FindResult.of({
        userId: 'user123',
        dateNumber: 20250101,
        operationDate: '2025-01-01',
        finished: false,
        startOdometer: 1000,
      }),
    )
    jest
      .spyOn(EndSessionRepository.prototype, 'findNextSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())

    const result = await new EndSessionValidator(
      new EndSessionRepository(tableName),
      userId,
      dateNumber,
      endOdometer,
    ).validate()

    expect(result.isValid()).toBe(true)

    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findNextSessionIfExists).toHaveBeenCalledTimes(1)
  })

  test('終了メーター値 > 次回開始メーター値の場合、バリデートエラーを返すこと', async () => {
    jest.spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists').mockResolvedValue(
      FindResult.of({
        userId: 'user123',
        dateNumber: 20250101,
        operationDate: '2025-01-01',
        finished: true,
        startOdometer: 900,
        endOdometer: 950,
      }),
    )
    jest.spyOn(EndSessionRepository.prototype, 'findNextSessionIfExists').mockResolvedValue(
      FindResult.of({
        userId: 'user123',
        dateNumber: 20250102,
        operationDate: '2025-01-02',
        finished: false,
        startOdometer: 999,
      }),
    )

    const result = await new EndSessionValidator(
      new EndSessionRepository(tableName),
      userId,
      dateNumber,
      endOdometer,
    ).validate()

    expect(result.isInvalid()).toBe(true)
    expect(result.getErrorMessage()).toBe(
      '終了メーター値は、次回の開始メーター値よりも小さい値を指定してください',
    )

    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findNextSessionIfExists).toHaveBeenCalledTimes(1)
  })

  test('終了メーター値 = 次回開始メーター値の場合、バリデートOKを返すこと', async () => {
    jest.spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists').mockResolvedValue(
      FindResult.of({
        userId: 'user123',
        dateNumber: 20250101,
        operationDate: '2025-01-01',
        finished: true,
        startOdometer: 900,
        endOdometer: 950,
      }),
    )
    jest.spyOn(EndSessionRepository.prototype, 'findNextSessionIfExists').mockResolvedValue(
      FindResult.of({
        userId: 'user123',
        dateNumber: 20250102,
        operationDate: '2025-01-02',
        finished: false,
        startOdometer: 1000,
      }),
    )

    const result = await new EndSessionValidator(
      new EndSessionRepository(tableName),
      userId,
      dateNumber,
      endOdometer,
    ).validate()

    expect(result.isValid()).toBe(true)

    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findNextSessionIfExists).toHaveBeenCalledTimes(1)
  })
})
