(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.plugin = global.date.plugin || {}, global.date.plugin["two-digit-year"] = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js plugin
     * @preserve two-digit-year
     */

    var plugin = function (date) {
        var name = 'two-digit-year';

        date.plugin(name, {
            parser: {
                YY: function (str) {
                    var result = this.exec(/^\d\d/, str);
                    result.value += result.value < 70 ? 2000 : 1900;
                    return result;
                }
            }
        });
        return name;
    };

    return plugin;

}));
