/**
 * @preserve date-and-time.js locale configuration
 * @preserve Turkish (tr)
 * @preserve It is using moment.js locale configuration as a reference.
 */

var tr = function (date) {
    var code = 'tr';

    date.locale(code, {
        res: {
            MMMM: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
            MMM: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
            dddd: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
            ddd: ['Paz', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'],
            dd: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct']
        }
    });
    return code;
};

export { tr as default };
