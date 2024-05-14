/**
 * @preserve date-and-time.js locale configuration
 * @preserve Azerbaijani (az)
 * @preserve It is using moment.js locale configuration as a reference.
 */

var az = function (date) {
    var code = 'az';

    date.locale(code, {
        res: {
            MMMM: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
            MMM: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avq', 'sen', 'okt', 'noy', 'dek'],
            dddd: ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'],
            ddd: ['Baz', 'BzE', 'ÇAx', 'Çər', 'CAx', 'Cüm', 'Şən'],
            dd: ['Bz', 'BE', 'ÇA', 'Çə', 'CA', 'Cü', 'Şə'],
            A: ['gecə', 'səhər', 'gündüz', 'axşam']
        },
        formatter: {
            A: function (d) {
                var h = d.getHours();
                if (h < 4) {
                    return this.res.A[0];   // gecə
                } else if (h < 12) {
                    return this.res.A[1];   // səhər
                } else if (h < 17) {
                    return this.res.A[2];   // gündüz
                }
                return this.res.A[3];       // axşam
            }
        },
        parser: {
            h12: function (h, a) {
                if (a < 2) {
                    return h;               // gecə, səhər
                }
                return h > 11 ? h : h + 12; // gündüz, axşam
            }
        }
    });
    return code;
};

export { az as default };
