function defaultViewValue(value) {
    if (value === null || value === undefined || String(value).trim() === '') {
        return '-';
    }

    return String(value);
}

class FormRenderers {
    static view(action, values, options) {
        options = options || {};

        if (!action || !action.form || !values) {
            return action;
        }

        var form = action.form;
        var className = options.className || 'view-value';
        var selector = options.selector || 'input, select, textarea';
        var valueResolver = typeof action.viewValue === 'function'
            ? action.viewValue.bind(action)
            : function (name, value) {
                return defaultViewValue(value);
            };

        if (typeof action.beforeRenderView === 'function') {
            action.beforeRenderView(values, form);
        }

        var fields = form.querySelectorAll(selector);

        Array.prototype.forEach.call(fields, function (field) {
            var display = document.createElement('div');
            display.className = className;
            display.textContent = valueResolver(field.name, values[field.name], field, values);
            field.replaceWith(display);
        });

        if (typeof action.afterRenderView === 'function') {
            action.afterRenderView(values, form);
        }

        return action;
    }
}

module.exports = FormRenderers;
