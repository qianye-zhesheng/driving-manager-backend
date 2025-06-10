export class CorsHeaders {
  public static get(): { [header: string]: string } {
    return {
      'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN.replace(/'/g, ''),
      'Access-Control-Allow-Methods': process.env.ALLOW_METHODS.replace(/'/g, ''),
      'Access-Control-Allow-Headers': process.env.ALLOW_HEADERS.replace(/'/g, ''),
    }
  }
}
