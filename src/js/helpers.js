// eslint-disable-next-line import/no-cycle
import { decimateData } from './decimation.js';

export const MULTIPLIER = 10 ** 9;
export const AMOUNT_OF_DATA_ON_MOBILE = 20;
export const AMOUNT_OF_DATA_ON_TABLET = 7;

const feeFormatter = new Intl.NumberFormat('fullwide', {
    maximumFractionDigits: 9,
    minimumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
});

export const formatTons = function formatNanoTonsLimitNumberLength(value, decimals = 9, round = false) {
    const valueMultiplier = Number.isInteger(decimals)
        ? Math.pow(10, decimals) /* eslint prefer-exponentiation-operator: "off", no-restricted-properties: "off" */
        : MULTIPLIER;

    return round
        ? currencyFormatter.format(value / valueMultiplier)
        : feeFormatter.format(value / valueMultiplier);
};

export const formatFiat = function formatFiatValue(value) {
    return currencyFormatter.format(value / MULTIPLIER);
};

export const formatDate = (dateValue) => {
    const date = new Date(Number(dateValue));
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};

export const formatValidatorDate = (timestamp, locale) => {
    const date = new Date(timestamp * 1000);

    const dateFormat = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });

    const formattedDate = dateFormat.format(date);

    return `${formattedDate}`;
};

export const getCurrencyFormatter = (locale, currency) => new Intl.NumberFormat(locale, { style: 'currency', currency });

export const getCurrencyFormatterBelowZero = (locale, currency) => new Intl.NumberFormat(locale, { style: 'currency', currency, minimumSignificantDigits: 4, maximumSignificantDigits: 4 });

export const formatFee = formatTons;

export const decimateDataset = (dataset, offset) => ({ ...dataset, data: decimateData(dataset.data, offset) });

export const shrinkAddress = (address) => {
    const ellipsis = '...';

    const visibleTextLength = Math.max(0, 20 - ellipsis.length);

    const partLength = Math.floor(visibleTextLength / 2);
    return address.slice(0, partLength) + ellipsis + address.slice(-partLength);
};

export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
};
