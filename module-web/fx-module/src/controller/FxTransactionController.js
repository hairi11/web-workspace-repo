import Common from '@company/common-js-web';
import { TransactionMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';
import FxService from '../FxService.js';
import FxTransactionAction from '../action/FxTransactionAction.js';
import FxTransactionForm from '../form/FxTransactionForm.js';

const { FormRenderers, Logger, NavigationState, Router, Toast } = Common;

const logger = new Logger('FxTransactionController');

class FxTransactionController {
    async init() {
        const context = this.loadContext();

        try {
            // LOAD
            const data = await this.load(context);
            if (!data) return;

            // BUILD
            const form = new FxTransactionForm('#transactionForm', {
                mode: context.mode,
                key: context.key,
                rowsKey: context.rowsKey
            });

            await form.loadReferences();
            form.build();

            const action = new FxTransactionAction({
                form: form,
                mode: context.mode,
                key: context.key,
                rowsKey: context.rowsKey,
                rows: data.rows,
                returnTo: context.returnTo,
                pageConfig: data.pageConfig
            }).build();

            // POPULATE
            if (data.transaction) {
                form.populate(data.transaction);
            }

            if (data.pageConfig.viewMode) {
                FormRenderers.view(form, data.transaction);
            }

            // CONFIGURE
            action.configure();
        } catch (error) {
            Toast.error('Failed to load FX transaction data.');
            logger.error(error);
        }
    }

    loadContext() {
        const navigation = NavigationState.consume();
        const state = navigation?.page === 'transaction' ? navigation : {};

        return {
            mode: state.action || TransactionMode.CREATE,
            key: state.key ?? null,
            rowsKey: state.rowsKey || null,
            returnTo: state.returnTo || { page: 'enquiry' }
        };
    }

    async load(context) {
        const isView = TransactionMode.isView(context.mode);
        const rows = isView ? null : FxRows.get(context.rowsKey);

        if (!isView && !rows) {
            window.location.href = './enquiry.html';
            return null;
        }

        let transaction = null;
        let pageConfig = null;

        await new Router()
            .route(TransactionMode.CREATE, () => {
                pageConfig = {
                    title: 'Add FX Transaction',
                    submitLabel: 'Add',
                    viewMode: false
                };
            })
            .route(TransactionMode.EDIT, () => {
                transaction = Number.isInteger(context.key)
                    ? rows.transactions[context.key]
                    : null;

                if (!transaction) {
                    throw new Error('FX transaction not found.');
                }

                pageConfig = {
                    title: 'Update FX Transaction',
                    submitLabel: 'Update',
                    viewMode: false
                };
            })
            .route(TransactionMode.VIEW, async () => {
                transaction = await FxService.findTransactionById(context.key);

                if (!transaction) {
                    throw new Error('FX transaction not found.');
                }

                pageConfig = {
                    title: 'View FX Transaction',
                    submitLabel: null,
                    viewMode: true
                };
            })
            .dispatch(context.mode);

        return {
            rows: rows,
            transaction: transaction,
            pageConfig: pageConfig
        };
    }
}

export default FxTransactionController;
