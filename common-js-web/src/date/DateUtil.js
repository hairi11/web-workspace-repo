const { format, parseISO } = require('date-fns');

const DEFAULT_DATE_FORMAT = 'dd-MMM-yyyy';

const DateUtil = {
    formatDate(value, pattern = DEFAULT_DATE_FORMAT) {
        if (!value) {
            return '';
        }

        const date = typeof value === 'string' ? parseISO(value) : value;
        return format(date, pattern);
    },

    toApiDate(value) {
        if (!value) {
            return '';
        }

        const date = typeof value === 'string' ? parseISO(value) : value;
        return format(date, 'yyyy-MM-dd');
    },

    parseDate(value) {
        if (!value) {
            return null;
        }

        return typeof value === 'string' ? parseISO(value) : value;
    }
};

module.exports = DateUtil;
