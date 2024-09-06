<template>
    <section>
        <section v-if="wallet.invalid">
            <div class="alert" v-text="$t('error.invalid_address')"/>
        </section>

        <section v-show="!wallet.invalid">
            <div class="card">
                <div class="card-row">
                    <div class="card-row__name" v-text="$t('address.info.address')"/>
                    <div class="card-row__value">
                        <span v-if="isScam" class="card-tag-badge card-tag-badge__scam">SCAM</span>
                        <ui-copy-button class="card-main-address"
                            v-bind:successMessage="$t('address.info.copy_success')"
                            v-bind:copy="address">
                            {{address}}
                        </ui-copy-button>

                        <span class="card-main-qr-button" v-on:click="qrModalVisible = true">
                            <icon-qr class="card-main-qr-button__icon"/>
                        </span>
                    </div>
                </div>

                <div class="card-row">
                    <div class="card-row__name" v-text="$t('address.info.balance')"/>
                    <div class="card-row__value" v-if="wallet.balance == '0' || wallet.balance">
                        {{$ton(wallet.balance)}}
                        <span v-text="addressMeta.tonIcon || 'TON'" title="TON"/>

                        <template v-if="wallet.balance != '0'">
                            <span v-if="$store.state.exchangeRate" style="color: #717579">
                                ≈ <ui-fiat v-bind:tonValue="wallet.balance"/>
                            </span>
                        </template>
                    </div>
                    <div v-else class="card-row__value">
                        <span class="skeleton">00000 TON ≈ 00000 USD</span>
                    </div>
                </div>

                <div class="card-row">
                    <div class="card-row__name" v-text="$t('address.info.last_activity')"/>
                    <div class="card-row__value">
                        <span v-if="lastActivity === undefined" class="skeleton">99 minutes ago</span>
                        <span v-else-if="!lastActivity" v-text="this.$t('address.info.no_activity')"/>
                        <ui-lastactive v-else v-bind:timestamp="lastActivity"/>
                    </div>
                </div>

                <div class="card-row">
                    <div class="card-row__name" v-text="$t('address.info.state')"/>
                    <div class="card-row__value">
                        <span v-if="wallet.is_active === undefined || isSuspended === undefined" class="skeleton">Inactive</span>

                        <span class="card-row-wallet-activity card-row-wallet-activity--frozen"
                            v-else-if="wallet.is_frozen"
                            v-text="$t('address.info.type_frozen')"/>

                        <span class="card-row-wallet-activity card-row-wallet-activity--suspended"
                            v-else-if="isSuspended"
                            v-text="$t('address.info.type_suspended')"/>

                        <span class="card-row-wallet-activity card-row-wallet-activity--active"
                            v-else-if="wallet.is_active"
                            v-text="$t('address.info.type_active')"/>

                        <span class="card-row-wallet-activity card-row-wallet-activity--passive"
                            v-else
                            v-text="$t('address.info.type_inactive')"/>
                    </div>
                </div>

                <div v-if="isSuspended" class="card-row">
                    <div class="card-row__name" v-text="$t('common.about')"/>

                    <i18n tag="div" class="card-row__value" path="suspended.about">
                        <ui-link v-bind:to="{ name: 'suspended' }">
                            {{$t('suspended.about_address_count')}}
                        </ui-link>
                    </i18n>
                </div>

                <div v-if="contractTypeVisible" class="card-row">
                    <div class="card-row__name" v-text="$t('address.info.contract_type')"/>

                    <div v-if="!contractExtendedInfo || wallet.wallet_type" class="card-row__value">
                        <span v-if="wallet.wallet_type" v-text="wallet.wallet_type"/>
                        <span v-else class="skeleton">wallet v123</span>
                    </div>

                    <div v-else class="card-row__value">
                        <contract-info class="page-address-contract-info"
                            v-bind:address="addressCanonical"
                            v-bind:type="contractExtendedInfo.type"
                            v-bind:contractInfo="contractExtendedInfo"/>
                    </div>
                </div>
            </div>

            <address-tabs
                v-bind:address="address"
                v-bind:isActive="isActive"
                v-on:lastActivityUpdate="handleLastActivityUpdate"
            >
                <template v-slot:customFilter>
                    <custom-filter v-if="$store.state.filterShow" />
                </template>
            </address-tabs>

            <!-- <address-tabs
                v-bind:address="addressCanonical"
                v-bind:isActive="isActive"
                v-on:lastActivityUpdate="handleLastActivityUpdate"
            >
                <template v-slot:customFilter>
                    <custom-filter />
                </template>
            </address-tabs> -->

        </section>

        <ui-modal class="qr-modal" v-bind:isOpen.sync="qrModalVisible">
            <ui-qr show-logo v-bind:value="`ton://transfer/${addressCanonical}`" v-bind:size="300"/>
        </ui-modal>

        <div style="display: none">
            <a ref="devExplorerLink" target="_blank">View in Toncoin Explorer</a>
        </div>
    </section>
</template>

<script>
import IconQr from '@img/icons/tonscan/qr-14.svg?inline';
import goToDevExplorerMixin from '@/mixins/goToDevExplorerMixin'
import { getAddressInfo, checkAddress, getCodeHash } from '~/api';
import { canonizeAddress } from '~/tonweb.js';
import UiQr from '~/components/UiQr.vue';
import ContractInfo from './ContractInfo.vue';
import AddressTabs from './AddressTabs.vue';
import CustomFilter from './Filter/Filter.vue';

export default {
    props: {
        address: {
            type: String,
            required: true,
        },
    },

    data() {
        return {
            addressCanonical: this.address,
            contractTypeVisible: true,
            wallet: {},
            lastActivity: undefined,
            qrModalVisible: false,
            contractExtendedInfo: undefined,
        };
    },

    computed: {
        addressMeta() {
            return this.$store.getters.getAddressMeta(this.address);
        },

        isScam() {
            return this.addressMeta?.isScam || this.contractExtendedInfo?.meta?.is_scam;
        },

        isSuspended() {
            return this.contractExtendedInfo?.meta?.is_suspended;
        },

        isActive() {
            return this.wallet.is_active === undefined ? undefined : this.wallet.is_active;
        },
    },

    watch: {
        $route(newRoute) {
            if (!newRoute.params.dontRefresh) {
                this.loadData();
            }
        },
    },

    created() {
        this.loadData();
    },

    methods: {
        reset() {
            this.wallet = {};
            this.lastActivity = undefined;
            this.qrModalVisible = false;
            this.contractExtendedInfo = undefined;
        },

        async loadData() {
            this.reset();

            this.wallet = await getAddressInfo(this.address);

            if (this.wallet.invalid) {
                return;
            }

            const hardcodedAddress = ['EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2', 'UQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p9dz'];
            if (hardcodedAddress.includes(this.address)) {
                this.$router.push(this.$localizeRoute({
                    name: 'locker',
                    params: { address: 'EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2' },
                }));
                return;
            }

            this.contractTypeVisible = this.wallet.is_active;

            try {
                this.contractExtendedInfo = await checkAddress(this.address).then(data => Object.freeze(data));
            } catch {
                this.contractTypeVisible = false;
                this.contractExtendedInfo = { meta: { is_suspended: false } };
            }

            let accountType;
            if (this.wallet?.is_wallet) accountType = 'wallet';
            if (this.wallet?.is_uninit) accountType = 'uninit';

            this.addressCanonical = canonizeAddress(this.address, { type: accountType });

            const codeHash = await getCodeHash(this.address);
            const singleNominatorsHashes = [
                'pCrmnqx2/+DkUtPU8T04ehTkbAGlqtul/B2JPmxx9bo=',
                'zA05WJ6ywM/g/eKEVmV6O909lTlVrj+Y8lZkqzyQT70=',
            ];

            if (singleNominatorsHashes.includes(codeHash)) {
                this.$router.push(this.$localizeRoute({
                    name: 'single_nominator',
                    params: { address: this.addressCanonical },
                }));
                return;
            }

            if (this.address !== this.addressCanonical) {
                this.$router.replace(this.$localizeRoute({
                    name: 'address',
                    params: { address: this.addressCanonical, dontRefresh: true },
                }));
            }
        },

        handleLastActivityUpdate(timestamp) {
            this.lastActivity = timestamp;
        },

        metaInfo() {
            return {
                title: this.$t('address.meta.title', { address: this.addressCanonical }),
                meta: [{
                    name: 'description',
                    content: this.$t('address.meta.description', { address: this.addressCanonical }),
                }],
            };
        },
    },

    components: {
        UiQr, AddressTabs, ContractInfo, IconQr, CustomFilter,
    },

    mixins: [goToDevExplorerMixin],
};
</script>
