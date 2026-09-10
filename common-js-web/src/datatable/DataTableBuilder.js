const SecurityUtil = require('../util/SecurityUtil');

const DEFAULT_OPTIONS = {
    searching: false,
    pagingType: 'full_numbers',
    select: {
        style: 'multi+shift',
        selector: 'td:not(:first-child)',
        info: false
    },
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

class DataTableBuilder {
    constructor(selector) {
        this.selector = selector;
        this.options = Object.assign({}, DEFAULT_OPTIONS, {
            select: Object.assign({}, DEFAULT_OPTIONS.select),
            language: {
                lengthMenu: DEFAULT_OPTIONS.language.lengthMenu,
                info: DEFAULT_OPTIONS.language.info,
                paginate: Object.assign({}, DEFAULT_OPTIONS.language.paginate)
            },
            lengthMenu: DEFAULT_OPTIONS.lengthMenu.slice(),
            columns: []
        });
        this.actions = [];
        this.bulkActions = [];
        this.actionConfig = null;
        this.table = null;
        this.searchSelector = null;
        this.filterBindings = [];
        this.contextMenu = null;
        this.contextRow = null;
    }

    ajax(url, config) { this.options.ajax = Object.assign({url: url, dataSrc: ''}, config || {}); return this; }
    data(rows) { this.options.data = Array.isArray(rows) ? rows : []; return this; }
    option(name, value) { this.options[name] = value; return this; }
    optionsConfig(config) { this.options = Object.assign(this.options, config || {}); return this; }
    column(data, title, config) { this.options.columns.push(Object.assign({data: data, title: title}, config || {})); return this; }
    renderer(data, title, renderer, config) { return this.column(data, title, Object.assign({render: renderer}, config || {})); }
    menuAction(config) { this.actionConfig = Object.assign({title: '', orderable: false, searchable: false, mode: 'context'}, config || {}); return this; }
    addAction(action) { if (!this.actionConfig) this.menuAction(); this.actions.push(action); return this; }
    searchInput(selector) { this.searchSelector = selector; return this; }
    filter(selector, columnIndex) { this.filterBindings.push({selector: selector, columnIndex: columnIndex}); return this; }
    selectable(config) {
        var cfg = Object.assign({}, DEFAULT_OPTIONS.select, config || {});
        this.options.select = cfg;
        return this;
    }
    addBulkAction(action) { this.bulkActions.push(action); return this; }
    serverSide(config) {
        this.options.serverSide = true;
        this.options.processing = true;
        if (config) this.options.ajax = Object.assign({}, this.options.ajax || {}, config);
        return this;
    }

    build() {
        if (typeof window === 'undefined' || !window.jQuery || !window.jQuery.fn || !window.jQuery.fn.DataTable) {
            throw new Error('DataTableBuilder requires jQuery DataTables.');
        }

        if (window.jQuery.fn.DataTable.ext && window.jQuery.fn.DataTable.ext.pager) {
            window.jQuery.fn.DataTable.ext.pager.numbers_length = 3;
        }

        if (this.actionConfig && this.actionConfig.mode !== 'context') this._appendActionColumn();
        this.table = window.jQuery(this.selector).DataTable(this.options);
        this._bindActions();
        this._bindSearch();
        this._bindFilters();
        return this;
    }

    refresh(resetPaging) { if (this.table) this.table.ajax.reload(null, resetPaging !== false); return this; }
    replaceData(rows, resetPaging) {
        if (!this.table) return this;
        this._hideContextMenu();
        this.table.clear();
        this.table.rows.add(Array.isArray(rows) ? rows : []);
        this.table.draw(resetPaging === true);
        return this;
    }
    search(value) { if (this.table) this.table.search(value || '').draw(); return this; }
    destroy() {
        this._destroyContextMenu();
        if (this.table) { this.table.destroy(); this.table = null; }
        return this;
    }
    selectedData() {
        if (!this.table || typeof this.table.rows !== 'function') return [];
        try { return this.table.rows({selected: true}).data().toArray(); }
        catch (error) { return []; }
    }
    runBulkAction(index) {
        var action = this.bulkActions[index];
        if (!action || typeof action.onClick !== 'function') return;
        return action.onClick(this.selectedData(), this.table);
    }

    _appendActionColumn() {
        var self = this;
        var config = Object.assign({}, this.actionConfig);
        delete config.mode;
        this.options.columns.push(Object.assign(config, {data: null, render: function () { return self._renderActions(); }}));
    }

    _renderActions() {
        var self = this;

        if (this.actionConfig && this.actionConfig.mode === 'inline') {
            var inlineHtml = '<div class="dt-common-actions">';
            this.actions.forEach(function (action, index) {
                if (action.divider) return;
                inlineHtml += self._renderActionButton(action, index, 'dt-common-action');
            });
            return inlineHtml + '</div>';
        }

        var html = '<div class="dropdown"><button type="button" class="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown">Actions</button><div class="dropdown-menu">';
        this.actions.forEach(function (action, index) {
            if (action.divider) { html += '<div class="dropdown-divider"></div>'; return; }
            html += self._renderActionButton(action, index, 'dropdown-item dt-common-action');
        });
        return html + '</div></div>';
    }

    _renderContextActions() {
        var self = this;
        var html = '';
        this.actions.forEach(function (action, index) {
            if (action.divider) {
                html += '<div class="dropdown-divider"></div>';
                return;
            }
            html += self._renderActionButton(action, index, 'dropdown-item dt-common-context-action');
        });
        return html;
    }

    _renderActionButton(action, index, baseClass) {
        var safeClass = SecurityUtil.sanitizeClassList(action.className || '');
        var safeIcon = SecurityUtil.sanitizeClassList(action.icon || '');
        var className = safeClass ? ' ' + safeClass : '';
        var icon = safeIcon ? '<i class="' + safeIcon + '"></i> ' : '';
        var text = SecurityUtil.escapeHtml(action.text || '');
        return '<button type="button" class="' + baseClass + className + '" data-action-index="' + index + '">' + icon + text + '</button>';
    }

    _bindActions() {
        if (this.actionConfig && this.actionConfig.mode === 'context') {
            this._bindContextMenu();
            return;
        }

        var self = this;
        window.jQuery(this.selector).off('click.commonJsActions').on('click.commonJsActions', '.dt-common-action', function () {
            var button = window.jQuery(this);
            var index = Number(button.attr('data-action-index'));
            var action = self.actions[index];
            if (!action || typeof action.onClick !== 'function') return;
            var row = self.table.row(button.closest('tr'));
            action.onClick(row.data(), row, self.table);
        });
    }

    _bindContextMenu() {
        var self = this;
        var tableElement = window.jQuery(this.selector);

        tableElement.off('contextmenu.commonJsActions').on('contextmenu.commonJsActions', 'tbody tr', function (event) {
            event.preventDefault();

            var row = self.table.row(this);
            if (!row || !row.data()) return;

            self.contextRow = row;
            self._showContextMenu(event.clientX, event.clientY);
        });

        window.jQuery(document)
            .off('click.commonJsContextMenu keydown.commonJsContextMenu')
            .on('click.commonJsContextMenu', function (event) {
                if (!self.contextMenu || self.contextMenu.contains(event.target)) return;
                self._hideContextMenu();
            })
            .on('keydown.commonJsContextMenu', function (event) {
                if (event.key === 'Escape') self._hideContextMenu();
            });

        window.jQuery(window)
            .off('blur.commonJsContextMenu resize.commonJsContextMenu scroll.commonJsContextMenu')
            .on('blur.commonJsContextMenu resize.commonJsContextMenu scroll.commonJsContextMenu', function () {
                self._hideContextMenu();
            });
    }

    _showContextMenu(x, y) {
        this._ensureContextMenu();
        this.contextMenu.innerHTML = this._renderContextActions();
        this.contextMenu.style.position = 'fixed';
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
        this.contextMenu.style.zIndex = '1080';
        this.contextMenu.classList.add('show');

        var rect = this.contextMenu.getBoundingClientRect();
        var left = Math.min(x, Math.max(0, window.innerWidth - rect.width - 4));
        var top = Math.min(y, Math.max(0, window.innerHeight - rect.height - 4));
        this.contextMenu.style.left = left + 'px';
        this.contextMenu.style.top = top + 'px';
    }

    _ensureContextMenu() {
        if (this.contextMenu) return;

        var self = this;
        var menu = document.createElement('div');
        menu.className = 'dropdown-menu';
        menu.setAttribute('role', 'menu');
        menu.addEventListener('click', function (event) {
            var button = event.target.closest('.dt-common-context-action');
            if (!button || !self.contextRow) return;

            var index = Number(button.getAttribute('data-action-index'));
            var action = self.actions[index];
            var row = self.contextRow;
            self._hideContextMenu();

            if (!action || typeof action.onClick !== 'function') return;
            action.onClick(row.data(), row, self.table);
        });

        document.body.appendChild(menu);
        this.contextMenu = menu;
    }

    _hideContextMenu() {
        if (this.contextMenu) this.contextMenu.classList.remove('show');
        this.contextRow = null;
    }

    _destroyContextMenu() {
        window.jQuery(this.selector).off('.commonJsActions');
        window.jQuery(document).off('.commonJsContextMenu');
        window.jQuery(window).off('.commonJsContextMenu');

        if (this.contextMenu && this.contextMenu.parentNode) {
            this.contextMenu.parentNode.removeChild(this.contextMenu);
        }

        this.contextMenu = null;
        this.contextRow = null;
    }

    _bindSearch() {
        if (!this.searchSelector) return;
        var self = this;
        window.jQuery(this.searchSelector).off('input.commonJsSearch').on('input.commonJsSearch', function () {
            self.table.search(this.value || '').draw();
        });
    }

    _bindFilters() {
        var self = this;
        this.filterBindings.forEach(function (binding) {
            window.jQuery(binding.selector).off('change.commonJsFilter').on('change.commonJsFilter', function () {
                self.table.column(binding.columnIndex).search(this.value || '').draw();
            });
        });
    }
}

DataTableBuilder.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = DataTableBuilder;
