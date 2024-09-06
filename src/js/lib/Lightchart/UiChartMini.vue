<template>
    <div ref="chartContainer" style="display: flex; flex-direction: column; position: relative; width: calc(100% + 50px); height: 150px; margin-left: -25px;">
        <div ref="chart" style="width: 100%; height: 100%"></div>
        <div class="labels-container">
            <div v-if="newLabels && newLabels.length > 0">{{ formatTickMarks(newLabels[0]) }}</div>
            <div v-else class="skeleton">........</div>
            <div v-if="newLabels && newLabels.length > 1">{{ formatTickMarks(newLabels[Math.floor((newLabels.length - 1) / 2)]) }}</div>
            <div v-else class="skeleton">........</div>
            <div v-if="newLabels && newLabels.length > 2">{{ formatTickMarks(newLabels[newLabels.length - 1]) }}</div>
            <div v-else class="skeleton">........</div>
        </div>
    </div>
</template>

<script>
import { createChart } from 'lightweight-charts';

export default {
    props: {
        labels: {
            type: Array,
            default: () => [],
        },
        datasets: {
            type: Array,
            default: () => [{
                data: [],
                label: '',
                suffix: ' ',
            }],
        },
    },

    data() {
        return {
            chart: null,
            areaSeries: null,
            newLabels: null,
        };
    },

    computed: {
        appTheme() {
            return this.$store.state.appTheme;
        },
    },

    mounted() {
        this.createSkeletonChart();
        this.createChart();
        this.updateChartSize();
        window.addEventListener('resize', this.handleResize);
    },

    watch: {
        datasets() {
            this.createChart();
            this.updateChartSize();
        },
        appTheme() {
            this.recreateChart();
        },
    },

    beforeDestroy() {
        if (this.chart) {
            this.chart.remove();
        }
        window.removeEventListener('resize', this.handleResize);
    },

    methods: {
        handleResize() {
            this.recreateChart();
        },

        createSkeletonChart() {
            if (this.chart) {
                this.chart.remove();
            }

            const skeletonColor = getComputedStyle(this.$refs.chart).getPropertyValue('--chart-skeleton-color').trim();

            this.chart = createChart(this.$refs.chart, {
                width: this.$refs.chart.clientWidth,
                height: this.$refs.chart.clientHeight,
                layout: {
                    background: { type: 'solid', color: 'transparent' },
                    textColor: skeletonColor,
                },
                crosshair: {
                    mode: 0,
                    vertLine: { visible: false },
                    horzLine: { visible: false },
                },
                timeScale: {
                    borderVisible: false,
                    minimumHeight: 50,
                    visible: false,
                },
                rightPriceScale: {
                    borderVisible: false,
                    visible: false,
                },
                grid: {
                    vertLines: { color: 'transparent' },
                    horzLines: { color: 'transparent' },
                    visible: false,
                },
                handleScroll: {
                    vertTouchDrag: false,
                    mouseWheel: false,
                    pressedMouseMove: false,
                },
                handleScale: {
                    axisPressedMouseMove: false,
                    mouseWheel: false,
                    pinch: false,
                },
            });

            this.areaSeries = this.chart.addAreaSeries({
                topColor: skeletonColor,
                bottomColor: 'transparent',
                lineColor: skeletonColor,
                lineType: 2,
                lineWidth: 2,
            });

            const now = Date.now();
            const skeletonLabels = Array.from({ length: 10 }, (_, i) => now - i * 60 * 1000).reverse();
            const skeletonDataset = Array.from({ length: 10 }, () => Math.random() * 20 + 10);

            const skeletonData = skeletonLabels.map((label, index) => ({
                time: Math.floor(label / 1000),
                value: skeletonDataset[index],
            }));

            this.areaSeries.setData(skeletonData);
            this.chart.timeScale().fitContent();
        },

        createChart() {
            if (!this.labels.length || !this.datasets.length) return;

            if (this.chart) {
                this.chart.remove();
            }

            const lineColor = getComputedStyle(this.$refs.chart).getPropertyValue('--chart-line-green-color').trim();
            const lineSecondaryColor = getComputedStyle(this.$refs.chart).getPropertyValue('--chart-line-green-secondary-color').trim();
            const opacityColor = getComputedStyle(this.$refs.chart).getPropertyValue('--chart-line-green-opacity-color').trim();
            const lineRedColor = getComputedStyle(this.$refs.chart).getPropertyValue('--chart-line-mini-red-color').trim();
            const lineSecondaryRedColor = getComputedStyle(this.$refs.chart).getPropertyValue('--chart-line-mini-red-secondary-color').trim();
            const opacityRedColor = getComputedStyle(this.$refs.chart).getPropertyValue('--chart-line-mini-opacity-red-color').trim();

            const chartPointColor = getComputedStyle(this.$refs.chart).getPropertyValue('--chart-point-color').trim();

            this.chart = createChart(this.$refs.chart, {
                width: this.$refs.chart.clientWidth,
                height: this.$refs.chart.clientHeight,
                layout: {
                    background: {
                        type: 'solid',
                        color: 'transparent',
                    },
                    textColor: chartPointColor,
                },
                crosshair: {
                    horzLine: {
                        labelVisible: false,
                        visible: false,
                    },
                    vertLine: {
                        labelVisible: false,
                        visible: false,
                    },
                },
                timeScale: {
                    visible: false,
                    borderVisible: false,
                    minimumHeight: 38,
                    tickMarkMaxCharacterLength: 10,
                    allowBoldLabels: false,
                    tickMarkFormatter: this.formatTickMarks,
                    timeVisible: true,
                    rightBarStaysOnScroll: true,
                    lockVisibleTimeRangeOnResize: true,
                },
                rightPriceScale: {
                    borderVisible: false,
                    visible: false,
                    scaleMargins: {
                        top: 0.19,
                        bottom: 0.2,
                    },
                },
                overlayPriceScales: {
                    scaleMargins: {
                        top: 0.8,
                        bottom: 0.05,
                    },
                },
                grid: {
                    vertLines: {
                        visible: false,
                    },
                    horzLines: {
                        visible: false,
                    },
                },
                handleScroll: {
                    vertTouchDrag: false,
                    mouseWheel: false,
                    pressedMouseMove: false,
                },
                handleScale: {
                    axisPressedMouseMove: false,
                    mouseWheel: false,
                    pinch: false,
                },
            });

            const data = this.labels.map((label, index) => ({
                time: Math.floor(label / 1000),
                value: this.datasets[0].data[index],
            })).sort((a, b) => a.time - b.time);

            this.newLabels = this.labels.map(label => (Math.floor(label / 1000))).sort((a, b) => a.time - b.time);

            const firstPointValue = data[0]?.value || 0;
            const currentPointValue = data[data.length - 1]?.value || 0;

            this.areaSeries = this.chart.addAreaSeries({
                topColor: currentPointValue < firstPointValue ? opacityRedColor : opacityColor,
                bottomColor: currentPointValue < firstPointValue ? lineSecondaryRedColor : lineSecondaryColor,
                lineColor: currentPointValue < firstPointValue ? lineRedColor : lineColor,
                lineType: 2,
                lineWidth: 2,
                priceScaleId: 'right',
                lastValueVisible: false,
                priceLineVisible: false,
                crosshairMarkerVisible: false,
            });

            this.areaSeries.setData(data);

            this.chart.timeScale().fitContent();
        },

        formatTickMarks(time) {
            const date = new Date(time * 1000);
            const options = { month: 'short', day: 'numeric' };
            return date.toLocaleDateString(this.$i18n.locale, options);
        },

        recreateChart() {
            this.createSkeletonChart();
            this.createChart();
            this.updateChartSize();
        },

        updateChartSize() {
            if (this.chart) {
                this.chart.resize(this.$refs.chart.clientWidth, this.$refs.chart.clientHeight);
            }
        },
    },
};
</script>

<style lang="scss">
.labels-container {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    color: var(--body-muted-text-color);
    font-size: 12px;
    padding: 10px 0;
}
</style>
