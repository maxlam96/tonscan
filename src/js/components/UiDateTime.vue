<script>
const formatters = new Map();

/*
 * @param  {Boolean} options.hideTime
 * @param  {Boolean} options.hideDate
 * @param  {Boolean} options.hideSeconds
 * @return {Intl.DateTimeFormat}
 */
const getFormatter = function getFormatterFromCacheOrCreate(appLocale, {
    hideTime,
    hideDate,
    hideSeconds,
    monthFormatDate,
}) {
    // Don't show seconds if only date is shown:
    if (hideTime === true) {
        hideSeconds = true; // eslint-disable-line no-param-reassign
    }

    const uaLocale = navigator.language ?? appLocale;
    let monthFormat = undefined;

    if (!hideDate) {
        //  Если prop `monthFormatDate` передан и является true, всегда используем формат 'numeric'
        if (monthFormatDate) {
            monthFormat = 'numeric';
        } else {
            // Show textual interval names (Jan, Feb, Mar, etc) only if user locale matches with tonscan language.
            // Show numeric values in other cases, but with correct 12/24 format and year-month-date order.
            //
            // For example, if tonscan language is english, then a user with en-US or en-GB locale should see date
            // formatted as "Oct 10, 2023", while user with sv-SE locale should only see numbers: "2023-10-22".
            //
            // https://github.com/catchain/tonscan/issues/79
            monthFormat = uaLocale.startsWith(appLocale)
                ? 'short'
                : 'numeric';
        }
    }

    const config = {
        uaLocale,
        second: !hideSeconds ? '2-digit' : undefined,
        minute: !hideTime ? '2-digit' : undefined,
        hour: !hideTime ? '2-digit' : undefined,
        day: !hideDate ? 'numeric' : undefined,
        month: monthFormat,
        year: !hideDate ? 'numeric' : undefined,
    };

    // undefineds will still be joined as ,,,:
    const key = Object.values(config).join(',');

    if (!formatters.has(key)) {
        formatters.set(key, new Intl.DateTimeFormat(uaLocale, config));
    }

    return formatters.get(key);
};

export default {
    name: 'UiDatetime',

    render(h) {
        const microseconds = this.timestamp > 9999999999
            ? this.timestamp * 1
            : this.timestamp * 1000;

        return h('span', {}, [
            getFormatter(this.$i18n.locale, this.$props).format(microseconds),
        ]);
    },

    props: {
        timestamp: [Number, String],
        hideTime: {
            type: Boolean,
            default: undefined,
        },
        hideDate: {
            type: Boolean,
            default: undefined,
        },
        hideSeconds: {
            type: Boolean,
            default: false,
        },
        monthFormatDate: {
            type: Boolean,
            default: false,
        },
    },
};
</script>
