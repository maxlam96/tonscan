<template>
    <div class="card" style="height: 100%;max-width: 100%;">
        <div class="card-title" style="border: none;" v-text="$t('stats.address_count')"/>

        <div class="stats-chart">
            <line-chart
                style="flex-grow: 1"
                v-bind:labels="labels"
                v-bind:datasets="datasets"
                hide-legend
            />
        </div>
    </div>
</template>

<script>
import { getStatus } from '~/api/tontech.js';
import { AMOUNT_OF_DATA_ON_MOBILE, AMOUNT_OF_DATA_ON_TABLET } from '~/helpers.js';
import LineChart from '~/lib/Lightchart/UiChartLine.vue';
import { decimateData } from '~/decimation.js';

export default {
    data() {
        return {
            labels: undefined,
            datasets: undefined,
        };
    },

    mounted() {
        this.getData();
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

    methods: {
        async getData() {
            try {
                const data = await getStatus().then(list => list.slice(-120));

                const dataset = Object.freeze({
                    data: data.map(period => period.total_accounts),
                    label: this.$t('stats.address'),
                    suffix: '',
                });

                this.labels = data.map(({ timestamp }) => timestamp * 1000);
                this.datasets = [dataset];

                const totalSupply = data.at(-1).total_supply;
                this.$emit('supply', totalSupply);
            } catch (error) {
                console.log('Failed to fetch data:', error);
            }
        },
    },

    components: {
        LineChart,
    },
};
</script>
