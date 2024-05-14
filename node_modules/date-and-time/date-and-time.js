(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.date = factory());
})(this, (function () { 'use strict';

    /**
     * @preserve date-and-time (c) KNOWLEDGECODE | MIT
     */

    var locales = {},
        plugins = {},
        lang = 'en',
        _res = {
            MMMM: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            MMM: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            dddd: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            ddd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            dd: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            A: ['AM', 'PM']
        },
        _formatter = {
            YYYY: function (d/*, formatString*/) { return ('000' + d.getFullYear()).slice(-4); },
            YY: function (d/*, formatString*/) { return ('0' + d.getFullYear()).slice(-2); },
            Y: function (d/*, formatString*/) { return '' + d.getFullYear(); },
            MMMM: function (d/*, formatString*/) { return this.res.MMMM[d.getMonth()]; },
            MMM: function (d/*, formatString*/) { return this.res.MMM[d.getMonth()]; },
            MM: function (d/*, formatString*/) { return ('0' + (d.getMonth() + 1)).slice(-2); },
            M: function (d/*, formatString*/) { return '' + (d.getMonth() + 1); },
            DD: function (d/*, formatString*/) { return ('0' + d.getDate()).slice(-2); },
            D: function (d/*, formatString*/) { return '' + d.getDate(); },
            HH: function (d/*, formatString*/) { return ('0' + d.getHours()).slice(-2); },
            H: function (d/*, formatString*/) { return '' + d.getHours(); },
            A: function (d/*, formatString*/) { return this.res.A[d.getHours() > 11 | 0]; },
            hh: function (d/*, formatString*/) { return ('0' + (d.getHours() % 12 || 12)).slice(-2); },
            h: function (d/*, formatString*/) { return '' + (d.getHours() % 12 || 12); },
            mm: function (d/*, formatString*/) { return ('0' + d.getMinutes()).slice(-2); },
            m: function (d/*, formatString*/) { return '' + d.getMinutes(); },
            ss: function (d/*, formatString*/) { return ('0' + d.getSeconds()).slice(-2); },
            s: function (d/*, formatString*/) { return '' + d.getSeconds(); },
            SSS: function (d/*, formatString*/) { return ('00' + d.getMilliseconds()).slice(-3); },
            SS: function (d/*, formatString*/) { return ('0' + (d.getMilliseconds() / 10 | 0)).slice(-2); },
            S: function (d/*, formatString*/) { return '' + (d.getMilliseconds() / 100 | 0); },
            dddd: function (d/*, formatString*/) { return this.res.dddd[d.getDay()]; },
            ddd: function (d/*, formatString*/) { return this.res.ddd[d.getDay()]; },
            dd: function (d/*, formatString*/) { return this.res.dd[d.getDay()]; },
            Z: function (d/*, formatString*/) {
                var offset = d.getTimezoneOffset() / 0.6 | 0;
                return (offset > 0 ? '-' : '+') + ('000' + Math.abs(offset - (offset % 100 * 0.4 | 0))).slice(-4);
            },
            ZZ: function (d/*, formatString*/) {
                var offset = d.getTimezoneOffset();
                var mod = Math.abs(offset);
                return (offset > 0 ? '-' : '+') + ('0' + (mod / 60 | 0)).slice(-2) + ':' + ('0' + mod % 60).slice(-2);
            },
            post: function (str) { return str; },
            res: _res
        },
        _parser = {
            YYYY: function (str/*, formatString */) { return this.exec(/^\d{4}/, str); },
            Y: function (str/*, formatString */) { return this.exec(/^\d{1,4}/, str); },
            MMMM: function (str/*, formatString */) {
                var result = this.find(this.res.MMMM, str);
                result.value++;
                return result;
            },
            MMM: function (str/*, formatString */) {
                var result = this.find(this.res.MMM, str);
                result.value++;
                return result;
            },
            MM: function (str/*, formatString */) { return this.exec(/^\d\d/, str); },
            M: function (str/*, formatString */) { return this.exec(/^\d\d?/, str); },
            DD: function (str/*, formatString */) { return this.exec(/^\d\d/, str); },
            D: function (str/*, formatString */) { return this.exec(/^\d\d?/, str); },
            HH: function (str/*, formatString */) { return this.exec(/^\d\d/, str); },
            H: function (str/*, formatString */) { return this.exec(/^\d\d?/, str); },
            A: function (str/*, formatString */) { return this.find(this.res.A, str); },
            hh: function (str/*, formatString */) { return this.exec(/^\d\d/, str); },
            h: function (str/*, formatString */) { return this.exec(/^\d\d?/, str); },
            mm: function (str/*, formatString */) { return this.exec(/^\d\d/, str); },
            m: function (str/*, formatString */) { return this.exec(/^\d\d?/, str); },
            ss: function (str/*, formatString */) { return this.exec(/^\d\d/, str); },
            s: function (str/*, formatString */) { return this.exec(/^\d\d?/, str); },
            SSS: function (str/*, formatString */) { return this.exec(/^\d{1,3}/, str); },
            SS: function (str/*, formatString */) {
                var result = this.exec(/^\d\d?/, str);
                result.value *= 10;
                return result;
            },
            S: function (str/*, formatString */) {
                var result = this.exec(/^\d/, str);
                result.value *= 100;
                return result;
            },
            Z: function (str/*, formatString */) {
                var result = this.exec(/^[+-]\d{2}[0-5]\d/, str);
                result.value = (result.value / 100 | 0) * -60 - result.value % 100;
                return result;
            },
            ZZ: function (str/*, formatString */) {
                var arr = /^([+-])(\d{2}):([0-5]\d)/.exec(str) || ['', '', '', ''];
                return { value: 0 - ((arr[1] + arr[2] | 0) * 60 + (arr[1] + arr[3] | 0)), length: arr[0].length };
            },
            h12: function (h, a) { return (h === 12 ? 0 : h) + a * 12; },
            exec: function (re, str) {
                var result = (re.exec(str) || [''])[0];
                return { value: result | 0, length: result.length };
            },
            find: function (array, str) {
                var index = -1, length = 0;

                for (var i = 0, len = array.length, item; i < len; i++) {
                    item = array[i];
                    if (!str.indexOf(item) && item.length > length) {
                        index = i;
                        length = item.length;
                    }
                }
                return { value: index, length: length };
            },
            pre: function (str) { return str; },
            res: _res
        },
        extend = function (base, props, override, res) {
            var obj = {}, key;

            for (key in base) {
                obj[key] = base[key];
            }
            for (key in props || {}) {
                if (!(!!override ^ !!obj[key])) {
                    obj[key] = props[key];
                }
            }
            if (res) {
                obj.res = res;
            }
            return obj;
        },
        proto = {
            _formatter: _formatter,
            _parser: _parser
        },
        localized_proto,
        date;

    /**
     * Compiling format strings
     * @param {string} formatString - A format string
     * @returns {Array.<string>} A compiled object
     */
    proto.compile = function (formatString) {
        var re = /\[([^[\]]|\[[^[\]]*])*]|([A-Za-z])\2+|\.{3}|./g, keys, pattern = [formatString];

        while ((keys = re.exec(formatString))) {
            pattern[pattern.length] = keys[0];
        }
        return pattern;
    };

    /**
     * Formatting date and time objects (Date -> String)
     * @param {Date} dateObj - A Date object
     * @param {string|Array.<string>} arg - A format string or its compiled object
     * @param {boolean} [utc] - Output as UTC
     * @returns {string} A formatted string
     */
    proto.format = function (dateObj, arg, utc) {
        var ctx = this || date, pattern = typeof arg === 'string' ? ctx.compile(arg) : arg,
            d = (function () {
                if (utc) {
                    var u = new Date(dateObj.getTime());

                    u.getFullYear = u.getUTCFullYear;
                    u.getMonth = u.getUTCMonth;
                    u.getDate = u.getUTCDate;
                    u.getHours = u.getUTCHours;
                    u.getMinutes = u.getUTCMinutes;
                    u.getSeconds = u.getUTCSeconds;
                    u.getMilliseconds = u.getUTCMilliseconds;
                    u.getDay = u.getUTCDay;
                    u.getTimezoneOffset = function () { return 0; };
                    return u;
                }
                return dateObj;
            }()),
            formatter = ctx._formatter, str = '';

        for (var i = 1, len = pattern.length, token; i < len; i++) {
            token = pattern[i];
            str += formatter[token] ? formatter.post(formatter[token](d, pattern[0])) : token.replace(/\[(.*)]/, '$1');
        }
        return str;
    };

    /**
     * Pre-parsing date and time strings
     * @param {string} dateString - A date and time string
     * @param {string|Array.<string>} arg - A format string or its compiled object
     * @param {boolean} [utc] - Input as UTC
     * @returns {Object} A pre-parsed result object
     */
    proto.preparse = function (dateString, arg) {
        var ctx = this || date, pattern = typeof arg === 'string' ? ctx.compile(arg) : arg,
            dt = { Y: 1970, M: 1, D: 1, H: 0, A: 0, h: 0, m: 0, s: 0, S: 0, Z: 0, _index: 0, _length: 0, _match: 0 },
            comment = /\[(.*)]/, parser = ctx._parser, offset = 0;

        dateString = parser.pre(dateString);
        for (var i = 1, len = pattern.length, token, result; i < len; i++) {
            token = pattern[i];
            if (parser[token]) {
                result = parser[token](dateString.slice(offset), pattern[0]);
                if (!result.length) {
                    break;
                }
                offset += result.length;
                dt[result.token || token.charAt(0)] = result.value;
                dt._match++;
            } else if (token === dateString.charAt(offset) || token === ' ') {
                offset++;
            } else if (comment.test(token) && !dateString.slice(offset).indexOf(comment.exec(token)[1])) {
                offset += token.length - 2;
            } else if (token === '...') {
                offset = dateString.length;
                break;
            } else {
                break;
            }
        }
        dt.H = dt.H || parser.h12(dt.h, dt.A);  // eslint-disable-line logical-assignment-operators
        dt._index = offset;
        dt._length = dateString.length;
        return dt;
    };

    /**
     * Parsing of date and time string (String -> Date)
     * @param {string} dateString - A date-time string
     * @param {string|Array.<string>} arg - A format string or its compiled object
     * @param {boolean} [utc] - Input as UTC
     * @returns {Date} A Date object
     */
    proto.parse = function (dateString, arg, utc) {
        var ctx = this || date, pattern = typeof arg === 'string' ? ctx.compile(arg) : arg,
            dt = ctx.preparse(dateString, pattern);

        if (ctx.isValid(dt)) {
            dt.M -= dt.Y < 100 ? 22801 : 1; // 22801 = 1900 * 12 + 1
            if (utc || ~ctx._parser.find(pattern, 'ZZ').value) {
                return new Date(Date.UTC(dt.Y, dt.M, dt.D, dt.H, dt.m + dt.Z, dt.s, dt.S));
            }
            return new Date(dt.Y, dt.M, dt.D, dt.H, dt.m, dt.s, dt.S);
        }
        return new Date(NaN);
    };

    /**
     * Date and time string validation
     * @param {Object|string} arg1 - A pre-parsed result object or a date and time string
     * @param {string|Array.<string>} [arg2] - A format string or its compiled object
     * @returns {boolean} Whether the date and time string is a valid date and time
     */
    proto.isValid = function (arg1, arg2) {
        var ctx = this || date, dt = typeof arg1 === 'string' ? ctx.preparse(arg1, arg2) : arg1,
            last = [31, 28 + ctx.isLeapYear(dt.Y) | 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][dt.M - 1];

        return !(
            dt._index < 1 || dt._length < 1 || dt._index - dt._length || dt._match < 1 ||
            dt.Y < 1 || dt.Y > 9999 || dt.M < 1 || dt.M > 12 || dt.D < 1 || dt.D > last ||
            dt.H < 0 || dt.H > 23 || dt.m < 0 || dt.m > 59 || dt.s < 0 || dt.s > 59 || dt.S < 0 || dt.S > 999 ||
            dt.Z < -840 || dt.Z > 720
        );
    };

    /**
     * Format transformation of date and time string (String -> String)
     * @param {string} dateString - A date and time string
     * @param {string|Array.<string>} arg1 - A format string or its compiled object before transformation
     * @param {string|Array.<string>} arg2 - A format string or its compiled object after transformation
     * @param {boolean} [utc] - Output as UTC
     * @returns {string} A formatted string
     */
    proto.transform = function (dateString, arg1, arg2, utc) {
        const ctx = this || date;
        return ctx.format(ctx.parse(dateString, arg1), arg2, utc);
    };

    /**
     * Adding years
     * @param {Date} dateObj - A Date object
     * @param {number} years - Number of years to add
     * @param {boolean} [utc] - Calculates as UTC
     * @returns {Date} The Date object after adding the value
     */
    proto.addYears = function (dateObj, years, utc) {
        return (this || date).addMonths(dateObj, years * 12, utc);
    };

    /**
     * Adding months
     * @param {Date} dateObj - A Date object
     * @param {number} months - Number of months to add
     * @param {boolean} [utc] - Calculates as UTC
     * @returns {Date} The Date object after adding the value
     */
    proto.addMonths = function (dateObj, months, utc) {
        var d = new Date(dateObj.getTime());

        if (utc) {
            d.setUTCMonth(d.getUTCMonth() + months);
            if (d.getUTCDate() < dateObj.getUTCDate()) {
                return (this || date).addDays(d, -d.getUTCDate(), utc);
            }
        } else {
            d.setMonth(d.getMonth() + months);
            if (d.getDate() < dateObj.getDate()) {
                return (this || date).addDays(d, -d.getDate(), utc);
            }
        }
        return d;
    };

    /**
     * Adding days
     * @param {Date} dateObj - A Date object
     * @param {number} days - Number of days to add
     * @param {boolean} [utc] - Calculates as UTC
     * @returns {Date} The Date object after adding the value
     */
    proto.addDays = function (dateObj, days, utc) {
        return (this || date).addHours(dateObj, days * 24, utc);
    };

    /**
     * Adding hours
     * @param {Date} dateObj - A Date object
     * @param {number} hours - Number of hours to add
     * @param {boolean} [utc] - Calculates as UTC
     * @returns {Date} The Date object after adding the value
     */
    proto.addHours = function (dateObj, hours, utc) {
        return (this || date).addMinutes(dateObj, hours * 60, utc);
    };

    /**
     * Adding minutes
     * @param {Date} dateObj - A Date object
     * @param {number} minutes - Number of minutes to add
     * @param {boolean} [utc] - Calculates as UTC
     * @returns {Date} The Date object after adding the value
     */
    proto.addMinutes = function (dateObj, minutes, utc) {
        return (this || date).addSeconds(dateObj, minutes * 60, utc);
    };

    /**
     * Adding seconds
     * @param {Date} dateObj - A Date object
     * @param {number} seconds - Number of seconds to add
     * @param {boolean} [utc] - Calculates as UTC
     * @returns {Date} The Date object after adding the value
     */
    proto.addSeconds = function (dateObj, seconds, utc) {
        return (this || date).addMilliseconds(dateObj, seconds * 1000, utc);
    };

    /**
     * Adding milliseconds
     * @param {Date} dateObj - A Date object
     * @param {number} milliseconds - Number of milliseconds to add
     * @param {boolean} [utc] - Calculates as UTC
     * @returns {Date} The Date object after adding the value
     */
    proto.addMilliseconds = function (dateObj, milliseconds, utc) {
        var d = new Date(dateObj.getTime());

        if (utc) {
            d.setUTCMilliseconds(d.getUTCMilliseconds() + milliseconds);
        } else {
            d.setMilliseconds(d.getMilliseconds() + milliseconds);
        }
        return d;
    };

    /**
     * Subtracting two dates (date1 - date2)
     * @param {Date} date1 - A Date object
     * @param {Date} date2 - A Date object
     * @returns {Object} The result object of subtracting date2 from date1
     */
    proto.subtract = function (date1, date2) {
        var delta = date1.getTime() - date2.getTime();

        return {
            toMilliseconds: function () {
                return delta;
            },
            toSeconds: function () {
                return delta / 1000;
            },
            toMinutes: function () {
                return delta / 60000;
            },
            toHours: function () {
                return delta / 3600000;
            },
            toDays: function () {
                return delta / 86400000;
            }
        };
    };

    /**
     * Whether a year is a leap year
     * @param {number} y - A year to check
     * @returns {boolean} Whether the year is a leap year
     */
    proto.isLeapYear = function (y) {
        return (!(y % 4) && !!(y % 100)) || !(y % 400);
    };

    /**
     * Comparison of two dates
     * @param {Date} date1 - A Date object
     * @param {Date} date2 - A Date object
     * @returns {boolean} Whether the two dates are the same day (time is ignored)
     */
    proto.isSameDay = function (date1, date2) {
        return date1.toDateString() === date2.toDateString();
    };

    /**
     * Definition of new locale
     * @param {string} code - A language code
     * @param {Function} locale - A locale installer
     * @returns {void}
     */
    proto.locale = function (code, locale) {
        if (!locales[code]) {
            locales[code] = locale;
        }
    };

    /**
     * Definition of new plugin
     * @param {string} name - A plugin name
     * @param {Function} plugin - A plugin installer
     * @returns {void}
     */
    proto.plugin = function (name, plugin) {
        if (!plugins[name]) {
            plugins[name] = plugin;
        }
    };

    localized_proto = extend(proto);
    date = extend(proto);

    /**
     * Changing locales
     * @param {Function|string} [locale] - A locale installer or language code
     * @returns {string} The current language code
     */
    date.locale = function (locale) {
        var install = typeof locale === 'function' ? locale : date.locale[locale];

        if (!install) {
            return lang;
        }
        lang = install(proto);

        var extension = locales[lang] || {};
        var res = extend(_res, extension.res, true);
        var formatter = extend(_formatter, extension.formatter, true, res);
        var parser = extend(_parser, extension.parser, true, res);

        date._formatter = localized_proto._formatter = formatter;
        date._parser = localized_proto._parser = parser;

        for (var plugin in plugins) {
            date.extend(plugins[plugin]);
        }

        return lang;
    };

    /**
     * Functional extension
     * @param {Object} extension - An extension object
     * @returns {void}
     */
    date.extend = function (extension) {
        var res = extend(date._parser.res, extension.res);
        var extender = extension.extender || {};

        date._formatter = extend(date._formatter, extension.formatter, false, res);
        date._parser = extend(date._parser, extension.parser, false, res);

        for (var key in extender) {
            if (!date[key]) {
                date[key] = extender[key];
            }
        }
    };

    /**
     * Importing plugins
     * @param {Function|string} plugin - A plugin installer or plugin name
     * @returns {void}
     */
    date.plugin = function (plugin) {
        var install = typeof plugin === 'function' ? plugin : date.plugin[plugin];

        if (install) {
            date.extend(plugins[install(proto, localized_proto)] || {});
        }
    };

    var date$1 = date;

    return date$1;

}));
