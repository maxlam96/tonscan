<template>
    <div class="card" style="height: 100%; max-width: 100%;">
        <div class="card-title" style="border: none;">{{ $t('stats.contract_types') }}</div>

        <donut-chart
            ref="chart"
            class="chart-contract-types"
            v-bind:labels="labels"
            v-bind:dataset="dataset">
            <template v-slot:header>{{ total }}</template>
            <template v-slot:footer>{{ $t('stats.total_addresses') }}</template>
        </donut-chart>

        <div v-if="false" class="chart-pie" />
    </div>
</template>

<script>
import { getBlockchainAddressAnal } from '~/api/extenderContracts.js';
import DonutChart from '~/lib/Chart.js/UiChartDonut.vue';

export default {
    data() {
        return {
            labels: [],
            dataset: undefined,
            total: 0,
        };
    },

    async mounted() {
        try {
            const data = await getBlockchainAddressAnal();

            const labels = [];
            const dataset = {
                backgroundColor: [],
                legendValue: [],
                data: [],
                suffix: '%',
            };

            data.graph.forEach((contract, idx) => {
                labels.push(this.$t('address.contract_type.' + contract.type));

                dataset.data.push(Math.round(contract.pie * 10000) / 100);
                dataset.legendValue.push(contract.count.toLocaleString());

                if (contract.type === 'other') {
                    dataset.backgroundColor[idx] = '#B0B0B0';
                }
            });

            this.labels = labels;
            this.dataset = Object.freeze(dataset);
            this.total = data.total.toLocaleString();
        } catch (error) {
            console.log('Failed to fetch blockchain address data:', error);
        }
    },

    components: {
        DonutChart,
    },
};
</script>

<style lang="scss">
.chart-contract-types {
    display: flex;
    align-items: center;
    padding: 6px 4px 16px 12px;
    margin: auto 0;
    overflow: hidden;
}

.chart-legend {
    padding-left: 12px;
}

.chart-legend-item, .chart-legend-item .skeleton {
    width: 100%;
}

@media screen and (max-width: 599px) {
    .chart-contract-types {
        flex-direction: column;
        padding: 0;
        margin: 0;
        .chart-pie {
            max-width: 220px;
        }
        .chart-legend {
            width: 100%;
            padding: 10px 12px;
        }
    }
}
</style>
