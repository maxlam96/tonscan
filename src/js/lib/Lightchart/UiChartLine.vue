<template>
    <div ref="chartContainer" style="display: flex; flex-direction: column; position: relative; width: 100%; height: 100%;">
        <ui-chart-legend
            v-if="!hideLegend"
            v-bind:datasets="datasets"
            v-bind:colors="colors"
            v-bind:visibleSeries="visibleSeries"
            v-on:toggle-chart="handleToggleChart"
        />
        <div ref="chart" style="width: 100%; height: 100%"></div>
        <ui-chart-tooltip
            ref="tooltip"
            v-bind:tooltipHeader="tooltipData.header"
            v-bind:tooltipItems="tooltipData.items"
            v-bind:position="tooltipData.position"
            v-bind:isVisible="tooltipData.isVisible"
            v-bind:firstPoint="tooltipData.firstPoint"
        />
    </div>
</template>

<script>
import { createChart } from 'lightweight-charts';
import UiChartTooltip from './UiChartTooltip.vue';
import UiChartLegend from './UiChartLegend.vue';

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
        chartType: {
            type: String,
            default: 'Area',
        },
        hideLegend: Boolean,
        jetton: Boolean,
    },

    data() {
        return {
            chart: null,
            areaSeries: null,
            visibleSeries: [true, true],
            colors: ['rgb(108, 142, 117)', 'rgba(108, 142, 117, 0.314)'],
            tooltipData: {
                header: '',
                items: [],
                position: { x: 0, y: 0 },
                isVisible: false,
                firstPoint: null,
            },
        };
    },

    computed: {
        appTheme() {
            return this.$store.state.appTheme;
        },
        appLocale() {
            return this.$i18n.locale;
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
        appLocale() {
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
                    background: {
                        type: 'solid',
                        color: 'transparent',
                    },
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
            const skeletonLabels = Array.from({ length: 15 }, (_, i) => now - i * 60 * 1000).reverse();
            const skeletonDataset = Array.from({ length: 15 }, () => Math.random() * 20 + 10);

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

            const chartStyles = getComputedStyle(this.$refs.chart);
            const lineColor = chartStyles.getPropertyValue('--chart-line-green-color').trim();
            const lineTopColor = chartStyles.getPropertyValue('--chart-line-green-top-color').trim();
            const lineSecondaryColor = chartStyles.getPropertyValue('--chart-line-green-secondary-color').trim();
            const chartColor = chartStyles.getPropertyValue('--chart-grid-color').trim();
            const chartPointColor = chartStyles.getPropertyValue('--chart-point-color').trim();
            const opacityColor = chartStyles.getPropertyValue('--chart-line-green-opacity-color').trim();
            const mobileOpacityColor = chartStyles.getPropertyValue('--chart-line-green-opacity-mobile-color').trim();
            const mutedColor = chartStyles.getPropertyValue('--chart-line-muted-color').trim();

            this.chart = createChart(this.$refs.chart, {
                width: this.$refs.chart.clientWidth,
                height: this.$refs.chart.clientHeight,
                layout: {
                    background: {
                        color: 'transparent',
                    },
                    textColor: chartPointColor,
                },
                crosshair: {
                    horzLine: {
                        labelVisible: false,
                        color: mutedColor,
                    },
                    vertLine: {
                        labelVisible: false,
                        color: mutedColor,
                    },
                },
                timeScale: {
                    borderVisible: false,
                    minimumHeight: 30,
                    tickMarkMaxCharacterLength: 13,
                    allowBoldLabels: false,
                    tickMarkFormatter: this.formatTickMarks,
                    fixLeftEdge: true,
                    fixRightEdge: true,
                },
                rightPriceScale: {
                    borderVisible: false,
                    scaleMargins: {
                        top: 0.02,
                        bottom: 0.3,
                    },
                },
                overlayPriceScales: {
                    scaleMargins: {
                        top: 0.8,
                        bottom: 0.01,
                    },
                },
                grid: {
                    vertLines: {
                        visible: false,
                        color: chartColor,
                    },
                    horzLines: {
                        color: chartColor,
                    },
                },
                handleScale: {
                    axisPressedMouseMove: false,
                    mouseWheel: true,
                    pinch: true,
                },
            });

            if (this.datasets[1]?.data.length) {
                const histogramData = this.labels.map((label, index) => ({
                    time: Math.floor(label / 1000),
                    value: this.datasets[1].data[index],
                })).sort((a, b) => a.time - b.time);

                if (histogramData.length > 0) {
                    this.histogramSeries = this.chart.addHistogramSeries({
                        color: this.isMobile ? mobileOpacityColor : opacityColor,
                        priceFormat: { type: 'volume' },
                        priceScaleId: 'histogram',
                        lastValueVisible: false,
                        priceLineVisible: false,
                        scaleMargins: { top: 0.4, bottom: 0.2 },
                    });

                    this.histogramSeries.setData(histogramData);
                }
            }

            const data = this.labels.map((label, index) => ({
                time: Math.floor(label / 1000),
                value: this.datasets[0].data[index],
            })).sort((a, b) => a.time - b.time);

            const firstPointValue = data[0]?.value || 0;
            this.tooltipData.firstPoint = firstPointValue;

            const addSeries = (chartType, chart, seriesOptions) => {
                switch (chartType) {
                    case 'Baseline':
                        return chart.addBaselineSeries(seriesOptions);
                    case 'Area':
                        return chart.addAreaSeries(seriesOptions);
                    case 'Line':
                        return chart.addLineSeries(seriesOptions);
                    case 'Histogram':
                        return chart.addHistogramSeries(seriesOptions);
                    default:
                        throw new Error(`Unknown chart type: ${chartType}`);
                }
            };

            const seriesOptions = {
                topColor: opacityColor,
                bottomColor: lineSecondaryColor,
                lineColor,
                topLineColor: lineColor,
                topFillColor1: lineTopColor,
                topFillColor2: lineSecondaryColor,
                bottomLineColor: 'rgba(239, 83, 80, 1)',
                bottomFillColor1: 'rgba(239, 83, 80, 0)',
                bottomFillColor2: 'rgba(239, 83, 80, 0.28)',
                color: '#6c8e75',
                baseValue: { type: 'price', price: firstPointValue },
                lineWidth: 2,
                lineType: 2,
                priceScaleId: 'right',
                crosshairMarkerBorderColor: '#fff',
                priceLineVisible: false,
                priceFormat: !this.jetton ? { type: 'custom', formatter: this.formatLargeNumber } : {
                    type: 'price',
                    precision: 4,
                    minMove: 0.001,
                },

            };

            const myPriceLine = {
                price: firstPointValue,
                color: mutedColor,
                lineWidth: 2,
                lineStyle: 1,
                axisLabelVisible: false,
                title: 'my label',
            };

            // const rightPriceScaleOptions = {
            //     scaleMargins: { top: 0.3, bottom: 0.3 },
            //     borderVisible: false,
            // };

            // const overlayPriceScalesOptions = {
            //     scaleMargins: { top: 0.8, bottom: 0.01 },
            // };

            if (this.datasets[1]?.data.length) {
                // Modify the rightPriceScale based on the condition
                this.chart.applyOptions({
                    rightPriceScale: {
                        borderVisible: false,
                        scaleMargins: { top: 0.05, bottom: 0.22 },
                    },
                    overlayPriceScales: {
                        scaleMargins: this.isMobile ? { top: 0.92, bottom: 0.01 } : { top: 0.86, bottom: 0.01 },
                    },
                });
            } else {
                // Apply default options if the condition is not met
                this.chart.applyOptions({
                    rightPriceScale: {
                        borderVisible: false,
                        scaleMargins: { top: 0.05, bottom: 0.05 },
                    },
                    overlayPriceScales: {
                        scaleMargins: { top: 0, bottom: 0 },
                    },
                });
            }

            this.areaSeries = addSeries(this.chartType, this.chart, seriesOptions);
            this.areaSeries.setData(data);
            this.areaSeries.createPriceLine(myPriceLine);
            this.chart.timeScale().fitContent();
            this.chart.subscribeCrosshairMove(this.updateTooltip);
        },

        handleToggleChart(index) {
            this.$set(this.visibleSeries, index, !this.visibleSeries[index]);
            const series = [this.areaSeries, this.histogramSeries][index];
            if (series) {
                series.applyOptions({ visible: this.visibleSeries[index] });
            }
        },

        formatTickMarks(time) {
            return new Date(time * 1000).toLocaleDateString(this.$i18n.locale, { month: 'short', day: 'numeric' });
        },

        formatLargeNumber(value) {
            if (Math.abs(value) >= 1.0e9) return `${Math.round(value / 1.0e9)}B`;
            if (Math.abs(value) >= 1.0e6) return `${Math.round(value / 1.0e6)}M`;
            if (Math.abs(value) >= 1.0e3) return `${(value / 1.0e3).toFixed(2)}K`;
            return value === 0 ? '0' : value.toFixed(2);
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

        updateTooltip(param) {
            if (param.time) {
                const date = new Date(param.time * 1000);
                this.tooltipData.header = `${date.toLocaleDateString(this.$i18n.locale, { day: 'numeric', month: 'long' })} в ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

                const containerRect = this.$refs.chartContainer.getBoundingClientRect();
                const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = this.$refs.tooltip.$el;
                const offsetX = 30;
                const offsetY = 30;

                let x = param.point.x + offsetX;
                let y = param.point.y + offsetY;

                if (x + tooltipWidth > containerRect.width) {
                    x = param.point.x - tooltipWidth - offsetX;
                }

                if (y + tooltipHeight > containerRect.height) {
                    y = param.point.y - tooltipHeight - offsetY;
                }

                if (x < 0) {
                    x = 0;
                }

                if (y < 0) {
                    y = 0;
                }

                this.tooltipData.position = { x, y };
                this.tooltipData.isVisible = true;

                const chartData = param.seriesData.get(this.areaSeries);
                const histogramData = param.seriesData.get(this.histogramSeries);

                const formatValue = (value) => {
                    if (value === null || value === undefined) return '0';

                    const numericValue = parseFloat(value).toFixed(3);
                    const [whole, fraction] = numericValue.split('.');
                    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

                    return fraction && fraction !== '000' ? `${formattedWhole}.${fraction}` : formattedWhole;
                };

                this.tooltipData.items = this.datasets.map((dataset, index) => ({
                    label: dataset.label,
                    value: formatValue(index === 0 ? chartData?.value : histogramData?.value),
                    suffix: dataset.suffix,
                }));
            } else {
                this.tooltipData.isVisible = false;
            }
        },
    },

    components: {
        UiChartTooltip, UiChartLegend,
    },
};
</script>
