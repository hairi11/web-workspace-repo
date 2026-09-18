import Common from '@company/common-js-web';
import { MasterMode, TransactionMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';
import FxService from '../FxService.js';

const {
    Button,
    ButtonBar,
    DataTableBuilder,
    DateUtil,
    Dialog,
    Logger,
    NavigationState,
    Renderers,
    Toast
} = Common;

const logger = new Logger('FxMasterAction');

class FxMasterAction {
    constructor(options) {
        this.form = options.form;
        this.mode = options.mode;
        this.master = options.master || null;
        this.rowsKey = options.rowsKey;
        this.transactions = Array.isArray(options.transactions)
            ? options.transactions
            : [];
        this.table = null;
        this.addButton = null;
        this.buttonBar = null;
    }

    build() {
        const editing = this.mode === MasterMode.EDIT;

        this.table = this.buildTable();

        this.addButton = new Button('#addTransactionButton', {
            variant: Button.Variant.PRIMARY,
            hidden: !editing,
            onClick: () => {
                this.openTransaction(TransactionMode.CREATE, null);
            }
        }).build();

        this.buttonBar = new ButtonBar('#masterButtonBar')
            .primary({
                target: '#submitButton',
                hidden: !editing
            })
            .secondary([
                {
                    target: '#saveButton',
                    hidden: !editing
                },
                {
                    target: '#cancelButton',
                    hidden: !editing,
                    placement: ButtonBar.Placement.END,
                    onClick: () => this.cancel()
                },
                {
                    target: '#deleteButton',
                    hidden: !this.hasPersistedMaster(),
                    onClick: () => this.deleteMaster()
                },
                {
                    target: '#backButton',
                    hidden: editing,
                    placement: ButtonBar.Placement.END
                }
            ])
            .build();

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
        const heading = document.querySelector('h1');

        if (heading) {
            heading.textContent = this.mode === MasterMode.EDIT
                ? 'Edit FX Master'
                : 'View FX Master';
        }

        return this;
    }

    destroy() {
        if (this.addButton) {
            this.addButton.destroy();
            this.addButton = null;
        }

        if (this.buttonBar) {
            this.buttonBar.destroy();
            this.buttonBar = null;
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

    cancel() {
        window.location.href = './enquiry.html';
    }

    hasPersistedMaster() {
        return Boolean(this.master && this.master.id);
    }

    async deleteMaster() {
        if (!this.hasPersistedMaster()) return;

        const confirmed = await Dialog.confirm({
            title: 'Delete FX Master',
            message: 'Delete this FX master and all of its transactions?',
            yesLabel: 'Delete',
            noLabel: 'Cancel'
        });
        if (!confirmed) return;

        try {
            await FxService.deleteMaster(this.master.id);
            FxRows.clear(this.rowsKey);
            Toast.success('FX master deleted.');
            window.location.href = './enquiry.html';
        } catch (error) {
            Toast.error('Failed to delete FX master.');
            logger.error(error);
        }
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
