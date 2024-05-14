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

export { uz as default };
