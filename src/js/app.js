import Vue from 'vue';
import VueMeta from 'vue-meta';
import App from '~/components/App.vue';
import $bus from '~/eventBus.js';
import UiCopyButton from '~/components/UiCopyButton.vue';
import UiAddress from '~/components/UiAddress.vue';
import UiTimeago from '~/components/UiTimeago.vue';
import UiLastactive from '~/components/UiLastactive.vue';
import UiDatetime from '~/components/UiDateTime.vue';
import UiDatePeriod from '~/components/UiDatePeriod.vue';
import UiModal from '~/components/UiModal.vue';
import UiRoundImage from '~/components/UiRoundImage.vue';
import UiFiat from '~/components/UiFiat.vue';
import UiLink from '~/components/UiLink.vue';
import UiMugenScroll from '~/components/UiMugenScroll.vue';
import MediaQueriesPlugin from '~/plugins/mediaQueries.js';
import { IS_TESTNET, APP_MAIN_LOCALE } from '~/config.js';
import { formatFee, formatTons, formatFiat } from '~/helpers.js';
import VueAgile from 'vue-agile';
import i18n from '~/i18n';
import TRow from '~/framework/TRow.vue';
import TCol from '~/framework/TCol.vue';
import TContainer from '~/framework/TContainer.vue';
import TChip from '~/framework/TChip.vue';
import TBtn from '~/framework/TBtn.vue';
import TSkeletonLoader from '~/framework/TSkeletonLoader.vue';
import TSelector from '~/framework/TSelector.vue';
import TDelimiter from '~/framework/TDelimiter.vue';
import TBreadcrumbs from '~/framework/TBreadcrumbs.vue';

import store from './store.js';
import router from './router.js';

Vue.use(VueMeta, {
    refreshOnceOnNavigation: true,
});

Vue.use(MediaQueriesPlugin);
Vue.use(VueAgile);

Vue.component('ui-mugen-scroll', UiMugenScroll);
Vue.component('ui-round-image', UiRoundImage);
Vue.component('ui-copy-button', UiCopyButton);
Vue.component('ui-date-period', UiDatePeriod);
Vue.component('ui-datetime', UiDatetime);
Vue.component('ui-address', UiAddress);
Vue.component('ui-timeago', UiTimeago);
Vue.component('ui-lastactive', UiLastactive);
Vue.component('ui-modal', UiModal);
Vue.component('ui-fiat', UiFiat);
Vue.component('ui-link', UiLink);

Vue.component('t-container', TContainer);
Vue.component('t-row', TRow);
Vue.component('t-col', TCol);
Vue.component('t-chip', TChip);
Vue.component('t-btn', TBtn);
Vue.component('t-skeleton-loader', TSkeletonLoader);
Vue.component('t-selector', TSelector);
Vue.component('t-delimiter', TDelimiter);
Vue.component('t-breadcrumbs', TBreadcrumbs);

Vue.prototype.$ton = formatTons;
Vue.prototype.$fee = formatFee;
Vue.prototype.$fiat = formatFiat;

/**
 * @param  {String} locale
 * @return {String}
 */
Vue.prototype.$localizedUrl = function createUrlOfCurrentRouteWithAnotherLocalePrefix(locale) {
    // don't display main language in url prefix:
    const lang = locale === APP_MAIN_LOCALE ? undefined : locale;

    // generate the exact same url but with another lang prefix:
    const newRoute = this.$router.resolve({ ...this.$route,
        params: { ...this.$route.params, lang },
    });

    return (document.location.origin + newRoute.href).replace(/\/$/, '');
};

/**
 * @param  {Object} route
 * @return {Object}
 */
Vue.prototype.$localizeRoute = function createLocalizedRouteParams(route) {
    // don't display main language in url prefix:
    const lang = this.$i18n.locale === APP_MAIN_LOCALE
        ? undefined
        : this.$i18n.locale;

    return { ...route, params: { lang, ...route.params } };
};

const vm = new Vue({
    router, store, i18n,
    render: h => h(App),

    /**
     * Need to be executed before all watchers:
     */
    beforeCreate() {
        // LocalStorage contains unsupported language:
        if (!this.$i18n.availableLocales.includes(this.$store.state.appLocale)) {
            console.error(`Invalid locale, resetting to ${APP_MAIN_LOCALE}`);
            this.$store.commit('updateLocale', APP_MAIN_LOCALE);
            return;
        }

        // URL language doesn't match with current locale (either loaded from localStorage or undefined):
        if (this.$route.params.lang !== this.$i18n.locale) {
            // This is the first visit - then save the locale from URL prefix as preferred:
            if (!this.$store.state.appLocalePreferenceSet) {
                this.$store.commit('updateLocale', this.$route.params.lang || APP_MAIN_LOCALE);
            }
        }
    },

    watch: {
        '$store.state.appTheme': {
            immediate: true,
            handler(theme) {
                document.documentElement.dataset.theme = theme;
            },
        },

        '$store.state.appLocale': {
            immediate: true,
            handler(locale) {
                this.$i18n.locale = locale;
                document.documentElement.setAttribute('lang', locale);

                // Change URL if app lang is changed somewhere via the $store.commit:
                this.replaceUrlLocalePrefix(locale);
            },
        },

        '$store.state.exchangeRateCurrency': {
            immediate: true,
            handler() {
                if (!IS_TESTNET) {
                    this.$store.dispatch('getExchangeRates');
                }
            },
        },
    },

    created() {
        if (IS_TESTNET) {
            console.debug('Not loading addressbook and exchange rates in testnet mode');
            return;
        }

        this.$store.dispatch('getAddrbook');
    },

    methods: {
        replaceUrlLocalePrefix(locale) {
            // don't trigger route watchers:
            window.history.replaceState({}, null, this.$localizedUrl(locale));
        },
    },
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && (e.which || e.keyCode) === 90) {
        e.preventDefault();
        $bus.$emit('ctrl-alt-z');
    }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    $bus.$emit('browserColorSchemeChanged');
});

vm.$mount('#app');
