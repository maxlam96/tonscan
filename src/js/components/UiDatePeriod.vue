<script>
export default {
    name: 'UiDatePeriod',

    render(createElement) {
        const d = Math.floor(this.seconds / (3600 * 24));
        const h = Math.floor((this.seconds % (3600 * 24)) / 3600);
        const m = Math.floor((this.seconds % 3600) / 60);
        const s = Math.floor(this.seconds % 60);

        const parts = [
            d > 0 ? this.$tc('common.days', d) : null,
            h > 0 ? this.$tc('common.hours', h) : null,
            m > 0 ? this.$tc('common.minutes', m) : null,
            s > 0 ? this.$tc('common.seconds', s) : null,
        ];

        return createElement('span', {}, parts.filter(Boolean).join(' '));
    },

    props: {
        seconds: [Number, String],
    },
};
</script>
