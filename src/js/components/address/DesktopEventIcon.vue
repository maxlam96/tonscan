<!-- <template>
    <div class="event-name">
        <div class="event-name__icon">
            <component v-bind:is="getIcon"></component>
        </div>
        {{ $t(`events.${event}`) }}
    </div>
</template>

<script>
import IconIn from '@img/icons/tonscan/transactions/tx-in.svg?vue';
import IconOut from '@img/icons/tonscan/transactions/tx-out.svg?vue';
import IconBurn from '@img/icons/tonscan/transactions/tx-burn.svg?vue';
import IconJettonMint from '@img/icons/tonscan/transactions/tx-jetton-mint.svg?vue';
import IconNftIn from '@img/icons/tonscan/transactions/tx-nft-in.svg?vue';
import IconNftOut from '@img/icons/tonscan/transactions/tx-nft-out.svg?vue';
import IconNftBuy from '@img/icons/tonscan/transactions/tx-nft-buy.svg?vue';
import IconNftMint from '@img/icons/tonscan/transactions/tx-nft-mint.svg?vue';
import IconSwap from '@img/icons/tonscan/transactions/tx-swap.svg?vue';
import IconContractDeploy from '@img/icons/tonscan/transactions/tx-contract-deploy.svg?vue';
import IconSmartContractExec from '@img/icons/tonscan/transactions/tx-contract.svg?vue';
import IconStakeIn from '@img/icons/tonscan/transactions/tx-stake-in.svg?vue';
import IconStakeOut from '@img/icons/tonscan/transactions/tx-stake-out.svg?vue';
import IconStakeDeposit from '@img/icons/tonscan/transactions/tx-stake-deposit.svg?vue';
import IconStakeWithdraw from '@img/icons/tonscan/transactions/tx-stake-withdraw.svg?vue';
import IconAuctionBid from '@img/icons/tonscan/transactions/tx-bid.svg?vue';
import IconSubscribe from '@img/icons/tonscan/transactions/tx-sub.svg?vue';
import IconUnsubscribe from '@img/icons/tonscan/transactions/tx-unsub.svg?vue';
import IconChain from '@img/icons/tonscan/chain-16.svg?vue';

/* eslint-disable "quote-props" */
const iconMap = Object.freeze({
    received_ton: IconIn,
    sent_ton: IconOut,
    received_jetton: IconIn,
    sent_jetton: IconOut,
    auction_bid: IconAuctionBid,
    contract_deploy: IconContractDeploy,
    deploy_nft: IconNftMint,
    deposit_stake: IconStakeDeposit,
    elections_deposit_stake: IconStakeOut,
    elections_recover_stake: IconStakeIn,
    jetton_mint: IconJettonMint,
    jetton_burn: IconBurn,
    jetton_swap: IconSwap,
    nft_purchase: IconNftBuy,
    received_nft: IconNftIn,
    sent_nft: IconNftOut,
    smart_contract_exec: IconSmartContractExec,
    subscribe: IconSubscribe,
    unsubscribe: IconUnsubscribe,
    withdraw_stake: IconStakeWithdraw,
    withdraw_stake_request: IconStakeIn,
});
export default {
    props: ['event'],

    computed: {
        getIcon() {
            return iconMap[this.event] || IconChain;
        },
    },
};
</script>

<style lang="scss">
.event-name{
    padding: 4px 10px 4px 6px;
    font-size: 13px;
    background: var(--nft-preview-background);
    border-radius: 8px;
    color: inherit;
    display: flex;
    align-items: center;
    margin-right: 12px;

    &:last-child {
        margin-right: 0;
    }

    &__icon {
        width: 17px;
        height: 17px;
        display: inline-block;
        margin-right: 6px;

        &--chain {
            transform: scale(.8);
        }
    }
}
</style> -->

<template>
    <div class="event-name">
        <div class="event-name__icon">
            <component v-bind:is="getIcon"></component>
        </div>
        {{ $t(`events.${event}`) }}
    </div>
</template>

<script>
import IconIn from '@img/icons/tonscan/transactions/tx-in.svg?vue';
import IconOut from '@img/icons/tonscan/transactions/tx-out.svg?vue';
import IconBurn from '@img/icons/tonscan/transactions/tx-burn.svg?vue';
import IconJettonMint from '@img/icons/tonscan/transactions/tx-jetton-mint.svg?vue';
import IconNftIn from '@img/icons/tonscan/transactions/tx-nft-in.svg?vue';
import IconNftOut from '@img/icons/tonscan/transactions/tx-nft-out.svg?vue';
import IconNftBuy from '@img/icons/tonscan/transactions/tx-nft-buy.svg?vue';
import IconNftMint from '@img/icons/tonscan/transactions/tx-nft-mint.svg?vue';
import IconSwap from '@img/icons/tonscan/transactions/tx-swap.svg?vue';
import IconContractDeploy from '@img/icons/tonscan/transactions/tx-contract-deploy.svg?vue';
import IconSmartContractExec from '@img/icons/tonscan/transactions/tx-contract.svg?vue';
import IconStakeIn from '@img/icons/tonscan/transactions/tx-stake-in.svg?vue';
import IconStakeOut from '@img/icons/tonscan/transactions/tx-stake-out.svg?vue';
import IconStakeDeposit from '@img/icons/tonscan/transactions/tx-stake-deposit.svg?vue';
import IconStakeWithdraw from '@img/icons/tonscan/transactions/tx-stake-withdraw.svg?vue';
import IconAuctionBid from '@img/icons/tonscan/transactions/tx-bid.svg?vue';
import IconSubscribe from '@img/icons/tonscan/transactions/tx-sub.svg?vue';
import IconUnsubscribe from '@img/icons/tonscan/transactions/tx-unsub.svg?vue';
import IconChain from '@img/icons/tonscan/chain-16.svg?vue';

/* eslint-disable "quote-props" */
const iconMap = Object.freeze({
    received_ton: IconIn,
    sent_ton: IconOut,
    received_jetton: IconIn,
    sent_jetton: IconOut,
    auction_bid: IconAuctionBid,
    contract_deploy: IconContractDeploy,
    deploy_nft: IconNftMint,
    deposit_stake: IconStakeDeposit,
    elections_deposit_stake: IconStakeOut,
    elections_recover_stake: IconStakeIn,
    jetton_mint: IconJettonMint,
    jetton_burn: IconBurn,
    jetton_swap: IconSwap,
    nft_purchase: IconNftBuy,
    received_nft: IconNftIn,
    sent_nft: IconNftOut,
    smart_contract_exec: IconSmartContractExec,
    subscribe: IconSubscribe,
    unsubscribe: IconUnsubscribe,
    withdraw_stake: IconStakeWithdraw,
    withdraw_stake_request: IconStakeIn,
});
export default {
    props: ['event'],

    computed: {
        getIcon() {
            return iconMap[this.event] || IconChain;
        },
    },
};
</script>

<style lang="scss">
.event-name{
    padding: 4px 10px 4px 6px;
    font-size: 13px;
    background: var(--nft-preview-background);
    border-radius: 8px;
    color: inherit;
    display: flex;
    align-items: center;
    margin-right: 12px;

    &:last-child {
        margin-right: 0;
    }

    &__icon {
        width: 17px;
        height: 17px;
        display: inline-block;
        margin-right: 6px;

        &--chain {
            transform: scale(.8);
        }
    }
}
</style>
