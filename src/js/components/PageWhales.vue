<template>
    <section class="top-balances-table-container">
        <header class="top-balances-header">
            <h1 class="top-balances-header__title">
                <div aria-hidden="true" class="top-balances-header__icon">🏆</div>
                <span v-html="$t('top_balances.header')"/>
            </h1>
            <h2 class="top-balances-header__lead" v-text="$t('top_balances.subheader')"/>
        </header>

        <section class="card">
            <div class="tx-history-wrap desktop-table">
                <table class="ui-table">
                    <thead>
                        <tr>
                            <th width="12">#</th>
                            <th v-text="$t('common.address')"/>
                            <th class="aligh-right" v-text="$t('address.info.balance')"/>
                        </tr>
                    </thead>

                    <tbody v-if="whales.length === 0">
                        <tr v-for="n in 36" v-bind:key="`whale_skeleton_${n}`">
                            <td><span class="skeleton">123</span></td>
                            <td><span class="skeleton">Ef9uLbpVmmuRjPODCtRTsu6U0QCw6irUd4NgsepBa0N_4BPv</span></td>
                            <td class="aligh-right"><span class="skeleton">10000 TON</span></td>
                        </tr>
                    </tbody>

                    <tbody v-else>
                        <tr v-for="(whale, index) in whales" v-bind:key="`whale_${whale.account}`">
                            <td class="muted">
                                {{index + 1}}
                            </td>
                            <td>
                                <ui-address v-bind:address="whale.account"/>
                            </td>
                            <td class="aligh-right">
                                {{$ton(whale.balance)}} <span class="muted">TON</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Don't show "loading" button at the same time with skeleton: -->
                <ui-mugen-scroll
                    v-show="hasMore"
                    v-bind:show-button="whales.length > 0"
                    v-bind:handler="loadData"
                    v-bind:shouldHandle="hasMore && !isLoading"
                    v-bind:isLoading="isLoading"/>
            </div>
        </section>
    </section>
</template>

<script>
import { getTopBalances } from '~/api/toncenterPreview.js';

export default {
    data() {
        return {
            whales: [],
            hasMore: true,
            isLoading: true,
        };
    },

    mounted() {
        this.loadData();
    },

    methods: {
        async loadData() {
            if (this.whales.length >= 1000) {
                this.hasMore = false;
                return;
            }

            this.isLoading = true;

            const newData = await getTopBalances({
                limit: 100,
                offset: this.whales.length,
            });

            newData.forEach((item) => {
                const balance = item.balance.toString();

                // Dropping fractional part:
                item.balance = balance // eslint-disable-line no-param-reassign
                    .substring(0, balance.length - 9)
                    .padEnd(balance.length, '0');

                Object.freeze(item);
            });

            this.whales = this.whales.concat(newData);
            this.hasMore = newData.length === 100;
            this.isLoading = false;
        },
    },

    metaInfo() {
        return {
            title: this.$t('top_balances.meta.title'),
            meta: [{
                property: 'description',
                content: this.$t('top_balances.meta.description'),
            }],
        };
    },
};
</script>

<style lang="scss">
.top-balances-table-container {
    max-width: 820px;
    margin: 0 auto;
    .ui-table {
        td, th {
            &:first-child {
                padding: 0 0 0 16px;
            }
        }
    }
}

.top-balances-header {
    text-align: center;
    padding: 24px 0 26px;

    &__icon {
        font-size: 48px;
        margin-bottom: 12px;
    }

    &__title {
        font-weight: 500;
        font-size: 30px;
        margin: 0;
    }

    &__lead {
        margin-top: 12px;
        color: var(--body-muted-text-color);
        font-size: 16px;
        font-weight: normal;
    }
}

@media all and (max-width: 480px) {
    .top-balances-header {
        padding: 18px 6px 16px;
        &__title {
            font-size: 24px;
        }
        &__lead {
            font-size: 14px;
            line-height: 1.5;
        }
    }

    .top-balances-table-container {
        .ui-table {
            td, th {
                &:nth-child(2n) {
                    max-width: 35vw;
                    padding-left: 8px;
                }
            }
        }
    }
}
</style>
