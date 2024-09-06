<template>
    <div class="chart-legend">
        <template v-if="datasetsLoaded">
            <div class="chart-legend-row"
                v-for="(dataset, index) in datasets"
                v-bind:key="index"
                v-bind:class="{ 'chart-legend-row--disabled': !visibleSeries[index] }"
            >
                <div class="chart-legend-item" v-on:click="toggleChart(index)">
                    <div class="chart-legend-item__pipka" v-bind:style="{ backgroundColor: colors[index] }"></div>
                    {{ dataset.label }}
                </div>
            </div>
        </template>

        <template v-else>
            <div class="chart-legend-row"
                v-for="idx in 2"
                v-bind:key="`chart_legend_skeleton_${idx}`"
            >
                <div class="chart-legend-item">
                    <span class="skeleton">metric name</span>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    props: {
        datasets: {
            type: Array,
            required: true,
        },
        colors: {
            type: Array,
            required: true,
        },
        visibleSeries: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            datasetsLoaded: false,
        };
    },
    watch: {
        datasets: {
            handler(newValue) {
                this.datasetsLoaded = newValue.length > 0;
            },
        },
    },
    methods: {
        toggleChart(index) {
            this.$emit('toggle-chart', index);
        },
    },
};
</script>

<style lang="scss">
.chart-legend-container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    margin: 0;
    padding: 0;
}

.chart-legend {
    margin: 0 6px 4px;
    width: auto;
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
    &--table {
        margin: 12px 0 8px;
        flex-direction: column;
        justify-content: flex-start;
    }
}

.chart-legend-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 0 8px;
    white-space: nowrap;
    border-radius: 4px;
    &--disabled {
        filter: saturate(0%);
        text-decoration: line-through;
        opacity: .4;
    }
    &:hover {
        background: rgba(255, 255, 255, 0.04);
    }
}

.chart-legend-item {
    display: flex;
    align-items: center;
    padding: 5px 4px;
    color: inherit;
    font-size: 13px;
    &__pipka {
        height: 8px;
        width: 8px;
        margin-right: 8px;
        border-radius: 6px;
    }
    &--align-right {
        justify-content: flex-end;
    }
}

@media screen and (max-width: 599px) {
    .chart-legend {
        padding-left: 0;
    }
}
</style>
