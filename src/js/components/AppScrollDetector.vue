<script>
export default {
    observer: undefined,

    render: h => h('div', { class: 'app-scroll-detector' }),

    mounted() {
        this.$options.observer = new IntersectionObserver(([entry]) => {
            this.$store.commit('updateScrollState', !entry.isIntersecting);
        });

        this.$options.observer.observe(this.$el);
    },

    beforeDestroy() {
        this.$options.observer.disconnect();
        this.$options.observer = undefined;
    },
};
</script>

<style lang="scss">
.app-scroll-detector {
    display: block;
    width: 100%;
    height: 0;
    visibility: hidden;
}
</style>
