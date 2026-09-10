class Actions {
    static view(onClick, config) {
        return Object.assign({text: 'View', icon: 'fa fa-eye', onClick: onClick}, config || {});
    }
    static edit(onClick, config) {
        return Object.assign({text: 'Edit', icon: 'fa fa-edit', onClick: onClick}, config || {});
    }
    static delete(onClick, config) {
        return Object.assign({text: 'Delete', icon: 'fa fa-trash', className: 'text-danger', onClick: onClick}, config || {});
    }
    static divider() { return {divider: true}; }
    static custom(text, onClick, config) {
        return Object.assign({text: text, onClick: onClick}, config || {});
    }
}

module.exports = Actions;
