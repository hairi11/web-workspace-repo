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

function loadBootstrapDropdown() {
    require('bootstrap/js/dist/dropdown');
}

class DataTableBuilder {
    constructor(selector) {
        this.selector = selector;
        this.options = cloneDefaults();
        this.actions = [];
        this.actionTitle = 'Actions';
        this.table = null;
        this.searchSelector = null;
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
        return this.column(data, title, Object.assign({render: renderer}, config || {}));
    }

    menuAction(config) {
        if (config && config.title) this.actionTitle = config.title;
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
            var sort = (request.order || []).map(function (order) {
                var column = columns[Number(order.column)];

                return column && column.data
                    ? {
                        field: column.data,
                        dir: String(order.dir).toLowerCase() === 'desc'
                            ? 'desc'
                            : 'asc'
                    }
                    : null;
            }).filter(Boolean);

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

        if (this.actions.length) {
            loadBootstrapDropdown();
            this.appendActionColumn();
        }

        this.table = window.jQuery(this.selector).DataTable(this.options);
        this.bindActions();
        this.bindSearch();
        return this;
    }

    appendActionColumn() {
        this.options.columns.push({
            data: null,
            title: this.actionTitle,
            orderable: false,
            searchable: false,
            render: () => this.renderActions()
        });
    }

    renderActions() {
        var html = '<div class="dropdown">'
            + '<button class="btn btn-sm btn-outline-secondary dropdown-toggle" '
            + 'type="button" data-bs-toggle="dropdown" aria-expanded="false">'
            + SecurityUtil.escapeHtml(this.actionTitle)
            + '</button><div class="dropdown-menu dropdown-menu-end">';

        this.actions.forEach(function (action, index) {
            if (action.divider) {
                html += '<div class="dropdown-divider"></div>';
                return;
            }

            var icon = SecurityUtil.sanitizeClassList(action.icon || '');
            var extra = SecurityUtil.sanitizeClassList(action.className || '');

            html += '<button type="button" class="dropdown-item dt-common-action '
                + extra
                + '" data-action-index="'
                + index
                + '">'
                + (icon ? '<i class="' + icon + '"></i> ' : '')
                + SecurityUtil.escapeHtml(action.text || '')
                + '</button>';
        });

        return html + '</div></div>';
    }

    bindActions() {
        if (!this.actions.length) return;

        var self = this;

        window.jQuery(this.selector)
            .off('click.commonJsActions')
            .on('click.commonJsActions', '.dt-common-action', function () {
                var button = window.jQuery(this);
                var action = self.actions[Number(button.attr('data-action-index'))];
                var row = self.table.row(button.closest('tr'));

                if (action && typeof action.onClick === 'function') {
                    action.onClick(row.data(), row, self.table);
                }
            });
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

    refresh(resetPaging) {
        if (this.table && this.table.ajax) {
            this.table.ajax.reload(null, resetPaging !== false);
        }
        return this;
    }

    replaceData(rows, resetPaging) {
        if (!this.table) return this;

        this.table.clear();
        this.table.rows.add(Array.isArray(rows) ? rows : []);
        this.table.draw(resetPaging !== false);
        return this;
    }

    search(value) {
        if (this.table) this.table.search(value || '').draw();
        return this;
    }

    destroy() {
        window.jQuery(this.selector).off('.commonJsActions');
        if (this.searchSelector) {
            window.jQuery(this.searchSelector).off('.commonJsSearch');
        }

        if (this.table) {
            this.table.destroy();
            this.table = null;
        }

        return this;
    }
}

DataTableBuilder.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = DataTableBuilder;
