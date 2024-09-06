import { DEV_EXPLORER_ADDRESS } from '~/config.js';
import $bus from '~/eventBus.js';

export default {
    created() {
        $bus.$on('ctrl-alt-z', this.goToDevExplorer);
    },

    beforeDestroy() {
        $bus.$off('ctrl-alt-z', this.goToDevExplorer);
    },

    computed: {
        devExplorerUrl() {
            return `/account?account=${this.addressCanonical ?? this.address}`;
        },
    },

    methods: {
        goToDevExplorer() {
            if (this.$refs.devExplorerLink) {
                this.$refs.devExplorerLink.href = DEV_EXPLORER_ADDRESS + this.devExplorerUrl;
                this.$refs.devExplorerLink.click();
            }
        },
    },
};
