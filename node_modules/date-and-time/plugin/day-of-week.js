(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.plugin = global.date.plugin || {}, global.date.plugin["day-of-week"] = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js plugin
     * @preserve day-of-week
     */

    var plugin = function (date) {
        var name = 'day-of-week';

        date.plugin(name, {
            parser: {
                dddd: function (str) { return this.find(this.res.dddd, str); },
                ddd: function (str) { return this.find(this.res.ddd, str); },
                dd: function (str) { return this.find(this.res.dd, str); }
            }
        });
        return name;
    };

    return plugin;

}));
