import Common from '@company/common-js-web';
import { TransactionMode } from '../FxConstants.js';

const { Dialog, NavigationState } = Common;

class FxTransactionAction {
    constructor(options) {
        this.form = options.form;
        this.mode = options.mode;
        this.key = options.key;
        this.rowsKey = options.rowsKey;
        this.rows = options.rows;
        this.returnTo = options.returnTo;
        this.pageConfig = options.pageConfig;
    }

    configure() {
        this.configurePage();
        this.configureRowNavigation();
        return this;
    }

    bind() {
        this.bindReturnButton();
        this.bindRowNavigation();
        return this;
    }

    configurePage() {
        const heading = document.querySelector('h1');
        const submitButton = document.querySelector('#transactionForm button[type="submit"]');
        const cancelButton = document.querySelector('#cancelButton');

        if (heading) heading.textContent = this.pageConfig.title;
        if (submitButton && this.pageConfig.submitLabel) {
            submitButton.textContent = this.pageConfig.submitLabel;
        }
        if (submitButton) submitButton.hidden = Boolean(this.pageConfig.viewMode);
        if (cancelButton) {
            cancelButton.textContent = this.pageConfig.viewMode ? 'Back' : 'Cancel';
        }
    }

    configureRowNavigation() {
        const previousButton = document.querySelector('#previousButton');
        const nextButton = document.querySelector('#nextButton');
        const viewMode = TransactionMode.isView(this.mode);

        if (previousButton) previousButton.hidden = viewMode;
        if (nextButton) nextButton.hidden = viewMode;

        if (viewMode || !this.rows) return;

        const currentIndex = TransactionMode.isCreate(this.mode)
            ? this.rows.transactions.length
            : this.key;
        const lastIndex = this.rows.transactions.length - 1;

        this.setNavigationDisabled(
            previousButton,
            this.rows.transactions.length === 0
                || !Number.isInteger(currentIndex)
                || currentIndex <= 0
        );
        this.setNavigationDisabled(
            nextButton,
            TransactionMode.isCreate(this.mode)
                || !Number.isInteger(currentIndex)
                || currentIndex >= lastIndex
        );
    }

    setNavigationDisabled(link, disabled) {
        if (!link) return;

        link.classList.toggle('is-disabled', disabled);
        link.setAttribute('aria-disabled', String(disabled));
        link.tabIndex = disabled ? -1 : 0;
    }

    bindRowNavigation() {
        if (TransactionMode.isView(this.mode) || !this.rows) return;

        const previousButton = document.querySelector('#previousButton');
        const nextButton = document.querySelector('#nextButton');
        const currentIndex = TransactionMode.isCreate(this.mode)
            ? this.rows.transactions.length
            : this.key;

        if (previousButton) {
            previousButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (previousButton.getAttribute('aria-disabled') === 'true') return;

                this.navigateToRow(currentIndex - 1);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (nextButton.getAttribute('aria-disabled') === 'true') return;

                this.navigateToRow(currentIndex + 1);
            });
        }
    }

    async navigateToRow(targetIndex) {
        if (!Number.isInteger(targetIndex)
            || targetIndex < 0
            || targetIndex >= this.rows.transactions.length) {
            return;
        }

        if (this.form.isDirty()) {
            const shouldUpdate = await Dialog.confirm({
                title: 'Unsaved Changes',
                message: 'Update the current transaction before moving?',
                yesLabel: 'OK',
                noLabel: 'No',
                closable: false,
                escapeClose: false
            });

            if (shouldUpdate) {
                const saved = await this.form.saveDirtyRow();
                if (!saved) return;
            }
        }

        NavigationState.set({
            page: 'transaction',
            action: TransactionMode.EDIT,
            key: targetIndex,
            rowsKey: this.rowsKey,
            returnTo: this.returnTo
        });
        window.location.href = './transaction.html';
    }

    bindReturnButton() {
        const button = document.querySelector('#cancelButton');
        if (!button) return;

        button.addEventListener('click', (event) => {
            event.preventDefault();
            this.navigateTo(this.returnTo);
        });
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
