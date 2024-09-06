/* eslint camelcase: "off", func-names: "off", no-bitwise: "off" */

// lookup tables
const to_hex_array = [];

const getHexArrayLookupTable = () => {
    if (to_hex_array.length === 0) {
        for (let ord = 0; ord <= 0xff; ord += 1) {
            let s = ord.toString(16);
            if (s.length < 2) {
                s = '0' + s;
            }
            to_hex_array.push(s);
        }
    }

    return to_hex_array;
};

/**
 * @see https://github.com/toncenter/tonweb/blob/f3304156fb3000e96a7ed10123ae31185792d05a/src/utils/Utils.js#L62
 * @param buffer  {Uint8Array}
 * @return {string}
 */
export const bytesToHex = function (buffer) {
    const hexArrayTable = getHexArrayLookupTable();
    const hexArray = [];

    for (let i = 0; i < buffer.byteLength; i += 1) {
        hexArray.push(hexArrayTable[buffer[i]]);
    }

    return hexArray.join('');
};

/**
 * @see https://github.com/toncenter/tonweb/blob/f3304156fb3000e96a7ed10123ae31185792d05a/src/utils/Utils.js#L76
 * @param hex {string}
 * @return {Array}
 */
export const hexToBytes = function (hex) {
    const bytes = [];

    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }

    return bytes;
};

/**
 * @see https://github.com/toncenter/tonweb/blob/f3304156fb3000e96a7ed10123ae31185792d05a/src/utils/Utils.js#L98
 * @param str {String}
 * @param size  {Number}
 * @return {Uint8Array}
 */
export const stringToBytes = function (str, size = 1) {
    let TypedArray = undefined;

    switch (size) {
        case 1: TypedArray = Uint8Array; break;
        case 2: TypedArray = Uint16Array; break;
        case 4: TypedArray = Uint32Array; break;
        default: throw new Error(`Invalid size: ${size}, must be 1, 2 or 4`);
    }

    const buffer = new ArrayBuffer(str.length * size);
    const bufView = new TypedArray(buffer);

    for (let i = 0; i < str.length; i += 1) {
        bufView[i] = str.charCodeAt(i);
    }

    return new Uint8Array(bufView.buffer);
};

/**
 * @see https://github.com/toncenter/tonweb/blob/f3304156fb3000e96a7ed10123ae31185792d05a/src/utils/Utils.js#L161
 * @param data  {ArrayLike<number>}
 * @return {Uint8Array}
 */
export const crc16 = function (data) {
    const poly = 0x1021;
    let reg = 0;

    const message = new Uint8Array(data.length + 2);
    message.set(data);

    message.forEach((byte) => {
        let mask = 0x80;
        while (mask > 0) {
            reg <<= 1;
            if (byte & mask) {
                reg += 1;
            }
            mask >>= 1;
            if (reg > 0xffff) {
                reg &= 0xffff;
                reg ^= poly;
            }
        }
    });

    return Uint8Array.of(Math.floor(reg / 256), reg % 256);
};

/**
 * @param  {Number|String} value
 * @return {String}
 */
export const dechex = function signedIntToHex(value) {
    return parseInt(value, 10).toString(16).replace('-', '');
};

export const toBase64Web = base64 => base64.replace(/\+/g, '-').replace(/\//g, '_');
export const toBase64Rfc = base64 => base64.replace(/\-/g, '+').replace(/_/g, '/'); // eslint-disable-line no-useless-escape
export const base64decode = base64 => window.atob(toBase64Rfc(base64));

/**
 * @param  {String} value
 * @param  {Boolean} options.webSafe
 * @return {String}
 */
export const base64encode = function (value, { webSafe = true } = {}) {
    const encoded = window.btoa(value);
    return webSafe ? toBase64Web(encoded) : toBase64Rfc(encoded);
};

/**
 * @param  {String} base64
 * @return {Uint8Array}
 */
export const base64ToBytes = function (base64) {
    const binaryString = base64decode(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
};

/**
 * @param  {String} hex
 * @param  {Boolean} options.webSafe
 * @return {String}
 */
export const hexToBase64 = function (hex, { webSafe = false } = {}) {
    const bytes = String.fromCharCode(...hexToBytes(hex));
    return base64encode(bytes, { webSafe });
};

/**
 * @param  {String} base64
 * @return {String}
 */
export const base64ToHex = function (base64) {
    const raw = base64decode(base64);

    let result = '';
    for (let i = 0; i < raw.length; i += 1) {
        const hex = raw.charCodeAt(i).toString(16);
        result += (hex.length === 2 ? hex : '0' + hex);
    }

    return result;
};

/**
 * @param  {String} name
 * @return {String}
 */
export const getCSSVar = (name) => {
    return getComputedStyle(document.body).getPropertyValue(`--${name}`).trim();
};

/**
 * @param  {String} data
 * @return {Object}
 */
export const parseCsv = function convertCsvStringToObject(data) {
    const lines = data.split('\n');
    const keys = lines[0].split(',');

    return lines.slice(1).map((line) => { /* eslint arrow-body-style: "off" */
        return line.split(',').reduce((previousItems, currentValue, idx) => {
            const key = keys[idx];
            return { ...previousItems, [key]: currentValue.trim() };
        }, {});
    });
};
