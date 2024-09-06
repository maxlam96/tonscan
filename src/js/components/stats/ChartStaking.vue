<template>
    <div class="card" style="height: 100%;max-width: 100%;">
        <div class="card-title" style="border: none;" v-text="$t('stats.staking')"/>

        <div class="data-container">
            <side-ear v-if="!isDataLoading && validatorsAmount > 0 && validatorsAmount > 0"
                v-bind:param-top="stakingData.apy"
                v-bind:param-middle="stakingData.total"
                v-bind:param-bottom="stakingData.validators"
                v-bind:interval="interval"/>

            <div class="stats-chart">
                <line-chart ref="chart" style="flex-grow: 1"
                    v-bind:labels="parsedChartLabels"
                    v-bind:datasets="datasets"
                    v-bind:chartType="'Baseline'"
                />
            </div>
        </div>
    </div>
</template>

<script>
import {
    AMOUNT_OF_DATA_ON_MOBILE,
    AMOUNT_OF_DATA_ON_TABLET,
    MULTIPLIER,
} from '~/helpers.js';
import { decimateData } from '~/decimation.js';
import LineChart from '~/lib/Lightchart/UiChartLine.vue';
import { prefixNumber } from '~/lib/Chart.js/helpers.js';
import { getStakingInformation } from '~/api/tontech.js';
import { getAddressInfo } from '~/api/toncenter.js';
import { getValidatorsStats } from '~/api/elections.js';
import SideEar from './ChartSideEar.vue';

export default {
    props: {
        validatorsAmount: {
            type: Number,
            default: undefined,
        },
    },

    data() {
        return {
            originalData: undefined,
            labels: undefined,
            datasets: undefined,
            stakingData: {
                apy: {},
                total: {},
                validators: {},
            },
            interval: 30,
            isDataLoading: true,
        };
    },

    computed: {
        parsedChartLabels() {
            if (!this.labels) {
                return undefined;
            }

            switch (true) {
                case this.isMobile: return decimateData(this.labels, AMOUNT_OF_DATA_ON_MOBILE);
                case this.isTablet: return decimateData(this.labels, AMOUNT_OF_DATA_ON_TABLET);
                default: return this.labels;
            }
        },
    },

    watch: {
        validatorsAmount() {
            this.getData();
        },
    },

    methods: {
        async getData() {
            try {
                const [data, totalStakedTons, validatorCountMonthAgo] = await Promise.all([
                    getStakingInformation(),
                    getAddressInfo('Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF').then(info => info.balance),
                    getValidatorsStats({ offset: 43 }).then(list => list.at(0).validator_count),
                ]);

                const calculate = (dataset, key, localization) => {
                    const monthAgo = new Date();
                    monthAgo.setDate(monthAgo.getDate() - this.interval);

                    const monthAgoIndex = dataset.findIndex(item => Date.parse(item.date) > monthAgo);

                    let latestValue = dataset.at(-1)[key];
                    const earliestValue = dataset.at(monthAgoIndex)[key];
                    const valueDiff = (latestValue - earliestValue) / latestValue;

                    if (localization === 'stats.staking_apy') {
                        latestValue = (latestValue * 100).toFixed(1) + '%';
                    }

                    if (localization === 'stats.total_staked') {
                        latestValue = prefixNumber(totalStakedTons / MULTIPLIER);
                    }

                    return Object.freeze({
                        localization,
                        value: latestValue,
                        change: valueDiff,
                    });
                };

                this.stakingData.apy = calculate(data, 'annual_percent_yld', 'stats.staking_apy');
                this.stakingData.total = calculate(data, 'staked', 'stats.total_staked');

                const apyDatatset = Object.freeze({
                    data: data.map(({ annual_percent_yld: apy }) => +(apy * 100).toFixed(1)),
                    borderWidth: 1.5,
                    fill: true,
                    yAxisID: 'y',
                    label: this.$t('stats.apy'),
                    suffix: ' %',
                    parsing: false,
                });

                const stakedDataset = Object.freeze({
                    data: data.map(({ staked }) => Math.round(staked)),
                    fill: true,
                    type: 'bar',
                    yAxisID: 'volume',
                    label: this.$t('stats.staking'),
                    suffix: ' TON',
                    parsing: false,
                });

                this.labels = data.map(({ date }) => new Date(date).valueOf());
                this.datasets = [apyDatatset, stakedDataset];

                this.stakingData.validators = Object.freeze({
                    change: (this.validatorsAmount - validatorCountMonthAgo) / this.validatorsAmount,
                    value: this.validatorsAmount,
                    localization: 'stats.validators',
                });

                this.isDataLoading = false;
            } catch (error) {
                console.log('Error fetching staking data:', error);
            }
        },
    },

    components: {
        LineChart,
        SideEar,
    },
};
</script>
