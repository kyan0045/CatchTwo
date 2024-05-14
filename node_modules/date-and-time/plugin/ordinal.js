(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.plugin = global.date.plugin || {}, global.date.plugin.ordinal = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js plugin
     * @preserve ordinal
     */

    var plugin = function (date) {
        var name = 'ordinal';

        date.plugin(name, {
            formatter: {
                DDD: function (d) {
                    var day = d.getDate();

                    switch (day) {
                    case 1:
                    case 21:
                    case 31:
                        return day + 'st';
                    case 2:
                    case 22:
                        return day + 'nd';
                    case 3:
                    case 23:
                        return day + 'rd';
                    default:
                        return day + 'th';
                    }
                }
            }
        });
        return name;
    };

    return plugin;

}));
