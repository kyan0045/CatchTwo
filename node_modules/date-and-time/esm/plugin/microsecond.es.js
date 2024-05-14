/**
 * @preserve date-and-time.js plugin
 * @preserve microsecond
 */

var plugin = function (date) {
    var name = 'microsecond';

    date.plugin(name, {
        parser: {
            SSSSSS: function (str) {
                var result = this.exec(/^\d{1,6}/, str);
                result.value = result.value / 1000 | 0;
                return result;
            },
            SSSSS: function (str) {
                var result = this.exec(/^\d{1,5}/, str);
                result.value = result.value / 100 | 0;
                return result;
            },
            SSSS: function (str) {
                var result = this.exec(/^\d{1,4}/, str);
                result.value = result.value / 10 | 0;
                return result;
            }
        }
    });
    return name;
};

export { plugin as default };
