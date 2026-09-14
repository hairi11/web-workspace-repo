const test = require('node:test');
const assert = require('node:assert/strict');
const CaseUtil = require('../src/util/CaseUtil');

test('converts object keys from snake_case to camelCase recursively', () => {
    const value = CaseUtil.toCamelKeys({
        master_id: 10,
        fx_date: '2026-09-14',
        transactions: [
            {
                record_no: 1,
                fx_category_description: 'Spot'
            }
        ]
    });

    assert.deepEqual(value, {
        masterId: 10,
        fxDate: '2026-09-14',
        transactions: [
            {
                recordNo: 1,
                fxCategoryDescription: 'Spot'
            }
        ]
    });
});

test('converts object keys from camelCase to snake_case recursively', () => {
    const value = CaseUtil.toSnakeKeys({
        masterId: 10,
        fxDate: '2026-09-14',
        transactions: [
            {
                recordNo: 1,
                fxCategoryDescription: 'Spot'
            }
        ]
    });

    assert.deepEqual(value, {
        master_id: 10,
        fx_date: '2026-09-14',
        transactions: [
            {
                record_no: 1,
                fx_category_description: 'Spot'
            }
        ]
    });
});
