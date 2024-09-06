<template>
    <div class="tooltip" v-bind:style="{ display: isVisible ? 'block' : 'none', left: `${position.x}px`, top: `${position.y}px` }">
        <header class="chart-tooltip__header">{{ tooltipHeader }}</header>
        <table class="chart-tooltip__body">
            <tr v-for="(item, index) in tooltipItems" v-bind:key="index">
                <td
                    v-if="index === 0"
                    class="chart-tooltip__line chart-tooltip__line-index"
                    v-bind:class="{
                        'chart-tooltip__line-up': firstPoint < item.value,
                        'chart-tooltip__line-down': firstPoint >= item.value
                    }"
                ></td>
                <td
                    v-if="index!==0"
                    class="chart-tooltip__line chart-tooltip__line-index"
                ></td>
                <td class="chart-tooltip__label">{{ item.label }}:</td>
                <td class="chart-tooltip__value">{{ item.value.toLocaleString('ru-RU', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) }} {{ item.suffix }}</td>
            </tr>
        </table>
    </div>
</template>

<script>
export default {
    props: {
        tooltipHeader: String,
        tooltipItems: Array,
        position: Object,
        isVisible: Boolean,
        firstPoint: Number,
    },
};
</script>

<style lang="scss">
.tooltip {
    display: none;
    background: var(--chart-tooltip-background);
    border-radius: 12px;
    box-shadow: 0 0.5rem 1.2rem var(--card-box-shadow-color);
    color: var(--chart-tooltip-color);
    font-size: 13px;
    padding: 7px 10px;
    position: absolute;
    z-index: 99999;
    min-width: 200px;
    pointer-events: none;
}

.chart-tooltip {
    &__body {
        border-spacing: 4px;

        td {
            white-space: nowrap;
        }
    }

    &__label {
        color: var(--body-muted-text-color);
    }

    &__value {
        font-weight: 500;
    }

    &__line-index {
        background: var(--chart-line-green-color);
    }

    &__line-noindex {
        background: var(--chart-line-green-color);
    }

    &__line-up {
        background: var(--chart-line-green-color);
    }

    &__line-down {
        background: var( --chart-line-red-color);
    }
}
</style>
