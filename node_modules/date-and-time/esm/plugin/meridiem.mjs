/**
 * @preserve date-and-time.js plugin
 * @preserve meridiem
 */

var plugin = function (date) {
    var name = 'meridiem';

    date.plugin(name, {
        res: {
            AA: ['A.M.', 'P.M.'],
            a: ['am', 'pm'],
            aa: ['a.m.', 'p.m.']
        },
        formatter: {
            AA: function (d) {
                return this.res.AA[d.getHours() > 11 | 0];
            },
            a: function (d) {
                return this.res.a[d.getHours() > 11 | 0];
            },
            aa: function (d) {
                return this.res.aa[d.getHours() > 11 | 0];
            }
        },
        parser: {
            AA: function (str) {
                var result = this.find(this.res.AA, str);
                result.token = 'A';
                return result;
            },
            a: function (str) {
                var result = this.find(this.res.a, str);
                result.token = 'A';
                return result;
            },
            aa: function (str) {
                var result = this.find(this.res.aa, str);
                result.token = 'A';
                return result;
            }
        }
    });
    return name;
};

export { plugin as default };
