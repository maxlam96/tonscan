<template>
    <section>
        <div v-if="emptyHistory" class="tx-history-empty-panel" v-text="$t('address.tx_table.empty')" />

        <div v-show="!emptyHistory" class="tx-history-wrap desktop-table">
            <table class="tx-table">
                <thead v-if="!isMobile">
                    <tr>
                        <th v-pre width="40"></th>
                        <th width="100">
                            <div class="tx-table__cell" v-text="$t('address.tx_table.age')" />
                        </th>
                        <th>
                            <div class="tx-table__cell tx-table__cell--align-right" v-text="$t('address.tx_table.from')" />
                        </th>
                        <th v-pre width="50"></th>
                        <th>
                            <div class="tx-table__cell" v-text="$t('address.tx_table.to')" />
                        </th>
                        <!-- <th v-if="dataSource === 'tonapi'">
                            <div class="tx-table__cell tx-table__cell--align-center" v-text="$t('events.title')"/>
                        </th> -->
                        <th>
                            <div class="tx-table__cell tx-table__cell--align-right" style="padding-right: 26px;"
                                v-text="$t('address.tx_table.value')" />
                        </th>
                        <th v-pre width="40">
                            <div class="tx-table__cell"></div>
                        </th>
                    </tr>
                </thead>

                <template v-if="address">
                    <template v-for="tx in transactions">
                        <keep-alive
                            v-for="(msg, idx) in tx.messages"
                            v-bind:key="`tx_${tx.hash}_msg_${idx}`">
                            <component
                                v-if="displayMsg(msg)"
                                v-bind:is="isMobile ? 'tx-row-mobile' : 'tx-row'"
                                v-bind:class="{ 'sub-list': idx > 0 }"
                                v-bind:address="address"
                                v-bind:txHash="tx.hash"
                                v-bind:txLt="tx.lt"
                                v-bind:timestamp="tx.timestamp"
                                v-bind:fee="tx.fee"
                                v-bind:exitCode="tx.exit_code"
                                v-bind:outputCount="tx.output_count"
                                v-bind:action="msg.action"
                                v-bind:event="msg.event"
                                v-bind:meta="msg.meta"
                                v-bind="msg"/>
                        </keep-alive>
                    </template>
                </template>

                <template v-if="!address || transactions.length == 0">
                    <component
                        v-bind:is="isMobile
                            ? 'tx-row-skeleton-mobile'
                            : 'tx-row-skeleton'"
                        v-for="i in 8"
                        v-bind:key="`tx_skeleton_${i}`"/>
                </template>
            </table>
        </div>

        <ui-mugen-scroll
            v-bind:handler="loadMore"
            v-bind:shouldHandle="shouldHandleScroll"
            v-bind:showButton="showPreloader"
            v-bind:isLoading="isLoading"/>
    </section>
</template>

<script>
import { mapState } from 'vuex';
import { getTransactionsV3 } from '~/api/toncenterV2.js';
import TxRowSkeleton from './TxRowSkeleton.vue';
import TxRowSkeletonMobile from './TxRowSkeletonMobile.vue';
import TxRow from './TxRow.vue';
import TxRowMobile from './TxRowMobile.vue';

export default {
    props: {
        address: {
            type: String,
            required: false,
        },
    },

    data() {
        return {
            transactions: [],
            isLoading: true,
            hasMore: true,
            emptyHistory: false,
            lastActivity: undefined,
        };
    },

    computed: {
        shouldHandleScroll() {
            return !this.isLoading && this.address && this.hasMore && this.transactions.length > 0;
        },

        showPreloader() {
            return this.address && this.transactions.length > 0 && this.hasMore;
        },

        ...mapState({ dataSource: 'txTableSource' }),
    },

    watch: {
        address: {
            immediate: true,
            handler(newAddress) {
                if (!newAddress) return;
                this.resetState();
                this.loadData();
            },
        },

        dataSource: {
            immediate: false,
            handler() {
                this.transactions = [];
                this.loadData();
            },
        },
    },

    activated() {
        this.emitLastActivity();
    },

    methods: {
        displayMsg(msg) {
            return !msg.is_external;
        },

        emitLastActivity() {
            this.$emit('lastActivityUpdate', this.lastActivity);
        },

        async loadData() {
            this.isLoading = true;
            this.transactions = [];
            const limit = 20;

            try {
                const transactions = await getTransactionsV3(this.address, { limit });
                this.transactions = transactions;
                this.emptyHistory = transactions.length === 0;
                this.hasMore = transactions.length >= limit;

                // Fix the latest timestamp
                this.lastActivity = transactions.length > 0 ? this.transactions[0]?.timestamp : null;
            } catch (error) {
                console.log('Error loading transactions:', error);
            } finally {
                this.isLoading = false;
                this.emitLastActivity();
            }
        },

        async loadMore() {
            this.isLoading = true;
            const limit = 50;

            try {
                const newTx = await getTransactionsV3(this.address, {
                    limit,
                    offset: this.transactions.length,
                    before_lt: this.transactions[this.transactions.length - 1].lt,
                });
                this.transactions.push(...newTx);
                this.hasMore = newTx.length >= limit;
            } catch (error) {
                console.log('Error loading more transactions:', error);
            } finally {
                this.isLoading = false;
            }
        },

        resetState() {
            this.transactions = [];
            this.isLoading = true;
            this.hasMore = true;
            this.emptyHistory = false;
        },
    },

    components: {
        TxRow,
        TxRowMobile,
        TxRowSkeleton,
        TxRowSkeletonMobile,
    },
};
</script>
