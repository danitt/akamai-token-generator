class AkamaiException extends Error {
  _name: string;
  _message: string;

  constructor(message: string) {
    super(message);
    process.stderr.write(message);
    this._name = 'Akamai Exception';
    this._message = message;
  }

  get name() {
    return this._name;
  }

  set name(name) {
    this._name = name;
  }

  get message() {
    return this._message;
  }

  set message(message) {
    this._message = message;
  }
}

export default AkamaiException;
