const SecurityUtil = require('../util/SecurityUtil');

class FormSerializer {
    static serialize(form, options) {
        if (!form) return {};
        options = options || {};

        var maxFields = Math.max(1, Number(options.maxFields) || 1000);
        var data = new FormData(form);
        var result = Object.create(null);
        var count = 0;

        data.forEach(function (value, name) {
            count += 1;
            if (count > maxFields) throw new Error('Form contains too many fields.');

            name = String(name);
            SecurityUtil.assertSafeObjectKey(name);

            if (Object.prototype.hasOwnProperty.call(result, name)) {
                if (!Array.isArray(result[name])) result[name] = [result[name]];
                result[name].push(value);
            }
            else {
                result[name] = value;
            }
        });

        return result;
    }
}

module.exports = FormSerializer;
