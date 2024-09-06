<template>
    <div class="card">
        <div class="card-title" style="border: none; padding-bottom: 8px;" v-text="$t('stats.validation_status')"/>
        <table class="validation-status-table">
            <thead>
                <tr>
                    <th v-text="$t('stats.election_id')"></th>
                    <th v-text="$t('stats.round_started')"></th>
                    <th class="mobile-hidden" v-text="$t('stats.election')"></th>
                    <th class="mobile-hidden" v-text="$t('stats.delay')"></th>
                    <th class="mobile-hidden" v-text="$t('stats.validation')"></th>
                    <th class="mobile-hidden" v-text="$t('stats.hold')"></th>
                    <th v-text="$t('stats.next_round')"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="!cycleStart || !cycleEnd">
                    <td v-for="i in (isMobile ? 3 : 7)" v-bind:key="'validation_status_skeleton_' + i">
                        <div class="skeleton" style="width: 70%; margin-bottom: 0;">01 Jan 2023 at 07:33</div>
                    </td>
                </tr>
                <tr v-else>
                    <td v-text="cycleStart"></td>
                    <td>
                        {{ formatValidatorDate(this.roundStart, this.$i18n.locale) }}
                    </td>
                    <td class="mobile-hidden">
                        <span class="cycle-step-status">{{ $t('stats.election_done') }}</span>
                    </td>
                    <td class="mobile-hidden">
                        <span class="cycle-step-status">{{ $t('stats.election_delay_done') }}</span>
                    </td>
                    <td class="mobile-hidden">
                        <span class="cycle-step-status">{{ $t('stats.election_active') }}</span>
                    </td>
                    <td class="mobile-hidden">
                        {{ formatValidatorDate(this.holdEnd, this.$i18n.locale) }}
                    </td>
                    <td>
                        {{ formatValidatorDate(this.holdEnd, this.$i18n.locale) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { formatValidatorDate } from '../../helpers.js';

export default {
    props: {
        cycleStart: {
            type: Number,
            required: true,
        },
        cycleEnd: {
            type: Number,
            required: true,
        },
    },

    data() {
        return {
            roundStart: null,
            holdEnd: null,
            constants: {
                validatorsElectedFor: 65536,
                electionsStartBefore: 32768,
                electionsEndBefore: 8192,
                stakeHeldFor: 32768,
            },
        };
    },

    methods: {
        formatValidatorDate,
    },

    beforeUpdate() {
        this.roundStart = this.cycleStart - this.constants.electionsStartBefore;
        this.holdEnd = this.cycleEnd + this.constants.stakeHeldFor;
    },
};
</script>

<style lang="scss">
.cycle-step-status {
    color: var(--green-bright);
}

.validation-status-table {
    padding: 0 16px 12px 16px;
    border-spacing: 0;

    th {
        text-align: left;
        font-weight: normal;
        opacity: .4;
        padding: 13px 0;
    }

    td {
        padding: 3px 0;
    }
}

@media screen and (max-width: 600px) {
    .validation-status-table {
        table-layout: fixed;
        width: 100%;
        .mobile-hidden {
            display: none;
        }
    }
}
</style>
