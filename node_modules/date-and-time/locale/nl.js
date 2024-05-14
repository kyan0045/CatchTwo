(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.locale = global.date.locale || {}, global.date.locale.nl = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js locale configuration
     * @preserve Dutch (nl)
     * @preserve It is using moment.js locale configuration as a reference.
     */

    var nl = function (date) {
        var code = 'nl';

        date.locale(code, {
            res: {
                MMMM: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
                MMM: [
                    ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
                    ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
                ],
                dddd: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
                ddd: ['zo.', 'ma.', 'di.', 'wo.', 'do.', 'vr.', 'za.'],
                dd: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
            },
            formatter: {
                MMM: function (d, formatString) {
                    return this.res.MMM[/-MMM-/.test(formatString) | 0][d.getMonth()];
                }
            },
            parser: {
                MMM: function (str, formatString) {
                    var result = this.find(this.res.MMM[/-MMM-/.test(formatString) | 0], str);
                    result.value++;
                    return result;
                }
            }
        });
        return code;
    };

    return nl;

}));
