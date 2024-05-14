(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.locale = global.date.locale || {}, global.date.locale.sv = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js locale configuration
     * @preserve Swedish (SV)
     * @preserve It is using moment.js locale configuration as a reference.
     */

    var sv = function (date) {
        var code = 'sv';

        date.locale(code, {
            res: {
                MMMM: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
                MMM: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
                dddd: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
                ddd: ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'],
                dd: ['sö', 'må', 'ti', 'on', 'to', 'fr', 'lö']
            }
        });
        return code;
    };

    return sv;

}));
