function resolve(value) {
    return typeof value === 'function' ? value() : value;
}

const ConditionUtil = {
    choose: function (condition, whenTrue, whenFalse) {
        return condition
            ? resolve(whenTrue)
            : resolve(whenFalse);
    }
};

module.exports = ConditionUtil;
