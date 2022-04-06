export default class Log  {
  constructor(prefix) {
    this.mark = 'TRTCSimpleDemo';
    this.prefix = prefix || '';
  }

  setPrefix(param) {
    let prefix = `[${this.mark}`;
    if (this.prefix.length > 0) {
      prefix += `.${this.prefix}]:`;
    } else {
      prefix += ']:';
    }
    param.unshift(prefix);
  }

  log() {
    const param = Array.from(arguments);
    this.setPrefix(param);
    console.log.apply(console, param);
  }

  warn() {
    const param = Array.from(arguments);
    this.setPrefix(param);
    console.warn.apply(console, param);
  }

  error() {
    const param = Array.from(arguments);
    this.setPrefix(param);
    console.error.apply(console, param);
  }
}
