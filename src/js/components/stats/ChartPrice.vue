<template>
    <div class="card" style="height: 100%; max-width: 100%;">
        <div class="card-title" style="border: none">
            {{$t('stats.market_data')}}
            <chart-interval-selector v-model="interval"/>
        </div>

        <div class="data-container">
            <side-ear
                v-bind:param-top="marketData.price"
                v-bind:param-middle="marketData.caps"
                v-bind:param-bottom="marketData.volume"
                v-bind:interval="interval"
            />
            <div class="stats-chart">
                <line-chart
                    style="flex-grow: 1"
                    v-bind:labels="parsedChartLabels"
                    v-bind:datasets="datasets"
                    v-bind:chartType="'Baseline'"
                    hide-legend
                />
            </div>
        </div>
    </div>
</template>

<script>
import { getMarketDataHistory } from '~/api/coingecko.js';
import { getBlockchainMarketAnal } from '~/api/extenderContracts.js';
import { prefixNumber } from '~/lib/Chart.js/helpers.js';
import { AMOUNT_OF_DATA_ON_MOBILE, AMOUNT_OF_DATA_ON_TABLET } from '~/helpers.js';
import { decimateData } from '~/decimation.js';
import LineChart from '~/lib/Lightchart/UiChartLine.vue';
import ChartIntervalSelector, { INTERVAL_TWO_WEEKS } from './ChartIntervalSelector.vue';
import SideEar from './ChartSideEar.vue';

export default {
    data() {
        return {
            interval: INTERVAL_TWO_WEEKS,
            labels: undefined,
            datasets: undefined,
            marketData: {
                price: {},
                caps: {},
                volume: {},
            },
            isDataLoading: true,
        };
    },

    watch: {
        interval() {
            this.loadData();
        },
    },

    mounted() {
        this.loadData();
    },

    computed: {
        parsedChartLabels() {
            if (!this.labels) {
                return undefined;
            }

            /* eslint no-else-return: "off" */
            switch (true) {
                case this.isMobile: return decimateData(this.labels, AMOUNT_OF_DATA_ON_MOBILE);
                case this.isTablet: return decimateData(this.labels, AMOUNT_OF_DATA_ON_TABLET);
                default: return this.labels;
            }
        },
    },

    methods: {
        updateInterval({ length }) {
            this.interval = length;
        },

        async loadData() {
            try {
                const calculate = (dataset, localization) => {
                    const latestValue = dataset.at(-1)[1];
                    const earliestValue = dataset.at(0)[1];
                    const valueDiff = (latestValue - earliestValue) / latestValue;

                    return Object.freeze({
                        localization,
                        value: `$ ${prefixNumber(latestValue)}`,
                        change: valueDiff,
                    });
                };

                const {
                    prices,
                    market_caps: marketCaps,
                    total_volumes: volumes,
                } = await getMarketDataHistory({
                    currency: 'USD',
                    days: this.interval,
                });

                // Temporary solution
                // Reason: coingecko is lying
                const marketAnal = await getBlockchainMarketAnal();
                const mc = marketAnal.quotes?.usd?.market_cap;
                marketCaps[marketCaps.length - 1][1] = mc;

                this.marketData.price = calculate(prices, 'stats.price');
                this.marketData.caps = calculate(marketCaps, 'stats.capitalization');
                this.marketData.volume = calculate(volumes, 'stats.trading_volume');

                const labels = prices.map(([timestamp, _]) => timestamp);

                const priceDataset = Object.freeze({
                    data: prices.map(([_, value]) => value),
                    label: this.$t('stats.price'),
                    suffix: ' USD',
                });

                const volumeDataset = Object.freeze({
                    data: volumes.map(([_, value]) => value),
                    label: this.$t('stats.volume'),
                    suffix: ' TON',
                });

                this.labels = labels;
                this.datasets = [priceDataset, volumeDataset];
                this.isDataLoading = false;
            } catch (error) {
                console.log('Error fetching price data:', error);
            }
        },
    },

    components: {
        LineChart,
        SideEar,
        ChartIntervalSelector,
    },
};
</script>
