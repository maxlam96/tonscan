<script>
import { format, render, cancel } from 'timeago.js';

export default {
    render(h) {
        const attrs = {
            datetime: this.timestamp,
        };

        return h('span', { attrs }, this.timeAgoText);
    },

    props: {
        timestamp: {
            required: true,
            type: Number,
        },
    },

    data() {
        return {
            timeFormat: 'smart', // relative, smart and absolute switch
        };
    },

    computed: {
        shouldAutoUpdate() {
            return this.timeFormat !== 'absolute' && (Date.now() - this.timestamp) < 86400000;
        },

        timeAgoText() {
            const now = Date.now();
            const locale = this.$i18n.locale || 'en';

            switch (this.timeFormat) {
                case 'smart':
                    return (now - this.timestamp) < 86400000 ? format(this.timestamp, locale) : this.formatDate(this.timestamp);
                case 'absolute':
                    return this.formatDate(this.timestamp);
                case 'relative':
                default:
                    return format(this.timestamp, locale);
            }
        },
    },

    methods: {
        formatDate(timestamp) {
            const date = new Date(timestamp);
            const options = this.getDateOptions(date.getFullYear());

            return date.toLocaleDateString(this.$i18n.locale, options) + `, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        },

        getDateOptions(year) {
            const currentYear = new Date().getFullYear();
            return currentYear === year
                ? { day: 'numeric', month: 'long' }
                : { year: 'numeric', month: 'long', day: 'numeric' };
        },
    },

    mounted() {
        if (this.shouldAutoUpdate) {
            render(this.$el, this.$i18n.locale, { minInterval: 10 });
        }
    },

    beforeDestroy() {
        if (this.shouldAutoUpdate) {
            cancel(this.$el);
        }
    },

    watch: {
        '$i18n.locale': function (newLocale) {
            if (this.shouldAutoUpdate) {
                cancel(this.$el);
                render(this.$el, newLocale, { minInterval: 10 });
            } else {
                this.$forceUpdate();
            }
        },

        timestamp() {
            this.$forceUpdate();
        },
    },

    updated() {
        if (!this.shouldAutoUpdate) {
            this.$el.textContent = this.timeAgoText;
        }
    },
};
</script>
