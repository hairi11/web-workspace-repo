import Common from '@company/common-js-web';
import { TransactionMode } from '../FxConstants.js';

const { ButtonBar, Dialog, NavigationState } = Common;

class FxTransactionAction {
    constructor(options) {
        this.form = options.form;
        this.mode = options.mode;
        this.key = options.key;
        this.rowsKey = options.rowsKey;
        this.rows = options.rows;
        this.returnTo = options.returnTo;
        this.pageConfig = options.pageConfig;
        this.buttonBar = null;
    }

    build() {
        const viewMode = TransactionMode.isView(this.mode);
        const count = this.rows ? this.rows.transactions.length : 0;
        const index = this.rows
            ? (TransactionMode.isCreate(this.mode) ? count : this.key)
            : 0;

        this.buttonBar = new ButtonBar('#transactionButtonBar')
            .navigator({
                previous: '#previousButton',
                next: '#nextButton',
                index: index,
                count: count,
                hidden: viewMode,
                beforeNavigate: () => this.beforeNavigate(),
                onNavigate: (targetIndex) => this.openRow(targetIndex)
            })
            .primary({
                target: '#transactionSubmitButton',
                text: this.pageConfig.submitLabel,
                hidden: viewMode
            })
            .secondary({
                target: '#cancelButton',
                text: viewMode ? 'Back' : 'Cancel',
                onClick: (event) => {
                    event.preventDefault();
                    this.navigateTo(this.returnTo);
                }
            })
            .build();

        return this;
    }

    configure() {
        const heading = document.querySelector('h1');

        if (heading) {
            heading.textContent = this.pageConfig.title;
        }

        return this;
    }

    destroy() {
        if (this.buttonBar) {
            this.buttonBar.destroy();
            this.buttonBar = null;
        }

        return this;
    }

    async beforeNavigate() {
        if (!this.form.isDirty()) return true;

        const shouldUpdate = await Dialog.confirm({
            title: 'Unsaved Changes',
            message: 'Update the current transaction before moving?',
            yesLabel: 'OK',
            noLabel: 'No',
            closable: false,
            escapeClose: false
        });

        if (!shouldUpdate) return true;
        return this.form.saveDirtyRow();
    }

    openRow(targetIndex) {
        NavigationState.set({
            page: 'transaction',
            action: TransactionMode.EDIT,
            key: targetIndex,
            rowsKey: this.rowsKey,
            returnTo: this.returnTo
        });
        window.location.href = './transaction.html';
    }

    navigateTo(target) {
        const destination = target && target.page ? target : { page: 'enquiry' };

        if (destination.page === 'master') {
            NavigationState.set(destination);
            window.location.href = './master.html';
            return;
        }

        window.location.href = './enquiry.html';
    }
}

export default FxTransactionAction;
