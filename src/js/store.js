import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';
import { ADDRBOOK_LOCATION, APP_MAIN_LOCALE, APP_MAIN_EXCHANGE_CURRENCY, APP_MAIN_THEME, APP_MAIN_TX_SOURCE } from '~/config.js';
import { getExchangeRateAndTrend } from '~/api/coingecko.js';

Vue.use(Vuex);

const saveToLs = function saveValueToLocalStorage(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
};

const getFromLs = (key, defaultValue = null) => {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
};

// migration from old format, remove after some time and replace with _schema_version_:
const getRecentSearchesFromLs = () => {
    const searches = getFromLs('searchRecentAddresses', []);

    searches.forEach((item) => {
        if (!item.key) {
            item.key = `recent_${item.address}`;
            item.address_type = 'address';
            item.image = null;
            item.routeParams = { address: item.address };
        }
    });

    return searches.map(Object.freeze);
};

/* eslint no-param-reassign: "off" */
export default new Vuex.Store({
    state: {
        addrbook: {},
        timeFormatData: window.localStorage.getItem('timeFormatData') || 'relative',
        transactionViewData: window.localStorage.getItem('transactionViewData') || 'alternative',
        exchangeRate: 0,
        exchangeRateTrend: 0,
        filterShow: false,
        exchangeRateCurrency: window.localStorage.getItem('exchangeRateCurrency') || APP_MAIN_EXCHANGE_CURRENCY,
        appLocale: window.localStorage.getItem('appLocale') || APP_MAIN_LOCALE,
        appLocalePreferenceSet: window.localStorage.getItem('appLocale') !== null,
        appTheme: window.localStorage.getItem('appTheme') || APP_MAIN_THEME,
        appIsScrolled: false,
        searchRecentAddresses: getRecentSearchesFromLs(),
        txTableSource: window.localStorage.getItem('txTableSource') || APP_MAIN_TX_SOURCE, // Temporary set default to tonapi (APP_MAIN_TX_SOURCE)
    },

    mutations: {
        updateFilterShow(state, payload) {
            state.filterShow = payload;
        },

        updateTimeFormatData(state, payload) {
            state.timeFormatData = payload;
        },

        updateTransactionViewData(state, payload) {
            state.transactionViewData = payload;
        },

        updateLocale(state, locale) {
            state.appLocale = locale;
            state.appLocalePreferenceSet = true;
            window.localStorage.setItem('appLocale', locale);
        },

        updateExchangeRateCurrency(state, currency) {
            state.exchangeRateCurrency = currency;
            window.localStorage.setItem('exchangeRateCurrency', currency);
        },

        updateTheme(state, theme) {
            state.appTheme = theme;
            window.localStorage.setItem('appTheme', theme);
        },

        updateScrollState(state, isScrolled) {
            state.appIsScrolled = isScrolled;
        },

        updateTxTableSource(state, source) {
            state.txTableSource = source;
            window.localStorage.setItem('txTableSource', source);
        },

        updateRecentSearch(state, { suggestion, forget }) {
            const routes = state.searchRecentAddresses;

            const idx = routes.findIndex((route) => {
                // older entries don't have key:
                const key = route.key ?? route.address;
                return key === suggestion.key;
            });

            // if we already have this address, remove it,
            // since it'll either way be added to the top:
            if (idx >= 0) {
                routes.splice(idx, 1);
            }

            // store only limited set of records:
            if (routes.length >= 8) {
                routes.splice(7, routes.length);
            }

            // push new item to the top of the list:
            if (!forget) {
                routes.unshift(Object.freeze(suggestion));
            } else {
                // if forgetting the item, just do nothing
            }

            saveToLs('searchRecentAddresses', routes);
        },

        updateAddrbook(state, data) {
            const addrbook = {};
            const defaultInfo = {
                isScam: false,
                name: undefined,
            };

            Object.entries(data).forEach(([address, mixedData]) => {
                const addressInfo = typeof mixedData === 'string'
                    ? { ...defaultInfo, name: mixedData }
                    : { ...defaultInfo, ...mixedData };

                addrbook[address] = Object.freeze(addressInfo);
            });

            state.addrbook = addrbook;
        },

        /**
         * @param  {Object} state
         * @param  {Number} options.rate
         * @param  {Number} options.trend
         * @return {undefined}
         */
        updateExchangeRate(state, { rate, trend }) {
            state.exchangeRate = rate;
            state.exchangeRateTrend = trend;
        },
    },

    actions: {
        rememberRecentSearch({ commit }, suggestion) {
            commit('updateRecentSearch', { suggestion, forget: false });
        },

        forgetRecentSearch({ commit }, suggestion) {
            commit('updateRecentSearch', { suggestion, forget: true });
        },

        getAddrbook({ commit }) {
            return axios.get(ADDRBOOK_LOCATION).then(({ data }) => {
                commit('updateAddrbook', Object.freeze(data));
            });
        },

        getExchangeRates({ state, commit }) {
            commit('updateExchangeRate', {});

            return getExchangeRateAndTrend(state.exchangeRateCurrency).then(([rate, trend]) => {
                commit('updateExchangeRate', { rate, trend });
            });
        },
    },

    getters: {
        getAddressMeta: (state) => (address) => state.addrbook[address] || {}, // eslint-disable-line arrow-parens
        getAddressName: (state) => (address) => state.addrbook[address]?.name || address, // eslint-disable-line arrow-parens
    },
});
