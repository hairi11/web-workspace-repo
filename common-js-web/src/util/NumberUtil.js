const NumberUtil = {
    normalizeFormatted: function (value) {
        if (value === null || value === undefined) return '';

        return String(value)
            .replace(/,/g, '')
            .replace(/\s/g, '')
            .trim();
    },

    parseFormatted: function (value) {
        var normalized = this.normalizeFormatted(value);

        if (normalized === '') return null;

        var parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    }
};

module.exports = NumberUtil;
