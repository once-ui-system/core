/** A URL (or a redirect target) that the OG handlers refuse to request. */
export class OGUrlValidationError extends Error {
  constructor(message = "URL is not allowed") {
    super(message);
    this.name = "OGUrlValidationError";
  }
}

/** The upstream request failed in a way the handlers answer with `status`. */
export class OGFetchError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "OGFetchError";
  }
}
