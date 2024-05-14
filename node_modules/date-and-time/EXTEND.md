# Extension

The easiest way to extend the default formatter and parser is to use plugins, but if the existing plugins do not meet your requirements, you can extend them yourself.

## Token

Tokens in this library have the following rules:

- All of the characters must be the same alphabet (`A-Z, a-z`).

```javascript
'E'           // Good
'EE'          // Good
'EEEEEEEEEE'  // Good, but why so long!?
'EES'         // Not good
'???'         // Not good
```

- It is case sensitive.

```javascript
'eee'         // Good
'Eee'         // Not good
```

- Only tokens consisting of the following alphabets can be added to the parser.

```javascript
'Y'           // Year
'M'           // Month
'D'           // Day
'H'           // 24-hour
'A'           // AM PM
'h'           // 12-hour
's'           // Second
'S'           // Millisecond
'Z'           // Timezone offset
```

- Existing tokens cannot be overwritten.

```javascript
'YYY'         // This is OK because the same token does not exists.
'SSS'         // This cannot be added because the exact same token exists.
'EEE'         // This is OK for the formatter, but cannot be added to the parser.
```

## Examples

### Example 1

Add `E` token to the formatter. This new token will output "decade" like this:

```javascript
const d1 =  new Date(2020, 0, 1);
const d2 =  new Date(2019, 0, 1);

date.format(d1, '[The year] YYYY [is] E[s].');  // => "The year 2020 is 2020s."
date.format(d2, '[The year] YYYY [is] E[s].');  // => "The year 2019 is 2010s."
```

Source code example is here:

```javascript
const date = require('date-and-time');

date.extend({
  formatter: {
    E: function (d) {
      return (d.getFullYear() / 10 | 0) * 10;
    }
  }
});
```

### Example 2

Add `MMMMM` token to the parser. This token ignores case:

```javascript
date.parse('Dec 25 2019', 'MMMMM DD YYYY'); // => December 25, 2019
date.parse('dec 25 2019', 'MMMMM DD YYYY'); // => December 25, 2019
date.parse('DEC 25 2019', 'MMMMM DD YYYY'); // => December 25, 2019
```

Source code example is here:

```javascript
const date = require('date-and-time');

date.extend({
  parser: {
    MMMMM: function (str) {
      const mmm = this.res.MMM.map(m => m.toLowerCase());
      const result = this.find(mmm, str.toLowerCase());
      result.value++;
      return result;
    }
  }
});
```

Extending the parser may be a bit difficult. Refer to the library source code to grasp the default behavior.

## Caveats

Note that switching locales or applying plugins after extending the library will be cleared all extensions. In such cases, you need to extend the library again.