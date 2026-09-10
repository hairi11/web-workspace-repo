class ConfirmDialog {
    static show(config) {
        config = typeof config === 'string' ? {message: config} : (config || {});
        return Promise.resolve(window.confirm(config.message || 'Are you sure?'));
    }
}

module.exports = ConfirmDialog;
