/**
 * @preserve date-and-time.js locale configuration
 * @preserve Italian (it)
 * @preserve It is using moment.js locale configuration as a reference.
 */

var it = function (date) {
    var code = 'it';

    date.locale(code, {
        res: {
            MMMM: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
            MMM: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
            dddd: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
            ddd: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
            dd: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
            A: ['di mattina', 'di pomerrigio']
        }
    });
    return code;
};

export { it as default };
