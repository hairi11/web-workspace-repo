function incrementDigits(value) {
    var digits = String(value || '').split('');
    var carry = 1;

    for (var i = digits.length - 1; i >= 0 && carry; i -= 1) {
        var next = Number(digits[i]) + carry;
        digits[i] = String(next % 10);
        carry = next >= 10 ? 1 : 0;
    }

    if (carry) digits.unshift('1');
    return digits.join('');
}

function roundParts(integerPart, fractionPart, maximumFractionDigits) {
    if (fractionPart.length <= maximumFractionDigits) {
        return {
            integerPart: integerPart,
            fractionPart: fractionPart
        };
    }

    var kept = fractionPart.slice(0, maximumFractionDigits);
    var shouldRound = Number(fractionPart.charAt(maximumFractionDigits)) >= 5;

    if (!shouldRound) {
        return {
            integerPart: integerPart,
            fractionPart: kept
        };
    }

    if (maximumFractionDigits === 0) {
        return {
            integerPart: incrementDigits(integerPart),
            fractionPart: ''
        };
    }

    var combined = incrementDigits(integerPart + kept);
    var fractionStart = Math.max(0, combined.length - maximumFractionDigits);

    return {
        integerPart: combined.slice(0, fractionStart) || '0',
        fractionPart: combined.slice(fractionStart).padStart(maximumFractionDigits, '0')
    };
}

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
    },

    formatDecimal: function (value, options) {
        options = options || {};

        var normalized = this.normalizeFormatted(value);
        if (normalized === '') return '';

        if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
            return String(value);
        }

        var negative = normalized.charAt(0) === '-';
        var unsigned = negative ? normalized.slice(1) : normalized;
        var parts = unsigned.split('.');
        var integerPart = (parts[0] || '0').replace(/^0+(?=\d)/, '') || '0';
        var fractionPart = parts.length > 1 ? parts[1] : '';

        var minimumFractionDigits = Math.max(
            0,
            Number(options.minimumFractionDigits) || 0
        );
        var maximumFractionDigits = options.maximumFractionDigits === undefined
            ? Math.max(minimumFractionDigits, fractionPart.length)
            : Math.max(0, Number(options.maximumFractionDigits) || 0);

        if (minimumFractionDigits > maximumFractionDigits) {
            minimumFractionDigits = maximumFractionDigits;
        }

        var rounded = roundParts(
            integerPart,
            fractionPart,
            maximumFractionDigits
        );

        integerPart = rounded.integerPart;
        fractionPart = rounded.fractionPart.padEnd(minimumFractionDigits, '0');

        var groupSeparator = options.groupSeparator === undefined
            ? ','
            : String(options.groupSeparator);
        var decimalSeparator = options.decimalSeparator === undefined
            ? '.'
            : String(options.decimalSeparator);

        if (options.useGrouping !== false && groupSeparator) {
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
        }

        var result = (negative ? '-' : '') + integerPart;

        if (fractionPart.length) {
            result += decimalSeparator + fractionPart;
        }

        return result;
    }
};

module.exports = NumberUtil;
