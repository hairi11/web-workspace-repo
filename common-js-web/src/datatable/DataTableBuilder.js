const SecurityUtil = require('../util/SecurityUtil');

const DEFAULT_OPTIONS = {
    searching: false,
    pagingType: 'full_numbers',
    lengthMenu: [10, 20, 50, 100],
    language: {
        lengthMenu: 'Show _MENU_ entries',
        info: 'Showing _START_ to _END_ of _TOTAL_ entries',
        paginate: {
            first: "<i class='fa fa-angle-double-left' aria-hidden='true'></i>",
            previous: "<i class='fa fa-angle-left' aria-hidden='true'></i>",
            next: "<i class='fa fa-angle-right' aria-hidden='true'></i>",
            last: "<i class='fa fa-angle-double-right' aria-hidden='true'></i>"
        }
    },
    dom: 't<"row align-items-center mt-3"<"col-12 col-md-4"l><"col-12 col-md-4 text-md-center mt-2 mt-md-0"i><"col-12 col-md-4 d-flex justify-content-md-end mt-2 mt-md-0"p>>'
};

function cloneDefaults() {
    return Object.assign({}, DEFAULT_OPTIONS, {
        lengthMenu: DEFAULT_OPTIONS.lengthMenu.slice(),
        language: {
            lengthMenu: DEFAULT_OPTIONS.language.lengthMenu,
            info: DEFAULT_OPTIONS.language.info,
            paginate: Object.assign({}, DEFAULT_OPTIONS.language.paginate)
        },
        columns: []
    });
}

class DataTableBuilder {
    constructor(selector) {
        this.selector = selector;
        this.options = cloneDefaults();
        this.actions = [];
        this.table = null;
        this.searchSelector = null;
        this.contextMenu = null;
        this.contextRow = null;
    }

    data(rows) {
        this.options.data = Array.isArray(rows) ? rows : [];
        return this;
    }

    option(name, value) {
        this.options[name] = value;
        return this;
    }

    column(data, title, config) {
        this.options.columns.push(Object.assign({
            data: data,
            title: title
        }, config || {}));
        return this;
    }

    renderer(data, title, renderer, config) {
        return this.column(data, title, Object.assign({
            render: renderer
        }, config || {}));
    }

    menuAction() {
        return this;
    }

    addAction(action) {
        this.actions.push(action);
        return this;
    }

    searchInput(selector) {
        this.searchSelector = selector;
        return this;
    }

    serverPage(loader, config) {
        if (typeof loader !== 'function') {
            throw new Error('serverPage requires a loader function.');
        }

        config = Object.assign({
            pageLength: 20,
            contentProperty: 'content',
            totalProperty: 'totalElements',
            filteredTotalProperty: null,
            defaultOrder: null,
            onError: null
        }, config || {});

        this.options.serverSide = true;
        this.options.processing = true;
        this.options.pageLength = config.pageLength;

        if (Array.isArray(config.defaultOrder)) {
            this.options.order = config.defaultOrder;
        }

        this.options.ajax = async function (request, callback) {
            var size = Number(request.length) > 0
                ? Number(request.length)
                : Number(config.pageLength) || 20;
            var page = Math.floor(Math.max(0, Number(request.start) || 0) / size);
            var columns = Array.isArray(request.columns) ? request.columns : [];
            var sort = (Array.isArray(request.order) ? request.order : [])
                .map(function (order) {
                    var column = columns[Number(order.column)];

                    if (!column || !column.data) return null;

                    return {
                        field: column.data,
                        dir: String(order.dir).toLowerCase() === 'desc'
                            ? 'desc'
                            : 'asc'
                    };
                })
                .filter(Boolean);

            try {
                var response = await loader(page, size, {
                    sort: sort,
                    request: request
                });
                var result = response && response.data !== undefined
                    ? response.data
                    : (response || {});
                var rows = Array.isArray(result[config.contentProperty])
                    ? result[config.contentProperty]
                    : [];
                var total = Number(result[config.totalProperty]) || 0;
                var filtered = config.filteredTotalProperty
                    ? Number(result[config.filteredTotalProperty]) || 0
                    : total;

                callback({
                    draw: request.draw,
                    recordsTotal: total,
                    recordsFiltered: filtered,
                    data: rows
                });
            } catch (error) {
                if (typeof config.onError === 'function') {
                    config.onError(error, request);
                }

                callback({
                    draw: request.draw,
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: []
                });
            }
        };

        return this;
    }

    build() {
        if (
            typeof window === 'undefined'
            || !window.jQuery
            || !window.jQuery.fn
            || !window.jQuery.fn.DataTable
        ) {
            throw new Error('DataTableBuilder requires jQuery DataTables.');
        }

        this.table = window.jQuery(this.selector).DataTable(this.options);
        this.bindSearch();
        this.bindContextMenu();
        return this;
    }

    refresh(resetPaging) {
        if (this.table && this.table.ajax) {
            this.table.ajax.reload(null, resetPaging !== false);
        }
        return this;
    }

    replaceData(rows, resetPaging) {
        if (!this.table) return this;

        this.hideContextMenu();
        this.table.clear();
        this.table.rows.add(Array.isArray(rows) ? rows : []);
        this.table.draw(resetPaging !== false);
        return this;
    }

    search(value) {
        if (this.table) {
            this.table.search(value || '').draw();
        }
        return this;
    }

    destroy() {
        this.destroyContextMenu();

        if (this.table) {
            this.table.destroy();
            this.table = null;
        }

        return this;
    }

    bindSearch() {
        if (!this.searchSelector) return;

        var self = this;

        window.jQuery(this.searchSelector)
            .off('input.commonJsSearch')
            .on('input.commonJsSearch', function () {
                self.table.search(this.value || '').draw();
            });
    }

    bindContextMenu() {
        if (!this.actions.length) return;

        var self = this;
        var tableElement = window.jQuery(this.selector);

        tableElement
            .off('contextmenu.commonJsActions')
            .on('contextmenu.commonJsActions', 'tbody tr', function (event) {
                event.preventDefault();

                var row = self.table.row(this);
                if (!row || !row.data()) return;

                self.contextRow = row;
                self.showContextMenu(event.clientX, event.clientY);
            });

        window.jQuery(document)
            .off('click.commonJsContextMenu keydown.commonJsContextMenu')
            .on('click.commonJsContextMenu', function (event) {
                if (!self.contextMenu || self.contextMenu.contains(event.target)) return;
                self.hideContextMenu();
            })
            .on('keydown.commonJsContextMenu', function (event) {
                if (event.key === 'Escape') self.hideContextMenu();
            });

        window.jQuery(window)
            .off('blur.commonJsContextMenu resize.commonJsContextMenu scroll.commonJsContextMenu')
            .on('blur.commonJsContextMenu resize.commonJsContextMenu scroll.commonJsContextMenu', function () {
                self.hideContextMenu();
            });
    }

    showContextMenu(x, y) {
        this.ensureContextMenu();
        this.contextMenu.innerHTML = this.renderActions();
        this.contextMenu.style.position = 'fixed';
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
        this.contextMenu.style.zIndex = '1080';
        this.contextMenu.classList.add('show');

        var rect = this.contextMenu.getBoundingClientRect();
        this.contextMenu.style.left = Math.min(
            x,
            Math.max(4, window.innerWidth - rect.width - 4)
        ) + 'px';
        this.contextMenu.style.top = Math.min(
            y,
            Math.max(4, window.innerHeight - rect.height - 4)
        ) + 'px';
    }

    renderActions() {
        return this.actions.map(function (action, index) {
            if (action.divider) {
                return '<div class="dropdown-divider"></div>';
            }

            var iconClass = SecurityUtil.sanitizeClassList(action.icon || '');
            var extraClass = SecurityUtil.sanitizeClassList(action.className || '');
            var icon = iconClass
                ? '<i class="' + iconClass + '"></i> '
                : '';
            var text = SecurityUtil.escapeHtml(action.text || '');

            return '<button type="button" class="dropdown-item dt-common-context-action '
                + extraClass
                + '" data-action-index="'
                + index
                + '">'
                + icon
                + text
                + '</button>';
        }).join('');
    }

    ensureContextMenu() {
        if (this.contextMenu) return;

        var self = this;
        var menu = document.createElement('div');

        menu.className = 'dropdown-menu';
        menu.addEventListener('click', function (event) {
            var button = event.target.closest('.dt-common-context-action');
            if (!button || !self.contextRow) return;

            var action = self.actions[Number(button.dataset.actionIndex)];
            var row = self.contextRow;

            self.hideContextMenu();

            if (action && typeof action.onClick === 'function') {
                action.onClick(row.data(), row, self.table);
            }
        });

        document.body.appendChild(menu);
        this.contextMenu = menu;
    }

    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.classList.remove('show');
        }
        this.contextRow = null;
    }

    destroyContextMenu() {
        window.jQuery(this.selector).off('.commonJsActions');
        window.jQuery(document).off('.commonJsContextMenu');
        window.jQuery(window).off('.commonJsContextMenu');

        if (this.contextMenu) {
            this.contextMenu.remove();
        }

        this.contextMenu = null;
        this.contextRow = null;
    }
}

DataTableBuilder.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = DataTableBuilder;
