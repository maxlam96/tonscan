<template>
    <div v-bind:class="['chart-change-indicator', colorClass]">
        <span v-if="isFinite(change)">{{ sign }}{{ formattedValue }}%</span>
        <span v-else>0%</span>
    </div>
</template>

<script>
export default {
    props: {
        change: {
            type: Number,
            required: true,
            default: 0,
        },
        rangeDays: {
            type: Number,
            default: 0,
        },
    },

    computed: {
        colorClass() {
            return this.change < 0 ? 'chart-change-indicator--red' : 'chart-change-indicator--green';
        },

        sign() {
            return this.change < 0 ? '–' : '+';
        },

        formattedValue() {
            return Math.abs(this.change * 100).toFixed(2);
        },

        formattedRange() {
            switch (true) {
                case this.rangeDays <= 2: return (this.rangeDays * 24) + this.$t('common.h');
                case this.rangeDays < 365: return this.rangeDays + this.$t('common.d');
                default: return Math.round(this.rangeDays / 365) + this.$t('common.y');
            }
        },
    },
};
</script>

<style lang="scss">
.chart-change-indicator {
    display: inline-block;
    font-weight: 400;
    line-height: 23px;
    padding: 0 8px;
    border-radius: 5px;
    &--red {
        color: #f74b4c;
        background: #f74b4c3b;
        .chart-change-indicator__arrow {
            transform: none;
            background: #f74b4c3b;
            &__svg {
                bottom: -1px;
            }
        }
    }
    &--green {
        color: #42bd62;
        background: #42bd623b;
        .chart-change-indicator__arrow {
            transform: rotate(180deg);
            background: #42bd623b;
        }
    }
    &__arrow {
        margin-right: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0;
        padding: 0;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        &__svg {
            position: relative;
            width: 10px;
            height: 9px;
        }
    }
}
</style>
