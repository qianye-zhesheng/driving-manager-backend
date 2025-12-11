export class Year {
  private constructor(private readonly value: number) {}

  public static of(rawValue: string | undefined): Year {
    if (rawValue === undefined) {
      throw new Error('year is required')
    }

    if (rawValue.length !== 4 || isNaN(Number(rawValue))) {
      throw new Error('year must be a 4-digit number string')
    }

    const yearNum = Number(rawValue)
    if (yearNum < 1900 || yearNum > 2100) {
      throw new Error('year must be between 1900 and 2100')
    }
    return new Year(yearNum)
  }

  public get(): number {
    return this.value
  }
}
