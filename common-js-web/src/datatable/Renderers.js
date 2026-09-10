class Renderers {
    static text(fallback) {
        return function (value) {
            if (value === null || value === undefined || value === '') return fallback || '';
            return String(value);
        };
    }

    static boolean(trueText, falseText) {
        return function (value) { return value ? (trueText || 'Yes') : (falseText || 'No'); };
    }

    static date(formatter) {
        return function (value) {
            if (!value) return '';
            var date = new Date(value);
            if (Number.isNaN(date.getTime())) return String(value);
            return typeof formatter === 'function' ? formatter(date) : date.toLocaleDateString();
        };
    }
}

module.exports = Renderers;
