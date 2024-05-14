(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.locale = global.date.locale || {}, global.date.locale.cs = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js locale configuration
     * @preserve Czech (cs)
     * @preserve It is using moment.js locale configuration as a reference.
     */

    var cs = function (date) {
        var code = 'cs';

        date.locale(code, {
            res: {
                MMMM: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'],
                MMM: ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'],
                dddd: ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'],
                ddd: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
                dd: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so']
            }
        });
        return code;
    };

    return cs;

}));
