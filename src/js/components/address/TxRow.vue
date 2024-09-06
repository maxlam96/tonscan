<template>
    <tbody style="position: relative;">
        <Tooltip
            v-bind:hideIcon="this.hideIcon"
            v-bind:showCommentTooltip="this.showCommentTooltip"
            v-bind:comment="comment"
        />
        <tr v-on:click="open()">
            <td v-if="!hideIcon">
                <ui-link class="tx-table-cell-icon"
                    v-bind:to="txLinkRouteParams"
                    v-bind:title="exitCode ? $t('tx.error_icon_tooltip', [exitCode]) : undefined"
                    v-bind:class="{
                        'tx-table-cell-icon--error': !is_success || is_bounced,
                    }">
                    <icon-tx-bounced v-once v-if="is_bounced" fill="currentColor"/>
                    <icon-tx-chain v-once v-else-if="is_success" fill="none"/>
                    <icon-tx-error v-once v-else fill="currentColor"/>
                </ui-link>
            </td>
            <td v-bind:class="{ 'wide-timestamp': hideIcon }">
                <ui-timeago class="tx-table__cell" v-bind:timestamp="timestamp"/>
            </td>
            <td>
                <div class="tx-table__cell tx-table__cell--align-right">
                    <span v-if="is_external || event === 'external'" class="muted" v-text="$t('address.tx_table.external')"/>
                    <span v-else-if="event === 'contract_deploy'" class="muted" v-text="$t('common.empty')" />
                    <ui-address v-else
                        v-bind:address="sender"
                        v-bind:disabled="isSame(sender, address)"
                        v-bind:type="source_type"
                        v-bind:alias="source_alias"/>
                </div>
            </td>

            <!-- Message direction (in/out/log/swap): -->
            <td>
                <div class="tx-table__cell" style="padding: 0;">
                    <span v-if="is_service || isLog"
                        class="tx-table__badge tx-table__badge--service"
                        v-text="$t('address.tx_table.log')"/>

                    <span v-else-if="isOut"
                        class="tx-table__badge tx-table__badge--out"
                        v-text="$t('address.tx_table.output')"/>

                    <span v-else-if="is_swapped"
                        class="tx-table__badge tx-table__badge--swap"
                        v-text="'SWAP'"/>

                    <span v-else
                        class="tx-table__badge tx-table__badge--in"
                        v-text="$t('address.tx_table.input')"/>
                </div>
            </td>

            <!-- Receivers: -->
            <td>
                <div class="tx-table__cell">
                    <ui-link v-if="is_aggregated" v-bind:to="txLinkRouteParams">
                        {{$tc('address.tx_table.address_count', outputCount)}}
                    </ui-link>

                    <template v-else-if="isLog">
                        {{$t('address.tx_table.nowhere')}}
                    </template>

                    <ui-address v-else
                        v-bind:address="receiver"
                        v-bind:disabled="isSame(receiver, address)"
                        v-bind:type="destination_type"
                        v-bind:alias="destination_alias"/>
                </div>
            </td>

            <!-- Transaction value (TON amount or action): -->
            <td class="column-wide">
                <div
                    class="tx-table__cell tx-table__cell--align-right"
                    style="position: relative;
                    padding-right: 26px;"
                >
                    <DesktopEventIcon
                        v-if="action?.type !== 'nft:transfer_tonapi'&& event"
                        v-bind:event="event"
                    />

                    <action-badge
                        v-if="canShowActionBadge"
                        v-bind:action="action"
                        v-bind:amount="amount"
                        v-bind:op="op"
                        v-bind:meta="meta"
                        v-bind:from="from"
                        v-bind:to="to"
                        v-bind:event="event" />

                    <template v-else>
                        <div v-if="[
                            'jetton_burn',
                            'jetton_mint',
                            'auction_bid',
                        ].includes(event)">
                            {{$ton(amount, meta?.decimals ?? 9)}}
                            <ui-link v-if="meta.jetton_address"
                                v-bind:to="{ name: 'jetton', params: {
                                    address: meta.jetton_address,
                                }}">
                                {{meta?.jetton?.symbol || meta?.symbol}}
                            </ui-link>
                            <template v-else>
                                {{meta?.jetton?.symbol || meta?.symbol}}
                            </template>
                        </div>

                        <template v-else-if="[
                            'sent_jetton',
                            'received_jetton',
                        ].includes(event)">
                            {{$ton(amount, meta?.decimals ?? 9)}}
                            <ui-link
                                style="margin-left: 5px;"
                                v-bind:to="{ name: 'jetton', params: {
                                    address: meta.jetton_address,
                                }}">
                                {{meta?.jetton?.symbol || meta?.symbol}}
                            </ui-link>
                        </template>

                        <template v-else-if="is_service || is_external || [
                            'external',
                            'contract_deploy',
                        ].includes(event)">
                            <span class="muted" v-text="$t('common.empty')"/>
                        </template>

                        <!-- Events without TON amount -->
                        <template v-else-if="event === 'unsubscribe'"></template>

                        <template v-else>
                            <div>{{$ton(amount)}} TON</div>
                        </template>
                    </template>

                    <icon-encrypted-message v-once class="tx-table-operation-icon" v-if="op == 0x2167da4b"/>
                    <icon-message class="tx-table-operation-icon" v-if="comment"
                        v-on:mouseenter.native="showCommentTooltip = true"
                        v-on:mouseleave.native="showCommentTooltip = false"
                    />
                </div>
            </td>

            <!-- Expand chevron: -->
            <td>
                <div class="tx-table__cell" v-if="!hideIcon">
                    <icon-expand class="tx-table-expand-caret" v-bind:class="{
                        'tx-table-expand-caret--expanded': isVisible,
                    }"/>
                </div>
            </td>
        </tr>

        <!-- Transaction extended details (accordeon block): -->
        <tr v-if="isVisible" class="tx-table-row-details">
            <td colspan="12">
                <div class="tx-table-inner-container">
                    <div class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.status')"/>
                        <template v-if="is_success">
                            {{$t('tx.exit_code_success', [exitCode])}}
                        </template>
                        <template v-else-if="is_bounced">
                            Bounced
                        </template>
                        <template v-else>
                            <template v-if="exitCode">
                                {{$t('tx.exit_code_error', [exitCode])}}
                            </template>
                            <template v-else>
                                {{$t('common.error')}}
                            </template>
                        </template>
                    </div>

                    <div class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.timestamp')"/>
                        <ui-datetime v-bind:timestamp="timestamp"/>
                    </div>

                    <div class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.hash')"/>

                        <ui-copy-button v-bind:copy="txHash" v-bind:successMessage="$t('tx.hash_copy_success')">
                            {{baseHex}}
                        </ui-copy-button>
                    </div>

                    <!-- <div class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.lt')"/>

                        <ui-copy-button v-bind:copy="txLt" v-bind:successMessage="$t('tx.lt_copy_success')">
                            {{txLt}}
                        </ui-copy-button>
                    </div> -->

                    <div class="tx-table-inner" v-if="fee">
                        <div class="tx-table-inner__header" v-text="$t('tx.fee')"/>
                        {{$ton(fee)}} TON
                    </div>

                    <div v-if="comment" class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.message')"/>
                        {{comment}}
                    </div>

                    <!-- Encrypted message -->
                    <div v-if="op == 0x2167da4b" class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.message')"/>
                        <span class="muted" v-text="$t('tx.encrypted')"/>
                    </div>
                </div>
            </td>
        </tr>
    </tbody>
</template>

<script>
import $bus from '~/eventBus.js';
import { mapState } from 'vuex';
import { isSameAddress } from '~/tonweb.js';
import { base64ToHex } from '~/utils.js';
import IconTxError from '@primer/octicons/build/svg/alert-16.svg?vue';
import IconTxBounced from '@primer/octicons/build/svg/iterations-16.svg?vue';
import IconTxChain from '@img/icons/tonscan/chain-16.svg?vue';
import IconMessage from '@img/icons/tonscan/message-14.svg?vue';
import IconEncryptedMessage from '@img/icons/tonscan/encrypted-message.svg?vue';
import IconExpand from '@img/icons/tonscan/chevron-bottom-14.svg?vue';
import ActionBadge from './TxRowActionBadge.vue';
import DesktopEventIcon from './DesktopEventIcon.vue';
import Tooltip from '../other/Tooltip.vue';

export default {
    props: {
        address: String,
        date: String,
        from: String,
        is_service: Boolean,
        is_external: Boolean,
        is_aggregated: Boolean,
        is_success: Boolean,
        is_bounced: Boolean,
        is_swapped: Boolean,
        outputCount: Number,
        to: String,
        amount: String,
        message: String,
        timestamp: Number,
        fee: String,
        txHash: String,
        txLt: String,
        exitCode: Number,
        op: [Number, String],
        source_type: String,
        destination_type: String,
        source_alias: String,
        destination_alias: String,
        action: Object,
        event: String,
        meta: {
            type: Object,
            default: () => ({}),
        },
        hideIcon: Boolean,
    },

    data() {
        return {
            isVisible: false,
            showCommentTooltip: false,
        };
    },

    computed: {
        ...mapState({ dataSource: 'txTableSource' }),

        currentAccountContractType() {
            return this.isOut
                ? this.source_type
                : this.destination_type;
        },

        canShowActionBadge() {
            const isNftMessage = (this.action?.type || '').startsWith('nft:');

            // Avoid duplicates in events table
            if (this.event === 'jetton_burn') return false;

            // show nft badges only if they are opened on the wallet page:
            if (isNftMessage) {
                return this.currentAccountContractType === 'wallet';
            }

            return !!this.action;
        },

        sender() {
            // don't replace sender with decoded body data
            // unless we are on the wallet page:
            if (!this.canShowActionBadge) {
                return this.from;
            }

            switch (this.action?.type) {
                case 'jetton:transfer_notification':
                    return this.action.sender;

                case 'nft:ownership_assigned':
                    return this.action.prev_owner;

                default:
                    return this.from;
            }
        },

        receiver() {
            // don't replace receiver with decoded body data
            // unless we are on the wallet page:
            if (!this.canShowActionBadge) {
                return this.to;
            }

            switch (this.action?.type) {
                case 'jetton:transfer':
                    return this.action.destination;

                case 'nft:transfer':
                    return this.action.new_owner;

                default:
                    return this.to;
            }
        },

        comment() {
            return this.message || this.action?.forward_payload;
        },

        isLog() {
            return !this.to;
        },

        isOut() {
            return this.isSame(this.from, this.address);
        },

        txLinkRouteParams() {
            return {
                name: 'tx',
                params: {
                    hash: base64ToHex(this.txHash),
                },
            };
        },

        baseHex() {
            return base64ToHex(this.txHash);
        },
    },

    created() {
        $bus.$on('tx-close-all', () => {
            this.isVisible = false;
        });
    },

    beforeDestroy() {
        $bus.$off('tx-close-all');
    },

    methods: {
        open() {
            if (!this.isVisible) {
                $bus.$emit('tx-close-all');
            }

            if (!this.hideIcon) {
                this.isVisible = !this.isVisible;
            }
        },

        isSame(a, b) {
            return isSameAddress(a, b);
        },
    },

    components: {
        ActionBadge, IconTxChain, IconTxError, IconMessage, IconEncryptedMessage, IconExpand, IconTxBounced, DesktopEventIcon, Tooltip,
    },
};
</script>

<style lang="scss">
.comment-tooltip {
    position: absolute;
    object-position: bottom;
    right: 40px;
    height: auto;
    top: 6px;
    border: 1px solid var(--card-border-color);
    border-radius: 12px;
    box-shadow: 0 .5rem 1.2rem var(--card-box-shadow-color);
    padding: 12px 14px;
    background-color: var(--body-background);
    z-index: 99999;
    transition: .3s;
    max-width: 300px;

    // Make triangle tail
    &::after {
        content: '';
        display: block;
        position: absolute;
        top: 10px;
        right: -8px;
        width: 8px;
        height: 8px;
        background: var(--body-background);
        border-right: 1px solid var(--card-border-color);
        border-bottom: 1px solid var(--card-border-color);
        transform: rotateZ(-45deg) translateX(-4.3px);
    }
}

// Make timestamp for events table, so addreses would be in the center
.wide-timestamp {
    min-width: 220px;
}

.comment-tooltip-animation-enter-to, .comment-tooltip-animation-leave {
    opacity: 1;
}
.comment-tooltip-animation-enter, .comment-tooltip-animation-leave-to {
    opacity: 0;
}

@media screen and (max-width: 1149px) {
    .wide-timestamp {
        min-width: auto;
    }
}
</style>
