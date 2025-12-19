import { DrivingSession } from '../../../../../src/domains/session/driving-session'
import { EndSessionSaver } from '../../../../../src/domains/session/end/end-sessio-saver'
import { EndSessionRepository } from '../../../../../src/domains/session/end/end-session-repository'
import { EndSessionValidator } from '../../../../../src/domains/session/end/end-session-validator'
import { FindResult } from '../../../../../src/domains/session/end/find-result'
import { SessionParam } from '../../../../../src/domains/session/session-param'
import { ValidationResult } from '../../../../../src/domains/session/validation-result'

describe('EndSessionValidatorのテスト', () => {
  const tableName = 'DrivingSessions'
  const sessionParam: SessionParam = {
    date: '2025-01-01',
    odometer: 1001,
  }

  const userId = 'userId'

  const sameDateSession: DrivingSession = {
    userId: 'userId',
    dateNumber: 20250101,
    operationDate: '2025-01-01',
    finished: false,
    startOdometer: 1000,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('バリデートエラーがある場合、409を返すこと', async () => {
    jest
      .spyOn(EndSessionValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.invalid('バリデートエラー'))

    jest
      .spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.of(sameDateSession))

    jest.spyOn(EndSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new EndSessionSaver(
      new EndSessionRepository(tableName),
      sessionParam,
      userId,
    ).save()

    expect(result.getStatusCode()).toBe(409)
    expect(result.getBody()).toBe(JSON.stringify({ message: 'バリデートエラー' }))

    expect(EndSessionValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(0)
    expect(EndSessionRepository.prototype.update).toHaveBeenCalledTimes(0)
  })

  test('バリデートで例外が発生した場合、500を返すこと', async () => {
    jest
      .spyOn(EndSessionValidator.prototype, 'validate')
      .mockRejectedValue(new Error('バリデート例外'))

    jest
      .spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.of(sameDateSession))

    jest.spyOn(EndSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new EndSessionSaver(
      new EndSessionRepository(tableName),
      sessionParam,
      userId,
    ).save()

    expect(result.getStatusCode()).toBe(500)
    expect(result.getBody()).toBe(
      JSON.stringify({
        message: 'バリデート例外',
      }),
    )

    expect(EndSessionValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(0)
    expect(EndSessionRepository.prototype.update).toHaveBeenCalledTimes(0)
  })

  test('findSameDateSessionIfExistsで例外が発生した場合、500を返すこと', async () => {
    jest
      .spyOn(EndSessionValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockRejectedValue(new Error('findSameDateSessionIfExists例外'))

    jest.spyOn(EndSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new EndSessionSaver(
      new EndSessionRepository(tableName),
      sessionParam,
      userId,
    ).save()

    expect(result.getStatusCode()).toBe(500)
    expect(result.getBody()).toBe(
      JSON.stringify({
        message: 'findSameDateSessionIfExists例外',
      }),
    )

    expect(EndSessionValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.update).toHaveBeenCalledTimes(0)
  })

  test('updateで例外が発生した場合、500を返すこと', async () => {
    jest
      .spyOn(EndSessionValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.of(sameDateSession))

    jest.spyOn(EndSessionRepository.prototype, 'update').mockRejectedValue(new Error('update例外'))

    const result = await new EndSessionSaver(
      new EndSessionRepository(tableName),
      sessionParam,
      userId,
    ).save()

    expect(result.getStatusCode()).toBe(500)
    expect(result.getBody()).toBe(
      JSON.stringify({
        message: 'update例外',
      }),
    )

    expect(EndSessionValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.update).toHaveBeenCalledTimes(1)
  })

  test('正常に終了した場合、200を返すこと', async () => {
    jest
      .spyOn(EndSessionValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(EndSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.of(sameDateSession))

    jest.spyOn(EndSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new EndSessionSaver(
      new EndSessionRepository(tableName),
      sessionParam,
      userId,
    ).save()

    expect(result.getStatusCode()).toBe(200)
    expect(result.getBody()).toBe(
      JSON.stringify({
        userId: sameDateSession.userId,
        dateNumber: sameDateSession.dateNumber,
        operationDate: sameDateSession.operationDate,
        finished: true,
        startOdometer: 1000,
        endOdometer: 1001,
      }),
    )

    expect(EndSessionValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(EndSessionRepository.prototype.update).toHaveBeenCalledTimes(1)
  })
})
