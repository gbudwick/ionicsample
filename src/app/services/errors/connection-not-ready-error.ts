export class SQLConnectionNotReadyError extends Error {
    constructor(methodname: string, msg?: string) {
      super(msg ? msg : `(${methodname}) The SQL connection took too long to get ready.`);
  
      // Set the prototype explicitly.
      Object.setPrototypeOf(this, SQLConnectionNotReadyError.prototype);
    }
  }