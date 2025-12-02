export default class Logger {
  private readonly _prefix: string;
  private _debugOnceKeys: Set<string> = new Set();

  constructor(context?: string) {
    this._prefix = context ? `[TTV LOL PRO] (${context})` : "[TTV LOL PRO]";
  }

  log(...data: any[]) {
    console.log(this._prefix, ...data);
  }

  warn(...data: any[]) {
    console.warn(this._prefix, ...data);
  }

  error(...data: any[]) {
    console.error(this._prefix, ...data);
  }

  debug(...data: any[]) {
    console.debug(this._prefix, ...data);
  }

  debugOnce(key: string, ...data: any[]) {
    if (!this._debugOnceKeys.has(key)) {
      this._debugOnceKeys.add(key);
      this.debug(...data);
    }
  }
}
