/**
 * @preserve date-and-time.js locale configuration
 * @preserve German (de)
 * @preserve It is using moment.js locale configuration as a reference.
 */

var de = function (date) {
    var code = 'de';

    date.locale(code, {
        res: {
            MMMM: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            MMM: ['Jan.', 'Febr.', 'Mrz.', 'Apr.', 'Mai', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'],
            dddd: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            ddd: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
            dd: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
            A: ['Uhr nachmittags', 'Uhr morgens']
        }
    });
    return code;
};

export { de as default };
