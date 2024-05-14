(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.plugin = global.date.plugin || {}, global.date.plugin.microsecond = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js plugin
     * @preserve microsecond
     */

    var plugin = function (date) {
        var name = 'microsecond';

        date.plugin(name, {
            parser: {
                SSSSSS: function (str) {
                    var result = this.exec(/^\d{1,6}/, str);
                    result.value = result.value / 1000 | 0;
                    return result;
                },
                SSSSS: function (str) {
                    var result = this.exec(/^\d{1,5}/, str);
                    result.value = result.value / 100 | 0;
                    return result;
                },
                SSSS: function (str) {
                    var result = this.exec(/^\d{1,4}/, str);
                    result.value = result.value / 10 | 0;
                    return result;
                }
            }
        });
        return name;
    };

    return plugin;

}));
