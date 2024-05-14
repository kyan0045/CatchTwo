/**
 * @preserve date-and-time.js locale configuration
 * @preserve Danish (DK)
 * @preserve It is using moment.js locale configuration as a reference.
 */

var dk = function (date) {
    var code = 'dk';

    date.locale(code, {
        res: {
            MMMM: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'],
            MMM: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
            dddd: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'],
            ddd: ['søn', 'man', 'tir', 'ons', 'tors', 'fre', 'lør'],
            dd: ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø']
        }
    });
    return code;
};

export { dk as default };
