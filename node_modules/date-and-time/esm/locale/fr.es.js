/**
 * @preserve date-and-time.js locale configuration
 * @preserve French (fr)
 * @preserve It is using moment.js locale configuration as a reference.
 */

var fr = function (date) {
    var code = 'fr';

    date.locale(code, {
        res: {
            MMMM: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
            MMM: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
            dddd: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
            ddd: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
            dd: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
            A: ['matin', 'l\'après-midi']
        }
    });
    return code;
};

export { fr as default };
