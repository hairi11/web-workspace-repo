import Common from '@company/common-js-web';
import { MasterMode, TransactionMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';

const {
    DataTableBuilder,
    DateUtil,
    Dialog,
    NavigationState,
    Renderers,
    Toast
} = Common;

class FxMasterAction {
    constructor(options) {
        this.form = options.form;
        this.mode = options.mode;
        this.rowsKey = options.rowsKey;
        this.transactions = Array.isArray(options.transactions)
            ? options.transactions
            : [];
        this.table = null;
    }

    build() {
        this.table = this.buildTable();
        return this;
    }

    populate(master) {
        const status = document.querySelector('#masterStatus');
        const reportDate = document.querySelector('#masterReportDate');

        if (status) status.textContent = master.status || '-';
        if (reportDate) {
            reportDate.textContent = master.reportDate
                ? DateUtil.formatDate(master.reportDate)
                : '-';
        }

        return this;
    }

    configure() {
        const editing = this.mode === MasterMode.EDIT;
        const heading = document.querySelector('h1');
        const addButton = document.querySelector('#addTransactionButton');
        const saveButton = document.querySelector('#saveButton');
        const submitButton = document.querySelector('#submitButton');
        const backButton = document.querySelector('#backButton');

        if (heading) heading.textContent = editing ? 'Edit FX Master' : 'View FX Master';
        if (addButton) addButton.hidden = !editing;
        if (saveButton) saveButton.hidden = !editing;
        if (submitButton) submitButton.hidden = !editing;
        if (backButton) backButton.hidden = editing;

        return this;
    }

    bind() {
        if (this.mode === MasterMode.EDIT) {
            this.bindAddTransaction();
        }
        return this;
    }

    buildTable() {
        const builder = new DataTableBuilder('#fxMasterTable')
            .data(this.getRows())
            .option('paging', false)
            .option('info', false)
            .option('ordering', false)
            .column('recordNo', 'No.')
            .renderer('fxDate', 'FX Date', Renderers.date())
            .column('fxCategory', 'Category')
            .column('fxCode', 'Code')
            .column('fxType', 'Type')
            .column('fxCurrency', 'Currency')
            .renderer('fxAmount', 'Amount', Renderers.amount());

        if (this.mode === MasterMode.EDIT) {
            builder
                .menuAction({ mode: 'context' })
                .addAction({
                    text: 'Edit',
                    icon: 'fa fa-pen',
                    onClick: (row) => {
                        this.openTransaction(TransactionMode.EDIT, row.rowIndex);
                    }
                })
                .addAction({
                    text: 'Remove',
                    icon: 'fa fa-trash',
                    className: 'text-danger',
                    onClick: (row) => {
                        this.removeTransaction(row);
                    }
                });
        }

        return builder.build();
    }

    getRows() {
        return this.transactions.map((transaction, index) => Object.assign({}, transaction, {
            rowIndex: index,
            recordNo: transaction.recordNo || index + 1
        }));
    }

    bindAddTransaction() {
        const button = document.querySelector('#addTransactionButton');
        if (!button) return;

        button.addEventListener('click', () => {
            this.openTransaction(TransactionMode.CREATE, null);
        });
    }

    openTransaction(mode, index) {
        NavigationState.set({
            page: 'transaction',
            action: mode,
            key: index,
            rowsKey: this.rowsKey,
            returnTo: {
                page: 'master',
                action: MasterMode.EDIT,
                rowsKey: this.rowsKey
            }
        });
        window.location.href = './transaction.html';
    }

    async removeTransaction(row) {
        const confirmed = await Dialog.confirm({
            title: 'Remove Transaction',
            message: 'Remove this FX transaction?',
            yesLabel: 'Yes',
            noLabel: 'No'
        });
        if (!confirmed) return;

        const rows = FxRows.removeTransaction(this.rowsKey, row.rowIndex);
        if (!rows) return;

        this.transactions = rows.transactions;
        this.form.setTransactions(this.transactions);
        this.table.replaceData(this.getRows(), false);
        Toast.success('FX transaction removed.');
    }
}

export default FxMasterAction;
