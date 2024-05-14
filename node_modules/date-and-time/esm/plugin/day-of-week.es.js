/**
 * @preserve date-and-time.js plugin
 * @preserve day-of-week
 */

var plugin = function (date) {
    var name = 'day-of-week';

    date.plugin(name, {
        parser: {
            dddd: function (str) { return this.find(this.res.dddd, str); },
            ddd: function (str) { return this.find(this.res.ddd, str); },
            dd: function (str) { return this.find(this.res.dd, str); }
        }
    });
    return name;
};

export { plugin as default };
