# Locale

By default, `format()` outputs month, day of week, and meridiem (AM / PM) in English, and functions such as `parse()` assume that a passed date time string is in English. Here it describes how to use other languages in these functions.

## Usage

- ES Modules:

```javascript
import date from 'date-and-time';
import es from 'date-and-time/locale/es';

date.locale(es);    // Spanish
date.format(new Date(), 'dddd D MMMM'); // => 'lunes 11 enero
```

- CommonJS:

```javascript
const date = require('date-and-time');
const fr = require('date-and-time/locale/fr');

date.locale(fr);    // French
date.format(new Date(), 'dddd D MMMM'); // => 'lundi 11 janvier'
```

- ES Modules for the browser:

```html
<script type="module">
import date from '/path/to/date-and-time.es.min.js';
import it from '/path/to/date-and-time/locale/it.es.js';

date.locale(it);    // Italian
date.format(new Date(), 'dddd D MMMM'); // => 'Lunedì 11 gennaio'
</script>
```

- Older browser:

```html
<script src="/path/to/date-and-time.min.js"></script>
<script src="/path/to/locale/zh-cn.js"></script>

<script>
date.locale('zh-cn');   // Chinese
date.format(new Date(), 'MMMD日dddd');  // => '1月11日星期一'
</script>
```

### NOTE

- If you want to use ES Modules in Node.js without a transpiler, you need to add `"type": "module"` in your `package.json` or change your file extension from `.js` to `.mjs`.
- The locale will be actually switched after executing the `locale()`.
- You can also change the locale back to English by importing `en` locale:

```javascript
import en from 'date-and-time/locale/en';

date.locale(en);
```

## Supported locale List

At this time, it supports the following locales:

```text
Arabic (ar)
Azerbaijani (az)
Bengali (bn)
Burmese (my)
Chinese (zh-cn)
Chinese (zh-tw)
Czech (cs)
Danish (dk)
Dutch (nl)
English (en)
French (fr)
German (de)
Greek (el)
Hindi (hi)
Hungarian (hu)
Indonesian (id)
Italian (it)
Japanese (ja)
Javanese (jv)
Kinyarwanda (rw)
Korean (ko)
Persian (fa)
Polish (pl)
Portuguese (pt)
Punjabi (pa-in)
Romanian (ro)
Russian (ru)
Serbian (sr)
Spanish (es)
Swedish (sv)
Thai (th)
Turkish (tr)
Ukrainian (uk)
Uzbek (uz)
Vietnamese (vi)
```
