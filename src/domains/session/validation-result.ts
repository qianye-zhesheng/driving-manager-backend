export class ValidationResult {
  private constructor(
    private readonly valid: boolean,
    private readonly errorMessage: string,
  ) {}

  public static valid(): ValidationResult {
    return new ValidationResult(true, '')
  }

  public static invalid(error: string): ValidationResult {
    return new ValidationResult(false, error)
  }

  public isValid(): boolean {
    return this.valid
  }

  public isInvalid(): boolean {
    return !this.valid
  }

  public getErrorMessage(): string {
    return this.errorMessage
  }
}
