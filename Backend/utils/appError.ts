class appError extends Error {
  
  public readonly statusCode    : number;
  public readonly status        : 'fail' | 'error';
  public readonly isOperational : boolean; 

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode    = statusCode;
    this.status        = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // 1. Fix standard JS class extension behaviors (for compilation targets < ES2015)
    Object.setPrototypeOf(this, new.target.prototype);

    // 2. Clear class name assignment
    this.name = this.constructor.name;

    // 3. Safe environment check for V8 engines (Node.js/Chrome)
    if ('captureStackTrace' in Error && typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    } else {
      // Production fallback for other environments
      this.stack = new Error(message).stack ?? "";
    }
  }

}

export default appError;
