import { DrivingSession } from '../../../../../src/domains/session/driving-session'
import { FindResult } from '../../../../../src/domains/session/start/find-result'
import { StartSessionSaver } from '../../../../../src/domains/session/start/start-sessio-saver'
import { StartSessionCommonValidator } from '../../../../../src/domains/session/start/start-session-common-validator'
import { StartSessionRepository } from '../../../../../src/domains/session/start/start-session-repository'
import { StartSessionUpdateValidator } from '../../../../../src/domains/session/start/start-session-update-validator'
import { ValidationResult } from '../../../../../src/domains/session/validation-result'

describe('StartSessionSaver', () => {
  const tableName = 'DrvivingSessions'
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

  test('共通バリデーションでNGの場合、409を返すこと', async () => {
    jest
      .spyOn(StartSessionCommonValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.invalid('NG'))

    jest
      .spyOn(StartSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())

    const result = await new StartSessionSaver(
      new StartSessionRepository(tableName),
      drivingSession,
    ).save()

    expect(result.getStatusCode()).toBe(409)
    expect(result.getBody()).toBe(JSON.stringify({ message: 'NG' }))

    expect(StartSessionCommonValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(0)
  })

  test('同一日レコードがない場合、createして200を返すこと', async () => {
    jest
      .spyOn(StartSessionCommonValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(StartSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())

    jest
      .spyOn(StartSessionUpdateValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.valid())

    jest.spyOn(StartSessionRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(StartSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new StartSessionSaver(
      new StartSessionRepository(tableName),
      drivingSession,
    ).save()

    expect(result.getStatusCode()).toBe(200)

    expect(StartSessionCommonValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(StartSessionUpdateValidator.prototype.validate).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.create).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.update).toHaveBeenCalledTimes(0)
  })

  test('同一日レコードがある場合、更新時のバリデートでNGの場合、409を返すこと', async () => {
    jest
      .spyOn(StartSessionCommonValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(StartSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.of(drivingSession))

    jest
      .spyOn(StartSessionUpdateValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.invalid('NG'))

    jest.spyOn(StartSessionRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(StartSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new StartSessionSaver(
      new StartSessionRepository(tableName),
      drivingSession,
    ).save()

    expect(result.getStatusCode()).toBe(409)
    expect(result.getBody()).toBe(JSON.stringify({ message: 'NG' }))

    expect(StartSessionCommonValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(StartSessionUpdateValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.create).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.update).toHaveBeenCalledTimes(0)
  })

  test('同一日レコードがある場合、更新時のバリデートでOKの場合、200を返すこと', async () => {
    jest
      .spyOn(StartSessionCommonValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(StartSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.of(drivingSession))

    jest
      .spyOn(StartSessionUpdateValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.valid())

    jest.spyOn(StartSessionRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(StartSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new StartSessionSaver(
      new StartSessionRepository(tableName),
      drivingSession,
    ).save()

    expect(result.getStatusCode()).toBe(200)

    expect(StartSessionCommonValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(StartSessionUpdateValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.create).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.update).toHaveBeenCalledTimes(1)
  })

  test('共通バリデーションで例外発生の場合、500を返すこと', async () => {
    jest.spyOn(StartSessionCommonValidator.prototype, 'validate').mockImplementation(() => {
      throw new Error('NG')
    })

    jest
      .spyOn(StartSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())

    jest
      .spyOn(StartSessionUpdateValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.valid())

    jest.spyOn(StartSessionRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(StartSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new StartSessionSaver(
      new StartSessionRepository(tableName),
      drivingSession,
    ).save()

    expect(result.getStatusCode()).toBe(500)
    expect(result.getBody()).toBe(JSON.stringify({ message: 'NG' }))

    expect(StartSessionCommonValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(0)
    expect(StartSessionUpdateValidator.prototype.validate).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.create).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.update).toHaveBeenCalledTimes(0)
  })

  test('同一日レコードの検索で例外発生の場合、500を返すこと', async () => {
    jest
      .spyOn(StartSessionCommonValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(StartSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockImplementation(() => {
        throw new Error('NG')
      })

    jest
      .spyOn(StartSessionUpdateValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.valid())

    jest.spyOn(StartSessionRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(StartSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new StartSessionSaver(
      new StartSessionRepository(tableName),
      drivingSession,
    ).save()

    expect(result.getStatusCode()).toBe(500)
    expect(result.getBody()).toBe(JSON.stringify({ message: 'NG' }))

    expect(StartSessionCommonValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(StartSessionUpdateValidator.prototype.validate).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.create).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.update).toHaveBeenCalledTimes(0)
  })

  test('更新時のバリデートで例外発生の場合、500を返すこと', async () => {
    jest
      .spyOn(StartSessionCommonValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(StartSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.of(drivingSession))

    jest.spyOn(StartSessionUpdateValidator.prototype, 'validate').mockImplementation(() => {
      throw new Error('NG')
    })

    jest.spyOn(StartSessionRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(StartSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new StartSessionSaver(
      new StartSessionRepository(tableName),
      drivingSession,
    ).save()

    expect(result.getStatusCode()).toBe(500)
    expect(result.getBody()).toBe(JSON.stringify({ message: 'NG' }))

    expect(StartSessionCommonValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(StartSessionUpdateValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.create).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.update).toHaveBeenCalledTimes(0)
  })

  test('create時に例外発生の場合、500を返すこと', async () => {
    jest
      .spyOn(StartSessionCommonValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(StartSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.ofEmpty())

    jest
      .spyOn(StartSessionUpdateValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.valid())

    jest.spyOn(StartSessionRepository.prototype, 'create').mockImplementation(() => {
      throw new Error('NG')
    })
    jest.spyOn(StartSessionRepository.prototype, 'update').mockResolvedValue()

    const result = await new StartSessionSaver(
      new StartSessionRepository(tableName),
      drivingSession,
    ).save()

    expect(result.getStatusCode()).toBe(500)
    expect(result.getBody()).toBe(JSON.stringify({ message: 'NG' }))

    expect(StartSessionCommonValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(StartSessionUpdateValidator.prototype.validate).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.create).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.update).toHaveBeenCalledTimes(0)
  })

  test('update時に例外発生の場合、500を返すこと', async () => {
    jest
      .spyOn(StartSessionCommonValidator.prototype, 'validate')
      .mockResolvedValue(ValidationResult.valid())

    jest
      .spyOn(StartSessionRepository.prototype, 'findSameDateSessionIfExists')
      .mockResolvedValue(FindResult.of(drivingSession))

    jest
      .spyOn(StartSessionUpdateValidator.prototype, 'validate')
      .mockReturnValue(ValidationResult.valid())

    jest.spyOn(StartSessionRepository.prototype, 'create').mockResolvedValue()
    jest.spyOn(StartSessionRepository.prototype, 'update').mockImplementation(() => {
      throw new Error('NG')
    })

    const result = await new StartSessionSaver(
      new StartSessionRepository(tableName),
      drivingSession,
    ).save()

    expect(result.getStatusCode()).toBe(500)
    expect(result.getBody()).toBe(JSON.stringify({ message: 'NG' }))

    expect(StartSessionCommonValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.findSameDateSessionIfExists).toHaveBeenCalledTimes(1)
    expect(StartSessionUpdateValidator.prototype.validate).toHaveBeenCalledTimes(1)
    expect(StartSessionRepository.prototype.create).toHaveBeenCalledTimes(0)
    expect(StartSessionRepository.prototype.update).toHaveBeenCalledTimes(1)
  })
})
