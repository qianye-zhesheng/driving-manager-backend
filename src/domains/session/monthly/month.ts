export class Month {
  private constructor(private readonly value: number) {}

  public static of(rawValue: string | undefined): Month {
    if (rawValue === undefined) {
      throw new Error('month is required')
    }

    if (rawValue.length === 0 || isNaN(Number(rawValue))) {
      throw new Error('month must be a numeric string')
    }

    const monthNum = Number(rawValue)
    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error('month must be an integer between 1 and 12')
    }

    return new Month(monthNum)
  }

  public get(): number {
    return this.value
  }
}
