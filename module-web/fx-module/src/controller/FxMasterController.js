import Common from '@company/common-js-web';
import { MasterMode } from '../FxConstants.js';
import FxRows from '../FxRows.js';
import FxService from '../FxService.js';
import FxMasterAction from '../action/FxMasterAction.js';
import FxMasterForm from '../form/FxMasterForm.js';

const { Logger, NavigationState, Toast } = Common;

const logger = new Logger('FxMasterController');

class FxMasterController {
    async init() {
        const context = this.loadContext();

        try {
            // LOAD
            const data = await this.load(context);
            if (!data || !data.master) {
                window.location.href = './enquiry.html';
                return;
            }

            // BUILD
            const form = new FxMasterForm('#fxMasterForm', {
                master: data.master,
                transactions: data.transactions,
                rowsKey: context.rowsKey
            }).build();

            const action = new FxMasterAction({
                form: form,
                mode: context.mode,
                master: data.master,
                rowsKey: context.rowsKey,
                transactions: data.transactions
            }).build();

            // POPULATE
            action.populate(data.master);

            // CONFIGURE
            action.configure();
        } catch (error) {
            Toast.error('Failed to load FX master.');
            logger.error(error);
        }
    }

    loadContext() {
        const navigation = NavigationState.consume();
        const state = navigation?.page === 'master' ? navigation : {};

        return {
            mode: state.action || MasterMode.VIEW,
            masterId: state.key ?? null,
            rowsKey: state.rowsKey || null
        };
    }

    async load(context) {
        if (context.mode === MasterMode.EDIT) {
            return FxRows.get(context.rowsKey);
        }

        if (!context.masterId) return null;

        const [master, transactions] = await Promise.all([
            FxService.findMasterById(context.masterId),
            FxService.findTransactionsByMasterId(context.masterId)
        ]);

        return {
            master: master,
            transactions: transactions
        };
    }
}

export default FxMasterController;
