(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.locale = global.date.locale || {}, global.date.locale.vi = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js locale configuration
     * @preserve Vietnamese (vi)
     * @preserve It is using moment.js locale configuration as a reference.
     */

    var vi = function (date) {
        var code = 'vi';

        date.locale(code, {
            res: {
                MMMM: ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'],
                MMM: ['Th01', 'Th02', 'Th03', 'Th04', 'Th05', 'Th06', 'Th07', 'Th08', 'Th09', 'Th10', 'Th11', 'Th12'],
                dddd: ['chủ nhật', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy'],
                ddd: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                dd: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
                A: ['sa', 'ch']
            }
        });
        return code;
    };

    return vi;

}));
