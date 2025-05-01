import CryptoJS from './Crypt.js';
import AkamaiException from './exception/AkamaiException.js';
import Utils from './utils/Common.js';

type AkamaiConfig = {
  algorithm?: string;
  ip?: string;
  time?: number;
  window?: number;
  acl?: string;
  url?: string;
  session?: string;
  data?: string;
  salt?: string;
  key?: string;
  delimiter?: string;
  encoding?: string | boolean;
};

class Akamai {
  _algorithm: string;
  _ip: string;
  _start_time: number;
  _window: number;
  _acl: string;
  _url: string;
  _session_id: string;
  _data: string;
  _salt: string;
  _key: string;
  _field_delimiter: string;
  _early_user_encoding: string | boolean;

  constructor(config: AkamaiConfig = {}) {
    this._algorithm = config.algorithm ? config.algorithm : 'SHA256';
    this._ip = config.ip ? config.ip : '';
    this._start_time = config.time ? config.time : 0;
    this._window = config.window ? config.window : 30000;
    this._acl = config.acl ? config.acl : '';
    this._url = config.url ? config.url : '';
    this._session_id = config.session ? config.session : '';
    this._data = config.data ? config.data : '';
    this._salt = config.salt ? config.salt : '';
    this._key = config.key ? config.key : 'xxxx';
    this._field_delimiter = config.delimiter ? config.delimiter : '~';
    this._early_user_encoding = config.encoding ? config.encoding : false;
  }

  get algorithm() {
    return this._algorithm;
  }
  set algorithm(val: string) {
    const availableAlgorithm = ['sha256', 'sha1', 'md5'];
    if (availableAlgorithm.includes(val)) {
      this._algorithm = val;
    } else {
      const message = 'Invalid Algorithm, must be one of ' + availableAlgorithm.join(' , ');
      throw new AkamaiException(message);
    }
  }
  get ip() {
    return this._ip;
  }

  getIpField() {
    if (this.ip !== '') {
      return 'ip=' + this._ip + this.delimiter;
    }
    return '';
  }

  set ip(value) {
    this._ip = value;
  }

  get startTime() {
    return this._start_time;
  }

  getStartTimeValue() {
    if (this.startTime > 0) {
      return Math.round(this.startTime / 1000);
    } else {
      const dateTime = new Date().getTime();
      const time = Math.round(dateTime / 1000);
      return time - 120;
    }
  }

  getStartTimeField() {
    return 'st=' + this.getStartTimeValue() + this.delimiter;
  }

  set startTime(startTime) {
    if (typeof startTime === 'number' && startTime > 0) {
      this._start_time = +startTime;
    } else {
      const message = 'start time input invalid or out of range';
      throw new AkamaiException(message);
    }
  }

  get window() {
    return this._window;
  }

  getExprField() {
    return 'exp=' + (this.getStartTimeValue() + this.window) + this.delimiter;
  }

  set window(window) {
    if (typeof window === 'number' && window > 0) {
      this._window = +window;
    } else {
      const message = 'window input invalid';
      throw new AkamaiException(message);
    }
  }

  get acl() {
    return this._acl;
  }

  getAclField() {
    const acl = this.acl;
    if (acl) {
      return 'acl=' + this._encode(acl) + this.delimiter;
    } else {
      return 'acl=' + this._encode('/*') + this.delimiter;
    }
  }

  set acl(acl) {
    if (this.url !== '') {
      const message = 'Cannot set both an ACL and a URL at the same time';
      throw new AkamaiException(message);
    }
    this._acl = acl;
  }

  set url(url) {
    if (this.acl) {
      const message = 'Cannot set both an ACL and a URL at the same time';
      throw new AkamaiException(message);
    }
    this._url = url;
  }

  get url() {
    return this._url;
  }

  getUrlField() {
    return this.url && !this.acl ? 'url=' + this._encode(this.url) + this.delimiter : '';
  }

  set session(sessionId) {
    this._session_id = sessionId;
  }

  get session() {
    return this._session_id;
  }

  getSessionIdField() {
    return this.session ? 'id=' + this.session + this.delimiter : '';
  }

  set data(data) {
    this._data = data;
  }

  get data() {
    return this._data;
  }

  getDataField() {
    return this.data ? 'data=' + this.data + this.delimiter : '';
  }

  set key(key) {
    const regex = new RegExp('^[a-fA-F0-9]+$');
    if (key.match(regex) && key.length % 2 === 0) {
      this._key = key;
    } else {
      const message = 'Key must be a hex string (a-f,0-9 and even number of chars';
      throw new AkamaiException(message);
    }
  }

  get key() {
    return this._key;
  }

  get salt() {
    return this._salt;
  }

  getSaltField() {
    return this.salt ? 'salt=' + this.salt + this.delimiter : '';
  }

  set salt(val) {
    this._salt = val;
  }

  get delimiter() {
    return this._field_delimiter;
  }

  set delimiter(val) {
    this._field_delimiter = val;
  }

  get userEncoding() {
    return this._early_user_encoding;
  }

  set userEncoding(val) {
    this._early_user_encoding = val;
  }

  _encode(val: string) {
    if (this.userEncoding === true) {
      return Utils.urlEncode(val);
    }
    return val;
  }

  generateToken() {
    const h2b = (str: string) => {
      let bin = '',
        pointer = 0;
      do {
        const subStr = (str[pointer] as string) + str[pointer + 1],
          hexVal = parseInt((subStr + '').replace(/[^a-f0-9]/gi, ''), 16);
        bin += String.fromCharCode(hexVal);
        pointer += 2;
      } while (pointer < str.length);
      return bin;
    };

    const token =
        this.getIpField() +
        this.getStartTimeField() +
        this.getExprField() +
        this.getAclField() +
        this.getSessionIdField() +
        this.getDataField(),
      digest = String(token) + this.getUrlField() + this.getSaltField(),
      regex = new RegExp(this.delimiter + '$'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      signature = CryptoJS.HmacSHA256(digest.replace(regex, ''), h2b(this.key));
    return token + 'hmac=' + signature;
  }
}

export default Akamai;
