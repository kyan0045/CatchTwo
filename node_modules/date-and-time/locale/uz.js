(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.date = global.date || {}, global.date.locale = global.date.locale || {}, global.date.locale.uz = factory()));
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time.js locale configuration
     * @preserve Uzbek (uz)
     * @preserve It is using moment.js locale configuration as a reference.
     */

    var uz = function (date) {
        var code = 'uz';

        date.locale(code, {
            res: {
                MMMM: ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'],
                MMM: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
                dddd: ['Якшанба', 'Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба'],
                ddd: ['Якш', 'Душ', 'Сеш', 'Чор', 'Пай', 'Жум', 'Шан'],
                dd: ['Як', 'Ду', 'Се', 'Чо', 'Па', 'Жу', 'Ша']
            }
        });
        return code;
    };

    return uz;

}));
