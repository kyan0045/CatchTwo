# Plugins

This library is oriented towards minimalism, so it may seem to some developers to be lacking in features. The plugin is the most realistic solution to such dissatisfaction. By importing plugins, you can extend the functionality of this library, primarily the formatter and parser.

*The formatter is used in `format()`, etc., the parser is used in `parse()`, `preparse()`, `isValid()`, etc.*

## Usage

- ES Modules:

```javascript
import date from 'date-and-time';
// Import the plugin named "foobar".
import foobar from 'date-and-time/plugin/foobar';

// Apply the "foobar" to the library.
date.plugin(foobar);
```

- CommonJS:

```javascript
const date = require('date-and-time');
// Import the plugin named "foobar".
const foobar = require('date-and-time/plugin/foobar');

// Apply the "foobar" to the library.
date.plugin(foobar);
```

- ES Modules for the browser:

```html
<script type="module">
import date from '/path/to/date-and-time.es.min.js';
// Import the plugin named "foobar".
import foobar from '/path/to/date-and-time/plugin/foobar.es.js';

// Apply the "foobar" to the library.
date.plugin(foobar);
</script>
```

- Older browser:

```html
<script src="/path/to/date-and-time.min.js"></script>
<!-- Import the plugin named "foobar". -->
<script src="/path/to/plugin/foobar.js"></script>

<script>
// Apply the "foobar" to the library.
date.plugin('foobar');
</script>
```

### Note

- If you want to use ES Modules in Node.js without a transpiler, you need to add `"type": "module"` in your `package.json` or change your file extension from `.js` to `.mjs`.

## Plugin List

- [day-of-week](#day-of-week)
  - It adds *"dummy"* tokens for `day of week` to the parser.

- [meridiem](#meridiem)
  - It adds various notations for `AM PM`.

- [microsecond](#microsecond)
  - It adds tokens for microsecond to the parser.

- [ordinal](#ordinal)
  - It adds ordinal notation of date to the formatter.

- [timespan](#timespan)
  - It adds `timeSpan()` function that calculates the difference of two dates to the library.

- [timezone](#timezone)
  - It adds `formatTZ()`, `parseTZ()` and `transformTZ()` that support `IANA time zone names` to the library.

- [two-digit-year](#two-digit-year)
  - It adds two-digit year notation to the parser.

---

### day-of-week

It adds tokens for `day of week` to the parser. Although `day of week` is not significant information for the parser to identify a date, these tokens are sometimes useful. For example, when a string to be parsed contains a day of week, and you just want to skip it.

**formatter:**

There is no change.

**parser:**

| token | meaning    | acceptable examples |
|:------|:-----------|:--------------------|
| dddd  | long       | Friday, Sunday      |
| ddd   | short      | Fri, Sun            |
| dd    | very short | Fr, Su              |

```javascript
const date = require('date-and-time');
// Import "day-of-week" plugin as a named "day_of_week".
const day_of_week = require('date-and-time/plugin/day-of-week');

// Apply the "day_of_week" plugin to the library.
date.plugin(day_of_week);

// You can write like this.
date.parse('Thursday, March 05, 2020', 'dddd, MMMM, D YYYY');
// You can also write like this, but it is not versatile because length of day of week are variant.
date.parse('Thursday, March 05, 2020', '        , MMMM, D YYYY');
date.parse('Friday, March 06, 2020', '      , MMMM, D YYYY');
```

---

### meridiem

It adds various notations for AM PM.

**formatter:**

| token | meaning                 | output examples |
|:------|:------------------------|:----------------|
| AA    | uppercase with ellipsis | A.M., P.M.      |
| a     | lowercase               | am, pm          |
| aa    | lowercase with ellipsis | a.m., p.m.      |

**parser:**

| token | meaning                 | acceptable examples |
|:------|:------------------------|:--------------------|
| AA    | uppercase with ellipsis | A.M., P.M.          |
| a     | lowercase               | am, pm              |
| aa    | lowercase with ellipsis | a.m., p.m.          |

```javascript
const date = require('date-and-time');
// Import "meridiem" plugin.
const meridiem = require('date-and-time/plugin/meridiem');

// Apply "medidiem" plugin to the library.
date.plugin(meridiem);

// This is default behavior of the formatter.
date.format(new Date(), 'hh:mm A');     // => '12:34 PM'

// These are added tokens to the formatter.
date.format(new Date(), 'hh:mm AA');    // => '12:34 P.M.'
date.format(new Date(), 'hh:mm a');     // => '12:34 pm'
date.format(new Date(), 'hh:mm aa');    // => '12:34 p.m.'

// This is default behavior of the parser.
date.parse('12:34 PM', 'hh:mm A');      // => Jan 1 1970 12:34:00

// These are added tokens to the parser.
date.parse('12:34 P.M.', 'hh:mm AA');   // => Jan 1 1970 12:34:00
date.parse('12:34 pm', 'hh:mm a');      // => Jan 1 1970 12:34:00
date.parse('12:34 p.m.', 'hh:mm aa');   // => Jan 1 1970 12:34:00
```

This plugin has a **breaking change**. In previous versions, the `A` token for the parser could parse various notations for AM PM, but in the new version, it can only parse `AM` and `PM`. For other notations, a dedicated token is now provided for each.

---

### microsecond

It adds tokens for microsecond to the parser. If a time string to be parsed contains microsecond, these tokens are useful. In JS, however, it is not supported microsecond accuracy, a parsed value is rounded to millisecond accuracy.

**formatter:**

There is no change.

**parser:**

| token  | meaning         | acceptable examples |
|:-------|:----------------|:--------------------|
| SSSSSS | high accuracy   | 753123, 022113      |
| SSSSS  | middle accuracy | 75312, 02211        |
| SSSS   | low accuracy    | 7531, 0221          |

```javascript
const date = require('date-and-time');
// Import "microsecond" plugin.
const microsecond = require('date-and-time/plugin/microsecond');

// Apply "microsecond" plugin to the library.
date.plugin(microsecond);

// A date object in JavaScript supports `millisecond` (ms) like this:
date.parse('12:34:56.123', 'HH:mm:ss.SSS');

// 4 or more digits number sometimes seen is not `millisecond`, probably `microsecond` (μs):
date.parse('12:34:56.123456', 'HH:mm:ss.SSSSSS');

// 123456µs will be rounded to 123ms.
```

---

### ordinal

It adds `DDD` token that output ordinal notation of date to the formatter.

**formatter:**

| token | meaning                  | output examples     |
|:------|:-------------------------|:--------------------|
| DDD   | ordinal notation of date | 1st, 2nd, 3rd, 31th |

**parser:**

There is no change.

```javascript
const date = require('date-and-time');
// Import "ordinal" plugin.
const ordinal = require('date-and-time/plugin/ordinal');

// Apply "ordinal" plugin to the library.
date.plugin(ordinal);

// These are default behavior of the formatter.
date.format(new Date(), 'MMM D YYYY');    // => Jan 1 2019
date.format(new Date(), 'MMM DD YYYY');   // => Jan 01 2019

// `DDD` token outputs ordinal number of date.
date.format(new Date(), 'MMM DDD YYYY');  // => Jan 1st 2019
```

---

### timespan

It adds `timeSpan()` function that calculates the difference of two dates to the library. This function is similar to `subtract()`, the difference is that it can format the calculation results.

#### timeSpan(date1, date2)

- @param {**Date**} date1 - A Date object
- @param {**Date**} date2 - A Date object
- @returns {**Object**} The result object of subtracting date2 from date1

```javascript
const date = require('date-and-time');
// Import "timespan" plugin.
const timespan = require('date-and-time/plugin/timespan');

// Apply "timespan" plugin to the library.
date.plugin(timespan);

const now = new Date(2020, 2, 5, 1, 2, 3, 4);
const new_years_day = new Date(2020, 0, 1);

date.timeSpan(now, new_years_day).toDays('D HH:mm:ss.SSS'); // => '64 01:02:03.004'
date.timeSpan(now, new_years_day).toHours('H [hours] m [minutes] s [seconds]');  // => '1537 hours 2 minutes 3 seconds'
date.timeSpan(now, new_years_day).toMinutes('mmmmmmmmmm [minutes]');  // => '0000092222 minutes'
```

Like `subtract()`, `timeSpan()` returns an object with functions like this:

| function       | description             |
|:---------------|:------------------------|
| toDays         | Outputs in dates        |
| toHours        | Outputs in hours        |
| toMinutes      | Outputs in minutes      |
| toSeconds      | Outputs in seconds      |
| toMilliseconds | Outputs in milliseconds |

In these functions can be available some tokens to format the calculation result. Here are the tokens and their meanings:

| function       | available tokens |
|:---------------|:-----------------|
| toDays         | D, H, m, s, S    |
| toHours        | H, m, s, S       |
| toMinutes      | m, s, S          |
| toSeconds      | s, S             |
| toMilliseconds | S                |

| token | meaning     |
|:------|:------------|
| D     | date        |
| H     | 24-hour     |
| m     | minute      |
| s     | second      |
| S     | millisecond |

---

### timezone

It adds `formatTZ()`, `parseTZ()` and `transformTZ()` that support `IANA time zone names` (`America/Los_Angeles`, `Asia/Tokyo`, and so on) to the library.

#### formatTZ(dateObj, arg[, timeZone])

- @param {**Date**} dateObj - A Date object
- @param {**string|Array.\<string\>**} arg - A format string or its compiled object
- @param {**string**} [timeZone] - Output as this time zone
- @returns {**string**} A formatted string

`formatTZ()` is upward compatible with `format()`. Tokens available for `arg` are the same as those for `format()`. If `timeZone` is omitted, this function assumes `timeZone` to be a local time zone and outputs a string. This means that the result is the same as when `format()` is used.

#### parseTZ(dateString, arg[, timeZone])

- @param {**string**} dateString - A date and time string
- @param {**string|Array.\<string\>**} arg - A format string or its compiled object
- @param {**string**} [timeZone] - Input as this time zone
- @returns {**Date**} A Date object

`parseTZ()` is upward compatible with `parse()`. Tokens available for `arg` are the same as those for `parse()`. `timeZone` in this function is used as supplemental information. if `dateString` contains a time zone offset value (i.e. -0800, +0900), `timeZone` is not be used. If `dateString` doesn't contain a time zone offset value and `timeZone` is omitted, this function assumes `timeZone` to be a local time zone. This means that the result is the same as when `parse()` is used.

#### transformTZ(dateString, arg1, arg2[, timeZone])

- @param {**string**} dateString - A date and time string
- @param {**string|Array.\<string\>**} arg1 - A format string before transformation or its compiled object
- @param {**string|Array.\<string\>**} arg2 - A format string after transformation or its compiled object
- @param {**string**} [timeZone] - Output as this time zone
- @returns {**string**} A formatted string

`transformTZ()` is upward compatible with `transform()`. `dateString` must itself contain a time zone offset value (i.e. -0800, +0900), otherwise this function assumes it is a local time zone. Tokens available for `arg1` are the same as those for `parse()`, also tokens available for `arg2` are the same as those for `format()`. `timeZone` is a `IANA time zone names`, which is required to output a new formatted string. If it is omitted, this function assumes `timeZone` to be a local time zone. This means that the result is the same as when `transform()` is used.

```javascript
const date = require('date-and-time');
// Import "timezone" plugin.
const timezone = require('date-and-time/plugin/timezone');

// Apply "timezone" plugin to the library.
date.plugin(timezone);

const d1 = new Date(Date.UTC(2021, 2, 14, 9, 59, 59, 999)); // 2021-03-14T09:59:59.999Z
date.formatTZ(d1, 'MMMM DD YYYY H:mm:ss.SSS [UTC]Z', 'America/Los_Angeles'); // March 14 2021 1:59:59.999 UTC-0800

const d2 = new Date(Date.UTC(2021, 2, 14, 10, 0, 0, 0));  // 2021-03-14T10:00:00.000Z
date.formatTZ(d2, 'MMMM DD YYYY H:mm:ss.SSS [UTC]Z', 'America/Los_Angeles'); // March 14 2021 3:00:00.000 UTC-0700

// Parses the date string assuming that the time zone is "Pacific/Honolulu" (UTC-1000).
date.parseTZ('Sep 25 2021 4:00:00', 'MMM D YYYY H:mm:ss', 'Pacific/Honolulu');  // 2021-09-25T14:00:00.000Z

// Parses the date string assuming that the time zone is "Europe/London" (UTC+0100).
date.parseTZ('Sep 25 2021 4:00:00', 'MMM D YYYY H:mm:ss', 'Europe/London');  // 2021-09-25T03:00:00.000Z

// Transforms the date string from EST (Eastern Standard Time) to PDT (Pacific Daylight Time).
date.transformTZ('2021-11-07T03:59:59 UTC-0500', 'YYYY-MM-DD[T]HH:mm:ss [UTC]Z', 'MMMM D YYYY H:mm:ss UTC[Z]', 'America/Los_Angeles'); // November 7 2021 1:59:59 UTC-0700

// Transforms the date string from PDT(Pacific Daylight Time) to JST (Japan Standard Time).
date.transformTZ('2021-03-14T03:00:00 UTC-0700', 'YYYY-MM-DD[T]HH:mm:ss [UTC]Z', 'MMMM D YYYY H:mm:ss UTC[Z]', 'Asia/Tokyo');   // March 14 2021 19:00:00 UTC+0900
```

#### Caveats

- This plugin uses the [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) object to parse `IANA time zone names`. Note that if you use this plugin in older browsers, this may **NOT** be supported there. At least it does not work  in IE.
- If you don't need to use `IANA time zone names`, you should not use this plugin for performance reasons. Recommended to use `format()` and `parse()`.

#### Start of DST (Daylight Saving Time)

For example, in the US, when local standard time is about to reach Sunday, 14 March 2021, `02:00:00` clocks are turned `forward` 1 hour to Sunday, 14 March 2021, `03:00:00` local daylight time instead. Thus there is no `02:00:00` to `02:59:59` on 14 March 2021. In such edge cases, `parseTZ()` will parse like this:

```javascript
date.parseTZ('Mar 14 2021 1:59:59', 'MMM D YYYY H:mm:ss', 'America/Los_Angeles'); // => 2021-03-14T09:59:59Z
date.parseTZ('Mar 14 2021 2:00:00', 'MMM D YYYY H:mm:ss', 'America/Los_Angeles'); // => NaN
date.parseTZ('Mar 14 2021 2:59:59', 'MMM D YYYY H:mm:ss', 'America/Los_Angeles'); // => NaN
date.parseTZ('Mar 14 2021 3:00:00', 'MMM D YYYY H:mm:ss', 'America/Los_Angeles'); // => 2021-03-14T10:00:00Z
```

#### End of DST

Also, when local daylight time is about to reach Sunday, 7 November 2021, `02:00:00` clocks are turned `backward` 1 hour to Sunday, 7 November 2021, `01:00:00` local standard time instead. Thus `01:00:00` to `01:59:59` on November 7 2021 is repeated twice. Since there are two possible times here, `parseTZ()` assumes that the time is the former (DST) in order to make the result unique:

```javascript
// This time is DST or PST? The parseTZ() always assumes that it is DST.
date.parseTZ('Nov 7 2021 1:59:59', 'MMM D YYYY H:mm:ss', 'America/Los_Angeles');  // => 2021-11-07T08:59:59Z
// This time is already PST.
date.parseTZ('Nov 7 2021 2:00:00', 'MMM D YYYY H:mm:ss', 'America/Los_Angeles');  // => 2021-11-07T10:00:00Z
```

In the first example above, if you want `parseTZ()` to parse the time as PST, you need to pass a date string containing the time zone offset value. In this case, it is better to use `parse()` instead:

```javascript
date.parse('Nov 7 2021 1:59:59 -0800', 'MMM D YYYY H:mm:ss Z'); // => 2021-11-07T09:59:59Z
```

---

### two-digit-year

It adds `YY` token to the parser. This token will convert the year 69 or earlier to 2000s, the year 70 or later to 1900s. In brief:

| examples                | result |
|:------------------------|:-------|
| 00, 01, 02, ..., 68, 69 | 2000s  |
| 70, 71, 72, ..., 98, 99 | 1900s  |

**formatter:**

There is no change.

**parser:**

| token | meaning        | acceptable examples |
|:------|:---------------|:--------------------|
| YY    | two-digit year | 90, 00, 08, 19      |

```javascript
const date = require('date-and-time');
// Import "two-digit-year" plugin as a named "two_digit_year".
const two_digit_year = require('date-and-time/plugin/two-digit-year');

// This is the default behavior of the parser.
date.parse('Dec 25 69', 'MMM D YY');      // => Invalid Date

// Apply the "two_digit_year" plugin to the library.
date.plugin(two_digit_year);

// The `YY` token convert the year 69 or earlier to 2000s, the year 70 or later to 1900s.
date.parse('Dec 25 69', 'MMM D YY');      // => Dec 25 2069
date.parse('Dec 25 70', 'MMM D YY');      // => Dec 25 1970
```

This plugin has a **breaking change**. In previous versions, this plugin overrode the default behavior of the `Y` token, but this has been obsolete.
