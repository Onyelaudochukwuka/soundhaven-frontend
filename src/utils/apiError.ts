export class ApiError<T = unknown> extends Error {
    response?: {
      status?: number;
      statusText?: string;
      json?: () => Promise<T>;
    };
  
    constructor(message: string, response?: ApiError<T>['response']) {
      super(message); // Pass message to the Error constructor
      this.name = 'ApiError'; // Set the error name to "ApiError"
      this.response = response; // Attach the response object if provided
    }
  }
  