// https://github.com/toncenter/tonweb/blob/f3304156fb3000e96a7ed10123ae31185792d05a/src/utils/Address.js
import { crc16, hexToBytes, bytesToHex, stringToBytes, base64encode, base64decode } from '~/utils.js';
import { IS_TESTNET } from '~/config.js';

/* eslint no-bitwise: "off" */

const ADDRESS_TAG_NON_BOUNCEABLE = 0x51;
const ADDRESS_TAG_BOUNCEABLE = 0x11;
const ADDRESS_FLAG_TEST_ONLY = 0x80;

/**
 * @param  {String} addressString
 * @return {Object}
 */
const parseUnfriendlyAddress = function getRawAddressInfo(addressString) {
    const arr = addressString.split(':');

    if (arr.length !== 2) {
        throw new Error(`Invalid address: ${addressString}`);
    }

    const wc = parseInt(arr[0], 10);

    if (wc !== 0 && wc !== -1) {
        throw new Error(`Invalid address wc: ${addressString}`);
    }

    const hex = arr[1];

    if (hex.length !== 64) {
        throw new Error(`Invalid address hex: ${addressString}`);
    }

    return {
        workchain: wc,
        hashPart: hexToBytes(hex),
    };
};

/**
 * @param  {String} addressString
 * @return {Object}
 */
const parseFriendlyAddress = function getBase64AddressInfo(addressString, validateHash = false) {
    if (addressString.length !== 48) {
        throw new Error('User-friendly address should contain strictly 48 characters');
    }

    const data = stringToBytes(base64decode(addressString));

    if (data.length !== 36) {
        throw new Error('Unknown address type: byte length is not equal to 36');
    }

    const addr = data.slice(0, 34);
    const dataView = new DataView(addr.buffer);

    if (validateHash) {
        const calculatedHash = crc16(addr);
        const currentHash = data.slice(34, 36);

        if (calculatedHash.some((value, position) => value !== currentHash[position])) {
            throw new Error('Wrong crc16 hashsum');
        }
    }

    let isTestOnly = false;
    let tag = dataView.getInt8(0);

    if (tag & ADDRESS_FLAG_TEST_ONLY) {
        isTestOnly = true;
        tag ^= ADDRESS_FLAG_TEST_ONLY;
    }

    if ((tag !== ADDRESS_TAG_BOUNCEABLE) && (tag !== ADDRESS_TAG_NON_BOUNCEABLE)) {
        throw new Error(`Unknown address tag: ${tag}`);
    }

    return {
        workchain: dataView.getInt8(1),
        hashPart: addr.slice(2, 34),
        isBounceable: tag === ADDRESS_TAG_BOUNCEABLE,
        isUrlSafe: !addressString.includes('-') && !addressString.includes('/'),
        isTestOnly,
    };
};

export class Address {
    /**
     * @param anyForm {string | Address}
     * @return {undefined}
     */
    constructor(anyForm) {
        if (anyForm === null || anyForm === undefined) {
            throw new Error('Invalid address');
        }

        if (anyForm instanceof Address) {
            this.wc = anyForm.wc;
            this.hashPart = anyForm.hashPart;
            this.isUserFriendly = anyForm.isUserFriendly;
            this.isBounceable = anyForm.isBounceable;
            this.isTestOnly = anyForm.isTestOnly;
            this.isUrlSafe = anyForm.isUrlSafe;
            return;
        }

        if (anyForm.includes(':')) {
            const { workchain, hashPart } = parseUnfriendlyAddress(anyForm);

            this.wc = workchain;
            this.hashPart = hashPart;
            this.isUserFriendly = false;
            this.isBounceable = false;
            this.isTestOnly = false;
            this.isUrlSafe = true;
            return;
        }

        const { workchain, hashPart, isBounceable, isTestOnly, isUrlSafe } = parseFriendlyAddress(anyForm);

        this.wc = workchain;
        this.hashPart = hashPart;
        this.isUserFriendly = true;
        this.isBounceable = isBounceable;
        this.isTestOnly = isTestOnly;
        this.isUrlSafe = isUrlSafe;
    }

    /**
     * Factory:
     */
    static parse(anyForm) {
        return new Address(anyForm);
    }

    /**
     * @param  {Boolean} options.userFriendly
     * @param  {Boolean} options.bouncable
     * @param  {Boolean} options.testOnly
     * @return {String}
     */
    toString({ userFriendly, bouncable, testOnly }) {
        const isUserFriendly = userFriendly ?? this.isUserFriendly;
        const isBounceable = bouncable ?? this.isBounceable;
        const isTestOnly = testOnly ?? this.isTestOnly;

        if (!isUserFriendly) {
            return `${this.wc}:${bytesToHex(this.hashPart)}`;
        }

        let tag = isBounceable
            ? ADDRESS_TAG_BOUNCEABLE
            : ADDRESS_TAG_NON_BOUNCEABLE;

        if (isTestOnly) {
            tag |= ADDRESS_FLAG_TEST_ONLY;
        }

        // 1 byte tag + 1 byte workchain + 32 bytes hash + 2 byte crc
        const addr = Int8Array.of(tag, this.wc, ...this.hashPart, 0x0, 0x0);
        const hash = crc16(addr.slice(0, 34));
        addr.set(hash, 34);

        return base64encode(String.fromCharCode.apply(null, new Uint8Array(addr)));
    }
}

/**
 * @param  {String} address
 * @return {String}
 */
export const canonizeAddress = function convertAddressToAppropriateFormat(address, { type } = {}) {
    const addressMustBeUnbounceable = ['wallet', 'uninit'].includes(type);
    const givenAddressIsUserFriendly = address.length === 48;
    const givenAddressIsUnbounceable = address.startsWith('U') || address.startsWith('0');

    if (givenAddressIsUserFriendly) {
        // Skip serialization if address is already in correct format:
        if (addressMustBeUnbounceable === givenAddressIsUnbounceable) {
            return address;
        }
    }

    return Address.parse(address).toString({
        bouncable: !addressMustBeUnbounceable,
        testOnly: IS_TESTNET,
        userFriendly: true,
    });
};

/**
 * @param  {String}  addressString
 * @return {Boolean}
 */
export const isValidAddress = function checkWhetherTheStringIsValidTonAddress(addressString) {
    if (addressString.length !== 48 && addressString.length !== 66) {
        return false;
    }

    try {
        const _ = new Address(addressString); /* eslint no-unused-vars: "off" */
        return true;
    } catch {
        return false;
    }
};

/**
 * Checks addresses base64-encoded hash part (from second to 44-th symbol).
 *
 * @param  {String|null}  a
 * @param  {String|null}  b
 * @return {Boolean}
 */
export const isSameAddress = function fastCheckAddressesHashPartsAreSame(a, b) {
    if (a === b) {
        return true;
    }

    if (!a || !b) {
        return false;
    }

    return a.length === b.length
        && a.substring(1, 44) === b.substring(1, 44);
};
