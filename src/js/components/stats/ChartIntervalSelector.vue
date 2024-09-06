<template>
    <nav class="interval-selector">
        <div class="interval-selector__item"
            v-for="([name, _], index) in intervals"
            v-bind:key="`interval_selector_${index}`"
            v-on:click="changeIntervalIndex(index)"
            v-text="name"
            v-bind:class="{
                'interval-selector__item--active': name === currentInterval.name,
            }"/>
    </nav>
</template>

<script>
export const INTERVAL_DAY = 1;
export const INTERVAL_TWO_WEEKS = 14;
export const INTERVAL_MONTH = 30;
export const INTERVAL_YEAR = 365;

export default {
    props: {
        value: {
            type: Number,
            validator(value) {
                return [INTERVAL_DAY, INTERVAL_TWO_WEEKS, INTERVAL_MONTH, INTERVAL_YEAR].includes(value);
            },
        },
    },

    data() {
        return {
            currentIntervalIndex: 0,
        };
    },

    computed: {
        intervals() {
            return [
                [this.$t('common.day'), INTERVAL_DAY],
                [this.$t('common.two_weeks'), INTERVAL_TWO_WEEKS],
                [this.$t('common.month'), INTERVAL_MONTH],
                [this.$t('common.year'), INTERVAL_YEAR],
            ];
        },

        currentInterval() {
            const [name, length] = this.intervals[this.currentIntervalIndex];
            return { name, length };
        },
    },

    mounted() {
        const idx = this.value !== undefined
            ? this.intervals.findIndex(([_, length]) => length === this.value)
            : 1;

        this.changeIntervalIndex(idx);
    },

    methods: {
        changeIntervalIndex(index) {
            this.currentIntervalIndex = index;
            this.$emit('input', this.currentInterval.length);
        },
    },
};
</script>

<style lang="scss">
.interval-selector {
    display: flex;
    align-items: center;
    padding: 3px;
    margin: -3px;
    border-radius: 8px;
    background: var(--chart-interval-selector-background);
    color: var(--chart-interval-selector-color);
    text-transform: none;
    margin-left: auto;

    &__item {
        padding: 4px 12px;
        // min-width: 90px;
        text-align: center;
        border-radius: 5px;
        font-size: 12px;
        font-weight: normal;
        cursor: pointer;
        white-space: nowrap;
        transition: all .3s ease-in-out;

        &--active {
            background: var(--chart-interval-selector-item-background);
            color: var(--chart-interval-selector-item-active-color);
        }
    }
}

@media screen and (max-width: 599px) {
    .interval-selector {
        width: 100%;
        margin-right: auto;
        margin-left: 0;
        margin: 12px 0px 2px -2px;
        &__item {
            flex: 1;
            text-align: center;
            min-width: auto;
        }
    }
}
</style>
