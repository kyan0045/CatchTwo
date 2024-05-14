import terser from '@rollup/plugin-terser';

export default [
    {
        input: 'src/index.js',
        output: [
            { file: 'esm/date-and-time.es.js', format: 'es' },
            { file: 'esm/date-and-time.mjs', format: 'es' },
            { file: 'date-and-time.js', format: 'umd', name: 'date', esModule: false }
        ]
    },
    {
        input: 'src/locale/ar.js',
        output: [
            { file: 'esm/locale/ar.es.js', format: 'es' },
            { file: 'esm/locale/ar.mjs', format: 'es' },
            { file: 'locale/ar.js', format: 'umd', name: 'date.locale.ar', esModule: false }
        ]
    },
    {
        input: 'src/locale/az.js',
        output: [
            { file: 'esm/locale/az.es.js', format: 'es' },
            { file: 'esm/locale/az.mjs', format: 'es' },
            { file: 'locale/az.js', format: 'umd', name: 'date.locale.az', esModule: false }
        ]
    },
    {
        input: 'src/locale/bn.js',
        output: [
            { file: 'esm/locale/bn.es.js', format: 'es' },
            { file: 'esm/locale/bn.mjs', format: 'es' },
            { file: 'locale/bn.js', format: 'umd', name: 'date.locale.bn', esModule: false }
        ]
    },
    {
        input: 'src/locale/cs.js',
        output: [
            { file: 'esm/locale/cs.es.js', format: 'es' },
            { file: 'esm/locale/cs.mjs', format: 'es' },
            { file: 'locale/cs.js', format: 'umd', name: 'date.locale.cs', esModule: false }
        ]
    },
    {
        input: 'src/locale/de.js',
        output: [
            { file: 'esm/locale/de.es.js', format: 'es' },
            { file: 'esm/locale/de.mjs', format: 'es' },
            { file: 'locale/de.js', format: 'umd', name: 'date.locale.de', esModule: false }
        ]
    },
    {
        input: 'src/locale/dk.js',
        output: [
            { file: 'esm/locale/dk.es.js', format: 'es' },
            { file: 'esm/locale/dk.mjs', format: 'es' },
            { file: 'locale/dk.js', format: 'umd', name: 'date.locale.dk', esModule: false }
        ]
    },
    {
        input: 'src/locale/el.js',
        output: [
            { file: 'esm/locale/el.es.js', format: 'es' },
            { file: 'esm/locale/el.mjs', format: 'es' },
            { file: 'locale/el.js', format: 'umd', name: 'date.locale.el', esModule: false }
        ]
    },
    {
        input: 'src/locale/en.js',
        output: [
            { file: 'esm/locale/en.es.js', format: 'es' },
            { file: 'esm/locale/en.mjs', format: 'es' },
            { file: 'locale/en.js', format: 'umd', name: 'date.locale.en', esModule: false }
        ]
    },
    {
        input: 'src/locale/es.js',
        output: [
            { file: 'esm/locale/es.es.js', format: 'es' },
            { file: 'esm/locale/es.mjs', format: 'es' },
            { file: 'locale/es.js', format: 'umd', name: 'date.locale.es', esModule: false }
        ]
    },
    {
        input: 'src/locale/fa.js',
        output: [
            { file: 'esm/locale/fa.es.js', format: 'es' },
            { file: 'esm/locale/fa.mjs', format: 'es' },
            { file: 'locale/fa.js', format: 'umd', name: 'date.locale.fa', esModule: false }
        ]
    },
    {
        input: 'src/locale/fr.js',
        output: [
            { file: 'esm/locale/fr.es.js', format: 'es' },
            { file: 'esm/locale/fr.mjs', format: 'es' },
            { file: 'locale/fr.js', format: 'umd', name: 'date.locale.fr', esModule: false }
        ]
    },
    {
        input: 'src/locale/hi.js',
        output: [
            { file: 'esm/locale/hi.es.js', format: 'es' },
            { file: 'esm/locale/hi.mjs', format: 'es' },
            { file: 'locale/hi.js', format: 'umd', name: 'date.locale.hi', esModule: false }
        ]
    },
    {
        input: 'src/locale/hu.js',
        output: [
            { file: 'esm/locale/hu.es.js', format: 'es' },
            { file: 'esm/locale/hu.mjs', format: 'es' },
            { file: 'locale/hu.js', format: 'umd', name: 'date.locale.hu', esModule: false }
        ]
    },
    {
        input: 'src/locale/id.js',
        output: [
            { file: 'esm/locale/id.es.js', format: 'es' },
            { file: 'esm/locale/id.mjs', format: 'es' },
            { file: 'locale/id.js', format: 'umd', name: 'date.locale.id', esModule: false }
        ]
    },
    {
        input: 'src/locale/it.js',
        output: [
            { file: 'esm/locale/it.es.js', format: 'es' },
            { file: 'esm/locale/it.mjs', format: 'es' },
            { file: 'locale/it.js', format: 'umd', name: 'date.locale.it', esModule: false }
        ]
    },
    {
        input: 'src/locale/ja.js',
        output: [
            { file: 'esm/locale/ja.es.js', format: 'es' },
            { file: 'esm/locale/ja.mjs', format: 'es' },
            { file: 'locale/ja.js', format: 'umd', name: 'date.locale.ja', esModule: false }
        ]
    },
    {
        input: 'src/locale/jv.js',
        output: [
            { file: 'esm/locale/jv.es.js', format: 'es' },
            { file: 'esm/locale/jv.mjs', format: 'es' },
            { file: 'locale/jv.js', format: 'umd', name: 'date.locale.jv', esModule: false }
        ]
    },
    {
        input: 'src/locale/ko.js',
        output: [
            { file: 'esm/locale/ko.es.js', format: 'es' },
            { file: 'esm/locale/ko.mjs', format: 'es' },
            { file: 'locale/ko.js', format: 'umd', name: 'date.locale.ko', esModule: false }
        ]
    },
    {
        input: 'src/locale/my.js',
        output: [
            { file: 'esm/locale/my.es.js', format: 'es' },
            { file: 'esm/locale/my.mjs', format: 'es' },
            { file: 'locale/my.js', format: 'umd', name: 'date.locale.my', esModule: false }
        ]
    },
    {
        input: 'src/locale/nl.js',
        output: [
            { file: 'esm/locale/nl.es.js', format: 'es' },
            { file: 'esm/locale/nl.mjs', format: 'es' },
            { file: 'locale/nl.js', format: 'umd', name: 'date.locale.nl', esModule: false }
        ]
    },
    {
        input: 'src/locale/pa-in.js',
        output: [
            { file: 'esm/locale/pa-in.es.js', format: 'es' },
            { file: 'esm/locale/pa-in.mjs', format: 'es' },
            { file: 'locale/pa-in.js', format: 'umd', name: 'date.locale.pa-in', esModule: false }
        ]
    },
    {
        input: 'src/locale/pl.js',
        output: [
            { file: 'esm/locale/pl.es.js', format: 'es' },
            { file: 'esm/locale/pl.mjs', format: 'es' },
            { file: 'locale/pl.js', format: 'umd', name: 'date.locale.pl', esModule: false }
        ]
    },
    {
        input: 'src/locale/pt.js',
        output: [
            { file: 'esm/locale/pt.es.js', format: 'es' },
            { file: 'esm/locale/pt.mjs', format: 'es' },
            { file: 'locale/pt.js', format: 'umd', name: 'date.locale.pt', esModule: false }
        ]
    },
    {
        input: 'src/locale/ro.js',
        output: [
            { file: 'esm/locale/ro.es.js', format: 'es' },
            { file: 'esm/locale/ro.mjs', format: 'es' },
            { file: 'locale/ro.js', format: 'umd', name: 'date.locale.ro', esModule: false }
        ]
    },
    {
        input: 'src/locale/ru.js',
        output: [
            { file: 'esm/locale/ru.es.js', format: 'es' },
            { file: 'esm/locale/ru.mjs', format: 'es' },
            { file: 'locale/ru.js', format: 'umd', name: 'date.locale.ru', esModule: false }
        ]
    },
    {
        input: 'src/locale/rw.js',
        output: [
            { file: 'esm/locale/rw.es.js', format: 'es' },
            { file: 'esm/locale/rw.mjs', format: 'es' },
            { file: 'locale/rw.js', format: 'umd', name: 'date.locale.rw', esModule: false }
        ]
    },
    {
        input: 'src/locale/sr.js',
        output: [
            { file: 'esm/locale/sr.es.js', format: 'es' },
            { file: 'esm/locale/sr.mjs', format: 'es' },
            { file: 'locale/sr.js', format: 'umd', name: 'date.locale.sr', esModule: false }
        ]
    },
    {
        input: 'src/locale/sv.js',
        output: [
            { file: 'esm/locale/sv.es.js', format: 'es' },
            { file: 'esm/locale/sv.mjs', format: 'es' },
            { file: 'locale/sv.js', format: 'umd', name: 'date.locale.sv', esModule: false }
        ]
    },
    {
        input: 'src/locale/th.js',
        output: [
            { file: 'esm/locale/th.es.js', format: 'es' },
            { file: 'esm/locale/th.mjs', format: 'es' },
            { file: 'locale/th.js', format: 'umd', name: 'date.locale.th', esModule: false }
        ]
    },
    {
        input: 'src/locale/tr.js',
        output: [
            { file: 'esm/locale/tr.es.js', format: 'es' },
            { file: 'esm/locale/tr.mjs', format: 'es' },
            { file: 'locale/tr.js', format: 'umd', name: 'date.locale.tr', esModule: false }
        ]
    },
    {
        input: 'src/locale/uk.js',
        output: [
            { file: 'esm/locale/uk.es.js', format: 'es' },
            { file: 'esm/locale/uk.mjs', format: 'es' },
            { file: 'locale/uk.js', format: 'umd', name: 'date.locale.uk', esModule: false }
        ]
    },
    {
        input: 'src/locale/uz.js',
        output: [
            { file: 'esm/locale/uz.es.js', format: 'es' },
            { file: 'esm/locale/uz.mjs', format: 'es' },
            { file: 'locale/uz.js', format: 'umd', name: 'date.locale.uz', esModule: false }
        ]
    },
    {
        input: 'src/locale/vi.js',
        output: [
            { file: 'esm/locale/vi.es.js', format: 'es' },
            { file: 'esm/locale/vi.mjs', format: 'es' },
            { file: 'locale/vi.js', format: 'umd', name: 'date.locale.vi', esModule: false }
        ]
    },
    {
        input: 'src/locale/zh-cn.js',
        output: [
            { file: 'esm/locale/zh-cn.es.js', format: 'es' },
            { file: 'esm/locale/zh-cn.mjs', format: 'es' },
            { file: 'locale/zh-cn.js', format: 'umd', name: 'date.locale.zh-cn', esModule: false }
        ]
    },
    {
        input: 'src/locale/zh-tw.js',
        output: [
            { file: 'esm/locale/zh-tw.es.js', format: 'es' },
            { file: 'esm/locale/zh-tw.mjs', format: 'es' },
            { file: 'locale/zh-tw.js', format: 'umd', name: 'date.locale.zh-tw', esModule: false }
        ]
    },
    {
        input: 'src/plugin/day-of-week.js',
        output: [
            { file: 'esm/plugin/day-of-week.es.js', format: 'es' },
            { file: 'esm/plugin/day-of-week.mjs', format: 'es' },
            { file: 'plugin/day-of-week.js', format: 'umd', name: 'date.plugin.day-of-week', esModule: false }
        ]
    },
    {
        input: 'src/plugin/meridiem.js',
        output: [
            { file: 'esm/plugin/meridiem.es.js', format: 'es' },
            { file: 'esm/plugin/meridiem.mjs', format: 'es' },
            { file: 'plugin/meridiem.js', format: 'umd', name: 'date.plugin.meridiem', esModule: false }
        ]
    },
    {
        input: 'src/plugin/microsecond.js',
        output: [
            { file: 'esm/plugin/microsecond.es.js', format: 'es' },
            { file: 'esm/plugin/microsecond.mjs', format: 'es' },
            { file: 'plugin/microsecond.js', format: 'umd', name: 'date.plugin.microsecond', esModule: false }
        ]
    },
    {
        input: 'src/plugin/ordinal.js',
        output: [
            { file: 'esm/plugin/ordinal.es.js', format: 'es' },
            { file: 'esm/plugin/ordinal.mjs', format: 'es' },
            { file: 'plugin/ordinal.js', format: 'umd', name: 'date.plugin.ordinal', esModule: false }
        ]
    },
    {
        input: 'src/plugin/timespan.js',
        output: [
            { file: 'esm/plugin/timespan.es.js', format: 'es' },
            { file: 'esm/plugin/timespan.mjs', format: 'es' },
            { file: 'plugin/timespan.js', format: 'umd', name: 'date.plugin.timespan', esModule: false }
        ]
    },
    {
        input: 'src/plugin/timezone.js',
        output: [
            { file: 'esm/plugin/timezone.es.js', format: 'es' },
            { file: 'esm/plugin/timezone.mjs', format: 'es' },
            { file: 'plugin/timezone.js', format: 'umd', name: 'date.plugin.timezone', esModule: false }
        ]
    },
    {
        input: 'src/plugin/two-digit-year.js',
        output: [
            { file: 'esm/plugin/two-digit-year.es.js', format: 'es' },
            { file: 'esm/plugin/two-digit-year.mjs', format: 'es' },
            { file: 'plugin/two-digit-year.js', format: 'umd', name: 'date.plugin.two-digit-year', esModule: false }
        ]
    },
    {
        input: 'src/index.js',
        output: [
            { file: 'esm/date-and-time.es.min.js', format: 'es' },
            { file: 'date-and-time.min.js', format: 'umd', name: 'date', esModule: false }
        ],
        plugins: [terser()]
    }
];
