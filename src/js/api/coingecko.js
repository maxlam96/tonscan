/* eslint camelcase: "off" */
import axios from 'axios';
import { COINGECKO_ENDPOINT } from '~/config.js';

/**
 * @see https://www.coingecko.com/en/api/documentation
 */
const http = axios.create({
    baseURL: COINGECKO_ENDPOINT,
});

/**
 * Get historical market data include price, market cap, and 24h volume (granularity auto).
 * @param  {Number} options.days
 * @param  {String} options.currency
 * @param  {String} options.interval
 * @return {Promise<Object>}
 */
export const getMarketDataHistory = async function getPriceCapsAndVolumesHistory({ days, currency, interval, precision }) {
    const params = {
        days, interval,
        vs_currency: (currency || 'USD').toUpperCase(),
        precision: precision || 4,
    };

    const { data } = await http.get('/coins/the-open-network/market_chart', { params });

    // { prices, market_caps, total_volumes }
    return data;
};

/**
 * Get current data (name, price, market, ... including exchange tickers) for a coin.
 * @return {Promise<Object>}
 */
export const getMarketData = async function getAggregatedToncoinInfo() {
    const params = {
        localization: false,
        community_data: false,
        developer_data: false,
        market_data: true,
        tickers: false, // include exchange rates on various exchanges
        sparkline: false,
    };

    const { data } = await http.get('/coins/the-open-network', { params });

    return data;
};

/**
 * @param  {String} currency
 * @return {Promise<Array[Number, Number]>}
 */
export const getExchangeRateAndTrend = async function getBriefMarketInfo(currency) {
    const { prices } = await getMarketDataHistory({
        currency,
        days: 2,
        interval: 'daily',
    });

    const oldest = prices.shift()[1];
    const newest = prices.pop()[1];
    const trend = newest >= oldest ? 1 : -1;

    return [newest, trend];
};
