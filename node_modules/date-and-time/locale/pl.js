(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.locale = global.date.locale || {}, global.date.locale.pl = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js locale configuration
     * @preserve Polish (pl)
     * @preserve It is using moment.js locale configuration as a reference.
     */

    var pl = function (date) {
        var code = 'pl';

        date.locale(code, {
            res: {
                MMMM: [
                    ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
                    ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']
                ],
                MMM: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
                dddd: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'],
                ddd: ['nie', 'pon', 'wt', 'śr', 'czw', 'pt', 'sb'],
                dd: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So']
            },
            formatter: {
                MMMM: function (d, formatString) {
                    return this.res.MMMM[/D MMMM/.test(formatString) | 0][d.getMonth()];
                }
            },
            parser: {
                MMMM: function (str, formatString) {
                    var result = this.find(this.res.MMMM[/D MMMM/.test(formatString) | 0], str);
                    result.value++;
                    return result;
                }
            }
        });
        return code;
    };

    return pl;

}));
