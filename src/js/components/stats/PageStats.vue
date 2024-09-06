<template>
    <section class="stats-section">
        <div
            class="card information-block"
            style="margin-top: 0;"
            v-for="(item, index) of informationBlocks"
            v-bind:key="`stats_infoblock_${index}`"
            v-bind:data-index="index">
            <div class="chart-box" v-if="item.value === 0">
                <header>
                    <span class="skeleton">User transaction count</span>
                </header>
                <div class="chart-box__value">
                    <span class="skeleton">3,414,166,606</span>
                </div>
                <footer>
                    <span class="skeleton">123 transactions per second</span>
                </footer>
            </div>

            <div v-else class="chart-box">
                <header v-text="item.header"/>
                <div class="chart-box__value">
                    <template  v-if="item.component">
                        <span>{{ item.value }}</span>
                    </template>
                    <template v-else>
                        <icon-ton v-if="item.showTonIcon" class="ton-icon" /> {{item.value}}
                    </template>
                </div>
                <footer>
                    <span>{{ item.description }}</span>
                </footer>
            </div>
        </div>

        <div class="price-container">
            <chart-price />
        </div>

        <div class="cotract-types-container">
            <chart-contract-types />
        </div>

        <div class="address-count-container">
            <chart-address-count v-on:supply="setTotalSupply" />
        </div>

        <!-- <div class="transaction-count-container">
            <chart-transaction-count />
        </div> -->

        <div class="staking-container">
            <chart-staking v-bind:validators-amount="validatorCount" />
        </div>

        <div class="validation-status-container">
            <validation-status
                v-bind:cycle-start="validationCycleStart"
                v-bind:cycle-end="validationCycleEnd" />
        </div>
    </section>
</template>

<script>
import IconTon from '@img/icons/tonscan/ton-24.svg?inline';
import { MULTIPLIER } from '~/helpers';
import { getBlockchainMarketAnal, blockAnal } from '~/api/extenderContracts.js';
import { getValidatorsStats } from '~/api/elections.js';
import { getStatus } from '~/api/tontech.js';
import { getPreviousBlocks } from '~/api';
import ChartContractTypes from './ChartContractTypes.vue';
// import ChartTransactionCount from './ChartTransactionCount.vue';
import ChartAddressCount from './ChartAddressCount.vue';
import ChartPrice from './ChartPrice.vue';
import ChartStaking from './ChartStaking.vue';
import ValidationStatus from './ValidationStatus.vue';

const formatter = new Intl.NumberFormat('en');

export default {
    data() {
        return {
            currentHeight: this.getStoredData('currentHeight', 0),
            blockTime: this.getStoredData('blockTime', 3.5),
            tps: this.getStoredData('tps', 0),
            txCount: this.getStoredData('txCount', 0),
            circulation: this.getStoredData('circulation', 0),
            circulationPercent: this.getStoredData('circulationPercent', 0),
            validatorCount: 0,
            validationCycleStart: 0,
            validationCycleEnd: 0,
            totalSupply: this.getStoredData('totalSupply', 0),
        };
    },

    async mounted() {
        this.initializeData();
    },

    computed: {
        informationBlocks() {
            return [
                {
                    header: this.$t('stats.masterchain_height'),
                    description: this.$t('stats.block_time', { time: this.blockTime }),
                    value: this.currentHeight,
                },
                {
                    header: this.$t('stats.transactions_count'),
                    description: this.$tc('stats.transactions_per_second', this.tps),
                    value: this.txCount,
                },
                {
                    header: this.$t('stats.circulation'),
                    description: this.$t('stats.percent_total_supply', { total: this.circulationPercent }),
                    value: this.circulation,
                    showTonIcon: true,
                },
                {
                    header: this.$t('stats.total_supply'),
                    description: this.$t('stats.percent_inflation_rate'),
                    value: this.totalSupply,
                    showTonIcon: true,
                },
            ];
        },
    },

    methods: {
        getStoredData(key, defaultValue) {
            const storedData = localStorage.getItem(key);
            return storedData ? JSON.parse(storedData) : defaultValue;
        },

        setStoredData(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },

        async initializeData() {
            await this.loadBlockAnalytics();

            try {
                const [validation, tontech] = await Promise.all([
                    getValidatorsStats({ limit: 1 }).then(([firstItem]) => firstItem),
                    getStatus(),
                    getBlockchainMarketAnal(),
                ]);

                const lastData = tontech.pop();
                this.circulation = formatter.format(Math.floor(lastData.circulating_supply / MULTIPLIER));
                this.setStoredData('circulation', this.circulation);

                this.circulationPercent = Math.round((lastData.circulating_supply / lastData.total_supply) * 100);
                this.totalSupply = formatter.format(Math.floor(lastData.total_supply / MULTIPLIER));
                this.setStoredData('totalSupply', this.totalSupply);

                this.validatorCount = validation.validator_count;
                this.validationCycleStart = validation.validation_cycle_start;
                this.validationCycleEnd = validation.validation_cycle_end;
            } catch (error) {
                console.log('Error loading initial data:', error);
            }
        },

        async loadBlockAnalytics() {
            const takeCount = 48;

            try {
                const [stats, previousBlocks] = await Promise.all([
                    blockAnal(),
                    getPreviousBlocks({ limit: takeCount }),
                ]);

                const mcBlocks = previousBlocks.filter(b => b.workchain === -1).slice(0, 2);
                const wcBlocks = previousBlocks.filter(b => b.workchain === 0).slice(0, 2);

                this.currentHeight = formatter.format(previousBlocks[0].seqno);
                this.setStoredData('currentHeight', this.currentHeight);

                this.blockTime = mcBlocks[0].gen_utime - mcBlocks[1].gen_utime;
                this.setStoredData('blockTime', this.blockTime);

                this.txCount = formatter.format(stats.trans_ord_count);
                this.setStoredData('txCount', this.txCount);

                const tps = previousBlocks.reduce((acc, val) => acc + val.tx_count, 0) / takeCount;
                this.tps = tps.toFixed(2);
                this.setStoredData('tps', this.tps);

                if (Number.isInteger(this.totalTx)) {
                    this.txCount += mcBlocks[0].tx_count;
                    this.txCount += wcBlocks[0].tx_count;
                }

                setTimeout(() => this.loadBlockAnalytics(), this.blockTime * 1000);
            } catch (error) {
                console.log('Error loading block analytics:', error);
            }
        },

        setTotalSupply(supply) {
            this.totalSupply = formatter.format(Math.round(supply / MULTIPLIER));
            this.setStoredData('totalSupply', this.totalSupply);
        },
    },

    components: {
        ChartContractTypes,
        // ChartTransactionCount,
        ChartAddressCount,
        ChartPrice,
        ChartStaking,
        ValidationStatus,
        IconTon,
    },
};
</script>

<style lang="scss">
.stats-chart {
    height: 100%;
    width: 100%;
    display: flex;
    box-sizing: border-box;
}

.stats-section {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    // grid-template-rows: 120px 370px 340px repeat(2, 380px);
    grid-template-rows: 120px 400px 340px 380px;
    grid-gap: 20px 20px;
}

.chart-box {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px 16px;
    flex: 1;

    header {
        margin-bottom: 8px;
        color: var(--card-header-color);
    }

    &__value {
        font-size: 28px;
        font-weight: 500;
    }

    footer {
        opacity: .3;
    }
}

@for $i from 0 through 3 {
    .information-block[data-index='#{$i}'] {
        grid-column: #{$i * 3 + 1} / span 3;
    }
}

.ton-icon {
    fill: currentColor;
    width: 28px;
    height: 28px;
    margin-right: 2px;
    opacity: .3;
    transform: translate(-3px, 3px);
}

.cotract-types-container {
    grid-column: 1 / 6;
}

.address-count-container {
    grid-column: 6 / span 7;
}

.price-container,
.transaction-count-container,
.staking-container,
.validation-status-container {
    grid-column: 1 / 13;
}

@media screen and (max-width: 1099px) {
    .stats-section {
        // grid-template-rows: 108px 108px 400px 360px repeat(2, 300px) 400px auto;
        grid-template-rows: 108px 108px 400px 360px 300px 400px auto;
    }

    .information-block[data-index='0'],
    .information-block[data-index='2'] {
        grid-column: 1 / 7;
    }

    .information-block[data-index='1'],
    .information-block[data-index='3'] {
        grid-column: 7 / 13;
    }

    .cotract-types-container,
    .address-count-container {
        grid-column: 1 / 13;
    }
}

@media screen and (max-width: 599px) {
    .ton-icon {
        width: 25px;
        height: 25px;
    }
    .stats-chart {
        padding: 5px 2px 5px 10px;
    }
    .stats-section {
        grid-gap: 0;
        // grid-template-rows:
        //     repeat(4, 108px)
        //     520px
        //     570px
        //     repeat(2, 300px)
        //     520px
        //     auto;

        grid-template-rows:
            repeat(4, 108px)
            520px
            500px
            300px
            520px
            auto;

        .card-title {
            flex-direction: column;
            align-items: flex-start;
        }
    }

    .chart-box {
        &__value {
            font-size: 24px;
        }
    }

    .price-container,
    .cotract-types-container,
    .address-count-container,
    .transaction-count-container,
    .staking-container,
    .validation-status-container {
        padding-top: 20px;
    }

    .chart-bar {
        padding-left: 0!important;
    }

    .stats-section {
        .information-block {
            border-bottom-width: 0;
            border-radius: 0;
        }

        .information-block[data-index='0'] {
            border-top-right-radius: 12px;
            border-top-left-radius: 12px;
        }

        .information-block[data-index='3'] {
            border-bottom-right-radius: 12px;
            border-bottom-left-radius: 12px;
            border-bottom-width: 1px;
        }

        .information-block[data-index='0'],
        .information-block[data-index='1'],
        .information-block[data-index='2'],
        .information-block[data-index='3'] {
            grid-column: 1 / 13;
        }
    }
}
</style>
