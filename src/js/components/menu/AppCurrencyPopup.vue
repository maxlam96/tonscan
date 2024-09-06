<template>
    <transition name="theme-popup-transition">
        <div class="mobile-menu-popup currency-popup" v-if="isOpenCurrency && isMobile">
            <div class="mobile-menu-popup__item"
                v-for="currency in availableCurrencies"
                v-bind:key="currency"
                v-on:click="selected = currency"
                v-bind:class="{'mobile-menu-popup__item--active': selected === currency }"
            >
                <div class="mobile-menu-popup__item--icon">
                    <CurrencyLogo v-bind:currency="currency" size="small" />
                </div>
                <div style="flex-grow: 1;">
                    {{ $t(`settings.currency.${currency}`) }}
                </div>
                <div v-if="currency === selected" class="mobile-menu-popup__item--dot"></div>
            </div>
        </div>
    </transition>
</template>

<script>
import CurrencyLogo from './CurrencyLogo.vue';

export default {
    props: {
        isOpenCurrency: Boolean,
    },

    data() {
        return {
            availableCurrencies: [
                'usd',
                'rub',
                'aed',
            ],
        };
    },

    computed: {
        selected: {
            get() {
                return this.$store.state.exchangeRateCurrency;
            },

            set(currency) {
                if (this.selected !== currency) {
                    this.$store.commit('updateExchangeRateCurrency', currency);
                    // Set small delay so transition looks better
                    setTimeout(() => {
                        this.$emit('toggle-currency');
                    }, 500);
                } else {
                    this.$emit('toggle-currency');
                }
            },
        },
    },

    methods: {
        toggle() {
            this.$emit('toggle-currency');
        },
    },

    components: {
        CurrencyLogo,
    },
};
</script>

<style lang="scss">
.currency-popup {
    right: calc(20px + 62px + 10px);
    width: 240px;
}
</style>
