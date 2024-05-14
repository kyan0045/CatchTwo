(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.locale = global.date.locale || {}, global.date.locale.rw = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js locale configuration
     * @preserve Kinyarwanda (rw)
     * @preserve It is using moment.js locale configuration as a reference.
     */

    var rw = function (date) {
        var code = 'rw';

        date.locale(code, {
            res: {
                MMMM: ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena', 'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'],
                MMM: ['Mtr', 'Gas', 'Wer', 'Mta', 'Gic', 'Kmn', 'Nyk', 'Knm', 'Nze', 'Ukw', 'Ugu', 'Uku'],
                dddd: ['Ku cyumweru', 'Ku wambere', 'Ku wakabiri', 'Ku wagatatu', 'Ku wakane', 'Ku wagatanu', 'Ku wagatandatu'],
                ddd: ['Cyu', 'Mbe', 'Kbr', 'Gtt', 'Kne', 'Gtn', 'Gtd'],
                dd: ['Cy', 'Mb', 'Kb', 'Gt', 'Kn', 'Gn', 'Gd']
            }
        });
        return code;
    };

    return rw;

}));
