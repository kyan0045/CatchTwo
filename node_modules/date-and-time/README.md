# date-and-time

[![Circle CI](https://circleci.com/gh/knowledgecode/date-and-time.svg?style=shield)](https://circleci.com/gh/knowledgecode/date-and-time)

This JS library is just a collection of functions for manipulating date and time. It's small, simple, and easy to learn.

## Why

Nowadays, JS modules have become larger, more complex, and dependent on many other modules. It is important to strive for simplicity and smallness, especially for modules that are at the bottom of the dependency chain, such as those that handle date and time.

## Features

- Minimalist. Approximately 2k. (minified and gzipped)
- Extensible. Plugin system support.
- Multi language support.
- Universal / Isomorphic. Works anywhere.
- TypeScript support.
- Older browser support. Even works on IE6. :)

## Install

```shell
npm i date-and-time
```

## Recent Changes

- 3.1.1
  - Fixed an issue where `format()` could output incorrect UTC times in locales with daylight savings time.
  - Refactored `formatTZ()` of `timezone` plugin.

- 3.1.0
  - Improved accuracy of `parseTZ()` in `timezone` plugin.
  - Organized some test modules.

- 3.0.3
  - Fixed TypeScript types exports in `package.json`.

## Usage

- ES Modules:

```javascript
import date from 'date-and-time';
```

- CommonJS:

```javascript
const date = require('date-and-time');
```

- ES Modules for the browser:

```html
<script type="module">
import date from '/path/to/date-and-time.es.min.js';
</script>
```

- Older browser:

```html
<script src="/path/to/date-and-time.min.js">
// You will be able to access the global variable `date`.
</script>
```

### Note

- If you want to use ES Modules in Node.js without the transpiler, you need to add `"type": "module"` in your `package.json` or change your file extension from `.js` to `.mjs`.

## API

- [format](#formatdateobj-arg-utc)
  - Formatting date and time objects (Date -> String)

- [parse](#parsedatestring-arg-utc)
  - Parsing date and time strings (String -> Date)

- [compile](#compileformatstring)
  - Compiling format strings

- [preparse](#preparsedatestring-arg)
  - Pre-parsing date and time strings

- [isValid](#isvalidarg1-arg2)
  - Date and time string validation

- [transform](#transformdatestring-arg1-arg2-utc)
  - Format transformation of date and time strings (String -> String)

- [addYears](#addyearsdateobj-years-utc)
  - Adding years

- [addMonths](#addmonthsdateobj-months-utc)
  - Adding months

- [addDays](#adddaysdateobj-days-utc)
  - Adding days

- [addHours](#addhoursdateobj-hours-utc)
  - Adding hours

- [addMinutes](#addminutesdateobj-minutes-utc)
  - Adding minutes

- [addSeconds](#addsecondsdateobj-seconds-utc)
  - Adding seconds

- [addMilliseconds](#addmillisecondsdateobj-milliseconds-utc)
  - Adding milliseconds

- [subtract](#subtractdate1-date2)
  - Subtracting two dates (date1 - date2)

- [isLeapYear](#isleapyeary)
  - Whether a year is a leap year

- [isSameDay](#issamedaydate1-date2)
  - Comparison of two dates

- [locale](#localelocale)
  - Changing locales

- [extend](#extendextension)
  - Functional extension

- [plugin](#pluginplugin)
  - Importing plugins

### format(dateObj, arg[, utc])

- @param {**Date**} dateObj - A Date object
- @param {**string|Array.\<string\>**} arg - A format string or its compiled object
- @param {**boolean**} [utc] - Output as UTC
- @returns {**string**} A formatted string

```javascript
const now = new Date();
date.format(now, 'YYYY/MM/DD HH:mm:ss');    // => '2015/01/02 23:14:05'
date.format(now, 'ddd, MMM DD YYYY');       // => 'Fri, Jan 02 2015'
date.format(now, 'hh:mm A [GMT]Z');         // => '11:14 PM GMT-0800'
date.format(now, 'hh:mm A [GMT]Z', true);   // => '07:14 AM GMT+0000'

const pattern = date.compile('ddd, MMM DD YYYY');
date.format(now, pattern);                  // => 'Fri, Jan 02 2015'
```

Available tokens and their meanings are as follows:

| token | meaning                              | examples of output |
|:------|:-------------------------------------|:-------------------|
| YYYY  | four-digit year                      | 0999, 2015         |
| YY    | two-digit year                       | 99, 01, 15         |
| Y     | four-digit year without zero-padding | 2, 44, 888, 2015   |
| MMMM  | month name (long)                    | January, December  |
| MMM   | month name (short)                   | Jan, Dec           |
| MM    | month with zero-padding              | 01, 12             |
| M     | month                                | 1, 12              |
| DD    | date with zero-padding               | 02, 31             |
| D     | date                                 | 2, 31              |
| dddd  | day of week (long)                   | Friday, Sunday     |
| ddd   | day of week (short)                  | Fri, Sun           |
| dd    | day of week (very short)             | Fr, Su             |
| HH    | 24-hour with zero-padding            | 23, 08             |
| H     | 24-hour                              | 23, 8              |
| hh    | 12-hour with zero-padding            | 11, 08             |
| h     | 12-hour                              | 11, 8              |
| A     | meridiem (uppercase)                 | AM, PM             |
| mm    | minute with zero-padding             | 14, 07             |
| m     | minute                               | 14, 7              |
| ss    | second with zero-padding             | 05, 10             |
| s     | second                               | 5, 10              |
| SSS   | millisecond (high accuracy)          | 753, 022           |
| SS    | millisecond (middle accuracy)        | 75, 02             |
| S     | millisecond (low accuracy)           | 7, 0               |
| Z     | time zone offset value               | +0100, -0800       |
| ZZ    | time zone offset value with colon    | +01:00, -08:00     |

You can also use the following tokens by importing plugins. See [PLUGINS.md](./PLUGINS.md) for details.

| token | meaning                              | examples of output |
|:------|:-------------------------------------|:-------------------|
| DDD   | ordinal notation of date             | 1st, 2nd, 3rd      |
| AA    | meridiem (uppercase with ellipsis)   | A.M., P.M.         |
| a     | meridiem (lowercase)                 | am, pm             |
| aa    | meridiem (lowercase with ellipsis)   | a.m., p.m.         |

#### Note 1. Comments

String in parenthese `[...]` in the `formatString` will be ignored as comments:

```javascript
date.format(new Date(), 'DD-[MM]-YYYY');    // => '02-MM-2015'
date.format(new Date(), '[DD-[MM]-YYYY]');  // => 'DD-[MM]-YYYY'
```

#### Note 2. Output as UTC

This function usually outputs a local date and time string. Set to true the `utc` option (the 3rd parameter) if you would like to get a UTC date and time string.

```javascript
date.format(new Date(), 'hh:mm A [GMT]Z');          // => '11:14 PM GMT-0800'
date.format(new Date(), 'hh:mm A [GMT]Z', true);    // => '07:14 AM GMT+0000'
```

#### Note 3. More Tokens

You can also define your own tokens. See [EXTEND.md](./EXTEND.md) for details.

### parse(dateString, arg[, utc])

- @param {**string**} dateString - A date and time string
- @param {**string|Array.\<string\>**} arg - A format string or its compiled object
- @param {**boolean**} [utc] - Input as UTC
- @returns {**Date**} A Date object

```javascript
date.parse('2015/01/02 23:14:05', 'YYYY/MM/DD HH:mm:ss');   // => Jan 2 2015 23:14:05 GMT-0800
date.parse('02-01-2015', 'DD-MM-YYYY');                     // => Jan 2 2015 00:00:00 GMT-0800
date.parse('11:14:05 PM', 'hh:mm:ss A');                    // => Jan 1 1970 23:14:05 GMT-0800
date.parse('11:14:05 PM', 'hh:mm:ss A', true);              // => Jan 1 1970 23:14:05 GMT+0000 (Jan 1 1970 15:14:05 GMT-0800)
date.parse('23:14:05 GMT+0900', 'HH:mm:ss [GMT]Z');         // => Jan 1 1970 23:14:05 GMT+0900 (Jan 1 1970 06:14:05 GMT-0800)
date.parse('Jam 1 2017', 'MMM D YYYY');                     // => Invalid Date
date.parse('Feb 29 2017', 'MMM D YYYY');                    // => Invalid Date
```

Available tokens and their meanings are as follows:

| token  | meaning                              | examples of acceptable form |
|:-------|:-------------------------------------|:----------------------------|
| YYYY   | four-digit year                      | 0999, 2015                  |
| Y      | four-digit year without zero-padding | 2, 44, 88, 2015             |
| MMMM   | month name (long)                    | January, December           |
| MMM    | month name (short)                   | Jan, Dec                    |
| MM     | month with zero-padding              | 01, 12                      |
| M      | month                                | 1, 12                       |
| DD     | date with zero-padding               | 02, 31                      |
| D      | date                                 | 2, 31                       |
| HH     | 24-hour with zero-padding            | 23, 08                      |
| H      | 24-hour                              | 23, 8                       |
| hh     | 12-hour with zero-padding            | 11, 08                      |
| h      | 12-hour                              | 11, 8                       |
| A      | meridiem (uppercase)                 | AM, PM                      |
| mm     | minute with zero-padding             | 14, 07                      |
| m      | minute                               | 14, 7                       |
| ss     | second with zero-padding             | 05, 10                      |
| s      | second                               | 5, 10                       |
| SSS    | millisecond (high accuracy)          | 753, 022                    |
| SS     | millisecond (middle accuracy)        | 75, 02                      |
| S      | millisecond (low accuracy)           | 7, 0                        |
| Z      | time zone offset value               | +0100, -0800                |
| ZZ     | time zone offset value with colon    | +01:00, -08:00              |

You can also use the following tokens by importing plugins. See [PLUGINS.md](./PLUGINS.md) for details.

| token  | meaning                              | examples of acceptable form |
|:-------|:-------------------------------------|:----------------------------|
| YY     | two-digit year                       | 90, 00, 08, 19              |
| AA     | meridiem (uppercase with ellipsis)   | A.M., P.M.                  |
| a      | meridiem (lowercase)                 | am, pm                      |
| aa     | meridiem (lowercase with ellipsis)   | a.m., p.m.                  |
| dddd   | day of week (long)                   | Friday, Sunday              |
| ddd    | day of week (short)                  | Fri, Sun                    |
| dd     | day of week (very short)             | Fr, Su                      |
| SSSSSS | microsecond (high accuracy)          | 123456, 000001              |
| SSSSS  | microsecond (middle accuracy)        | 12345, 00001                |
| SSSS   | microsecond (low accuracy)           | 1234, 0001                  |

#### Note 1. Invalid Date

If the function fails to parse, it will return `Invalid Date`. Notice that the `Invalid Date` is a Date object, not `NaN` or `null`. You can tell whether the Date object is invalid as follows:

```javascript
const today = date.parse('Jam 1 2017', 'MMM D YYYY');

if (isNaN(today.getTime())) {
    // Failure
}
```

#### Note 2. Input as UTC

This function assumes the `dateString` is a local datea and time unless it contains a time zone offset value. Set to true the `utc` option (the 3rd parameter) if it is a UTC date and time.

```javascript
date.parse('11:14:05 PM', 'hh:mm:ss A');          // => Jan 1 1970 23:14:05 GMT-0800
date.parse('11:14:05 PM', 'hh:mm:ss A', true);    // => Jan 1 1970 23:14:05 GMT+0000 (Jan 1 1970 15:14:05 GMT-0800)
```

#### Note 3. Default Date Time

Default date is `January 1, 1970`, time is `00:00:00.000`. Values not passed will be complemented with them:

```javascript
date.parse('11:14:05 PM', 'hh:mm:ss A');    // => Jan 1 1970 23:14:05 GMT-0800
date.parse('Feb 2000', 'MMM YYYY');         // => Feb 1 2000 00:00:00 GMT-0800
```

#### Note 4. Max Date / Min Date

Parsable maximum date is `December 31, 9999`, minimum date is `January 1, 0001`.

```javascript
date.parse('Dec 31 9999', 'MMM D YYYY');    // => Dec 31 9999 00:00:00 GMT-0800
date.parse('Dec 31 10000', 'MMM D YYYY');   // => Invalid Date

date.parse('Jan 1 0001', 'MMM D YYYY');     // => Jan 1 0001 00:00:00 GMT-0800
date.parse('Jan 1 0000', 'MMM D YYYY');     // => Invalid Date
```

#### Note 5. 12-hour notation and Meridiem

If use `hh` or `h` (12-hour) token, use together `A` (meridiem) token to get the right value.

```javascript
date.parse('11:14:05', 'hh:mm:ss');         // => Jan 1 1970 11:14:05 GMT-0800
date.parse('11:14:05 PM', 'hh:mm:ss A');    // => Jan 1 1970 23:14:05 GMT-0800
```

#### Note 6. Token disablement

Use square brackets `[]` if a datea and time string includes some token characters. Tokens inside square brackets in the `formatString` will be interpreted as normal characters:

```javascript
date.parse('12 hours 34 minutes', 'HH hours mm minutes');       // => Invalid Date
date.parse('12 hours 34 minutes', 'HH [hours] mm [minutes]');   // => Jan 1 1970 12:34:00 GMT-0800
```

#### Note 7. Wildcard

A white space works as a wildcard token. This token is not interpreted into anything. This means it can be ignored a specific variable string. For example, when you would like to ignore a time part from a date string, you can write as follows:

```javascript
// This will be an error.
date.parse('2015/01/02 11:14:05', 'YYYY/MM/DD');            // => Invalid Date
// Adjust the length of the format string by appending white spaces of the same length as a part to ignore to the end of it.
date.parse('2015/01/02 11:14:05', 'YYYY/MM/DD         ');   // => Jan 2 2015 00:00:00 GMT-0800
```

#### Note 8. Ellipsis

The parser supports `...` (ellipsis) token. The above example can be also written like this:

```javascript
date.parse('2015/01/02 11:14:05', 'YYYY/MM/DD...');   // => Jan 2 2015 00:00:00 GMT-0800
```

### compile(formatString)

- @param {**string**} formatString - A format string
- @returns {**Array.\<string\>**} A compiled object

If you are going to execute the `format()`, the `parse()` or the `isValid()` so many times with one string format, recommended to precompile and reuse it for performance.

```javascript
  const pattern = date.compile('MMM D YYYY h:m:s A');

  date.parse('Mar 22 2019 2:54:21 PM', pattern);
  date.parse('Jul 27 2019 4:15:24 AM', pattern);
  date.parse('Dec 25 2019 3:51:11 AM', pattern);

  date.format(new Date(), pattern); // => Mar 16 2020 6:24:56 PM
```

### preparse(dateString, arg)

- @param {**string**} dateString - A date and time string
- @param {**string|Array.\<string\>**} arg - A format string or its compiled object
- @returns {**Object**} A pre-parsed result object

This function takes exactly the same parameters with the `parse()`, but returns a date structure as follows unlike that:

```javascript
date.preparse('Fri Jan 2015 02 23:14:05 GMT-0800', '    MMM YYYY DD HH:mm:ss [GMT]Z');

{
    Y: 2015,        // Year
    M: 1,           // Month
    D: 2,           // Day
    H: 23,          // 24-hour
    A: 0,           // Meridiem
    h: 0,           // 12-hour
    m: 14,          // Minute
    s: 5,           // Second
    S: 0,           // Millisecond
    Z: 480,         // Timsezone offset
    _index: 33,     // Pointer offset
    _length: 33,    // Length of the date string
    _match: 7       // Token matching count
}
```

This date structure provides a parsing result. You will be able to tell from it how the date string was parsed(, or why the parsing was failed).

### isValid(arg1[, arg2])

- @param {**Object|string**} arg1 - A pre-parsed result object or a date and time string
- @param {**string|Array.\<string\>**} [arg2] - A format string or its compiled object
- @returns {**boolean**} Whether the date and time string is a valid date and time

This function takes either exactly the same parameters with the `parse()` or a date structure which the `preparse()` returns, evaluates the validity of them.

```javascript
date.isValid('2015/01/02 23:14:05', 'YYYY/MM/DD HH:mm:ss'); // => true
date.isValid('29-02-2015', 'DD-MM-YYYY');                   // => false
```

```javascript
const result = date.preparse('2015/01/02 23:14:05', 'YYYY/MM/DD HH:mm:ss');
date.isValid(result);   // => true
```

### transform(dateString, arg1, arg2[, utc])

- @param {**string**} dateString - A date and time string
- @param {**string|Array.\<string\>**} arg1 - A format string or its compiled object before transformation
- @param {**string|Array.\<string\>**} arg2 - A format string or its compiled object after transformation
- @param {**boolean**} [utc] - Output as UTC
- @returns {**string**} A formatted string

This function transforms the format of a date string. The 2nd parameter, `arg1`, is the format string of it. Available token list is equal to the `parse()`'s. The 3rd parameter, `arg2`, is the transformed format string. Available token list is equal to the `format()`'s.

```javascript
// 3/8/2020 => 8/3/2020
date.transform('3/8/2020', 'D/M/YYYY', 'M/D/YYYY');

// 13:05 => 01:05 PM
date.transform('13:05', 'HH:mm', 'hh:mm A');
```

### addYears(dateObj, years[, utc])

- @param {**Date**} dateObj - A Date object
- @param {**number**} years - Number of years to add
- @param {**boolean**} [utc] - Calculates as UTC `Added in: v3.0.0`
- @returns {**Date**} The Date object after adding the value

Adds years to the date object.

```javascript
const now = new Date();
const next_year = date.addYears(now, 1);
```

Exceptional behavior of the calculation for the last day of the month:

```javascript
const now = new Date(Date.UTC(2020, 1, 29));                // => Feb 29 2020
const next_year = date.addYears(now, 1, true);              // => Feb 28 2021
const next_next_year = date.addYears(next_year, 1, true);   // => Feb 28 2022
```

### addMonths(dateObj, months[, utc])

- @param {**Date**} dateObj - A Date object
- @param {**number**} months - Number of months to add
- @param {**boolean**} [utc] - Calculates as UTC `Added in: v3.0.0`
- @returns {**Date**} The Date object after adding the value

Adds months to the date object.

```javascript
const now = new Date();
const next_month = date.addMonths(now, 1);
```

Exceptional behavior of the calculation for the last day of the month:

```javascript
const now = new Date(Date.UTC(2023, 0, 31));                    // => Jan 31 2023
const next_month = date.addMonths(now, 1, true);                // => Feb 28 2023
const next_next_month = date.addMonths(next_month, 1, true);    // => Mar 28 2023
```

### addDays(dateObj, days[, utc])

- @param {**Date**} dateObj - A Date object
- @param {**number**} days - Number of days to add
- @param {**boolean**} [utc] - Calculates as UTC `Added in: v3.0.0`
- @returns {**Date**} The Date object after adding the value

```javascript
const now = new Date();
const yesterday = date.addDays(now, -1);
```

### addHours(dateObj, hours[, utc])

- @param {**Date**} dateObj - A Date object
- @param {**number**} hours - Number of hours to add
- @param {**boolean**} [utc] - Calculates as UTC `Added in: v3.0.0`
- @returns {**Date**} The Date object after adding the value

```javascript
const now = new Date();
const an_hour_ago = date.addHours(now, -1);
```

### addMinutes(dateObj, minutes[, utc])

- @param {**Date**} dateObj - A Date object
- @param {**number**} minutes - Number of minutes to add
- @param {**boolean**} [utc] - Calculates as UTC `Added in: v3.0.0`
- @returns {**Date**} The Date object after adding the value

```javascript
const now = new Date();
const two_minutes_later = date.addMinutes(now, 2);
```

### addSeconds(dateObj, seconds[, utc])

- @param {**Date**} dateObj - A Date object
- @param {**number**} seconds - Number of seconds to add
- @param {**boolean**} [utc] - Calculates as UTC `Added in: v3.0.0`
- @returns {**Date**} The Date object after adding the value

```javascript
const now = new Date();
const three_seconds_ago = date.addSeconds(now, -3);
```

### addMilliseconds(dateObj, milliseconds[, utc])

- @param {**Date**} dateObj - A Date object
- @param {**number**} milliseconds - Number of milliseconds to add
- @param {**boolean**} [utc] - Calculates as UTC `Added in: v3.0.0`
- @returns {**Date**} The Date object after adding the value

```javascript
const now = new Date();
const a_millisecond_later = date.addMilliseconds(now, 1);
```

### subtract(date1, date2)

- @param {**Date**} date1 - A Date object
- @param {**Date**} date2 - A Date object
- @returns {**Object**} The result object of subtracting date2 from date1

```javascript
const today = new Date(2015, 0, 2);
const yesterday = new Date(2015, 0, 1);

date.subtract(today, yesterday).toDays();           // => 1 = today - yesterday
date.subtract(today, yesterday).toHours();          // => 24
date.subtract(today, yesterday).toMinutes();        // => 1440
date.subtract(today, yesterday).toSeconds();        // => 86400
date.subtract(today, yesterday).toMilliseconds();   // => 86400000
```

### isLeapYear(y)

- @param {**number**} y - A year to check
- @returns {**boolean**} Whether the year is a leap year

```javascript
date.isLeapYear(2015);  // => false
date.isLeapYear(2012);  // => true
```

### isSameDay(date1, date2)

- @param {**Date**} date1 - A Date object
- @param {**Date**} date2 - A Date object
- @returns {**boolean**} Whether the two dates are the same day (time is ignored)

```javascript
const date1 = new Date(2017, 0, 2, 0);          // Jan 2 2017 00:00:00
const date2 = new Date(2017, 0, 2, 23, 59);     // Jan 2 2017 23:59:00
const date3 = new Date(2017, 0, 1, 23, 59);     // Jan 1 2017 23:59:00
date.isSameDay(date1, date2);   // => true
date.isSameDay(date1, date3);   // => false
```

### locale([locale])

- @param {**Function|string**} [locale] - A locale installer or language code
- @returns {**string**} The current language code

It returns the current language code if called without any parameters.

```javascript
date.locale();  // => "en"
```

To switch to any other language, call it with a locale installer or a language code.

```javascript
import es from 'date-and-time/locale/es';

date.locale(es);  // Switch to Spanish
```

See [LOCALE.md](./LOCALE.md) for details.

### extend(extension)

- @param {**Object**} extension - An extension object
- @returns {**void**}

It extends this library. See [EXTEND.md](./EXTEND.md) for details.

### plugin(plugin)

- @param {**Function|string**} plugin - A plugin installer or plugin name
- @returns {**void**}

Plugin is a named extension object. By installing predefined plugins, you can easily extend this library. See [PLUGINS.md](./PLUGINS.md) for details.

## Browser Support

Chrome, Firefox, Safari, Edge, and Internet Explorer 6+.

## License

MIT
