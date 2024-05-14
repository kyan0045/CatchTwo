/**
 * @preserve date-and-time.js plugin
 * @preserve two-digit-year
 */

var plugin = function (date) {
    var name = 'two-digit-year';

    date.plugin(name, {
        parser: {
            YY: function (str) {
                var result = this.exec(/^\d\d/, str);
                result.value += result.value < 70 ? 2000 : 1900;
                return result;
            }
        }
    });
    return name;
};

export { plugin as default };
