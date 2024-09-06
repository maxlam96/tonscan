<template>
    <aside class="line-chart-ear">
        <div class="line-chart-ear-box">
            <header>
                <span v-if="paramTop.value">{{ $t(paramTop.localization) }}</span>
                <span v-else class="skeleton" style="width: 90%;">skeleton</span>
            </header>
            <div class="line-chart-ear-box__value">
                <span v-if="paramTop.value">{{ paramTop.value }}</span>
                <span v-else class="skeleton" style="width: 65%;">s</span>
            </div>
            <footer>
                <chart-change-indicator v-if="paramTop.value" v-bind:change="paramTop.change || 0" v-bind:rangeDays="interval"/>
                <span v-else class="skeleton" style="width: 58%; height: 22px;">skeleton</span>
            </footer>
        </div>

        <div class="line-chart-ear-box">
            <header>
                <span v-if="paramMiddle.value">{{ $t(paramMiddle.localization) }}</span>
                <span v-else class="skeleton" style="width: 90%;">skeleton</span>
            </header>
            <div class="line-chart-ear-box__value">
                <span v-if="paramMiddle.value">{{ paramMiddle.value }}</span>
                <span v-else class="skeleton" style="width: 65%;">s</span>
            </div>
            <footer>
                <chart-change-indicator v-if="paramMiddle.value" v-bind:change="paramMiddle.change || 0" v-bind:rangeDays="interval"/>
                <span v-else class="skeleton" style="width: 58%; height: 22px;">skeleton</span>
            </footer>
        </div>

        <div class="line-chart-ear-box">
            <header>
                <span v-if="paramBottom.value">{{ $t(paramBottom.localization) }}</span>
                <span v-else class="skeleton" style="width: 90%;">skeleton</span>
            </header>
            <div class="line-chart-ear-box__value">
                <span v-if="paramBottom.value">{{ paramBottom.value }}</span>
                <span v-else class="skeleton" style="width: 65%;">s</span>
            </div>
            <footer>
                <chart-change-indicator v-if="paramBottom.value" v-bind:change="paramBottom.change || 0" v-bind:rangeDays="interval"/>
                <span v-else class="skeleton" style="width: 58%; height: 22px;">skeleton</span>
            </footer>
        </div>
    </aside>
</template>

<script>
import ChartChangeIndicator from './ChartChangeIndicator.vue';

export default {
    props: {
        paramTop: {
            type: Object,
            default: () => ({}),
        },
        paramMiddle: {
            type: Object,
            default: () => ({}),
        },
        paramBottom: {
            type: Object,
            default: () => ({}),
        },
        interval: {
            type: Number,
            default: 0,
        },
    },

    components: {
        ChartChangeIndicator,
    },
};
</script>

<style lang="scss">
.line-skeleton {
    padding: 0 20px;
}
.line-skeleton .skeleton {
    margin: 7px 0;
}
.line-chart-ear {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 0 8px 0 0;
    width: 165px;
    box-sizing: border-box;
    margin-top: -10px;
    margin-bottom: 23px;
}

.line-chart-ear-box {
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    padding: 0 16px;

    header {
        margin-bottom: 6px;
        font-size: 14px;
        color: var(--card-header-color);
    }

    &__value {
        font-size: 22px;
        margin-bottom: 5px;
    }

    footer {
        font-size: 13px;
    }
}

.data-container {
    display: flex;
    height: 100%;
    flex-direction: row;
}

@media screen and (max-width: 599px) {
    .data-container {
        flex-direction: column;

        .chart-bar {
            max-height: calc(100% - 93px);
        }
    }

    .line-chart-ear {
        justify-content: space-between;
        flex-direction: row;
        gap: 10px;
        width: unset;
        padding: 0 16px;
        margin: 0 0 20px 0;
    }

    .line-chart-ear-box {
        padding: 0;
        flex-grow: 1;
    }
}
</style>
