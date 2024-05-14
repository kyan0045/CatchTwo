/**
 * Formatting date and time objects (Date -> String)
 * @param dateObj - A Date object
 * @param formatString - A format string
 * @param [utc] - Output as UTC
 * @returns A formatted string
 */
export function format(dateObj: Date, formatString: string, utc?: boolean): string;

/**
 * Formatting date and time objects (Date -> String)
 * @param dateObj - A Date object
 * @param compiledObj - A compiled object of format string
 * @param [utc] - Output as UTC
 * @returns A formatted string
 */
export function format(dateObj: Date, compiledObj: string[], utc?: boolean): string;

/**
 * Parsing date and time strings (String -> Date)
 * @param dateString - A date and time string
 * @param formatString - A format string
 * @param [utc] - Input as UTC
 * @returns A Date object
 */
export function parse(dateString: string, formatString: string, utc?: boolean): Date;

/**
 * Parsing date and time strings (String -> Date)
 * @param dateString - A date and time string
 * @param compiledObj - A compiled object of format string
 * @param [utc] - Input as UTC
 * @returns A Date object
 */
export function parse(dateString: string, compiledObj: string[], utc?: boolean): Date;

/**
 * Compiling format strings
 * @param formatString - A format string
 * @returns A compiled object
 */
export function compile(formatString: string): string[];

/** Preparse result object */
export type PreparseResult = {
    /** Year */
    Y: number;
    /** Month */
    M: number;
    /** Day */
    D: number;
    /** 24-hour */
    H: number;
    /** Meridiem */
    A: number;
    /** 12-hour */
    h: number;
    /** Minute */
    m: number;
    /** Second */
    s: number;
    /** Millisecond */
    S: number;
    /** Timezone offset */
    Z: number;
    /** Pointer offset */
    _index: number;
    /** Length of the date string */
    _length: number;
    /** Token matching count */
    _match: number;
};

/**
 * Pre-parsing date and time strings
 * @param dateString - A date and time string
 * @param formatString - A format string
 * @returns A pre-parsed result object
 */
export function preparse(dateString: string, formatString: string): PreparseResult;

/**
 * Pre-parsing date and time strings
 * @param dateString - A date and time string
 * @param compiledObj - A compiled object of format string
 * @returns A pre-parsed result object
 */
export function preparse(dateString: string, compiledObj: string[]): PreparseResult;

/**
 * Date and time string validation
 * @param dateString - A date and time string
 * @param formatString - A format string
 * @returns Whether the date and time string is a valid date and time
 */
export function isValid(dateString: string, formatString: string): boolean;

/**
 * Date and time string validation
 * @param dateString - A date and time string
 * @param compiledObj - A compiled object of format string
 * @returns Whether the date and time string is a valid date and time
 */
export function isValid(dateString: string, compiledObj: string[]): boolean;

/**
 * Date and time string validation
 * @param preparseResult - A pre-parsed result object
 * @returns Whether the date and time string is a valid date and time
 */
export function isValid(preparseResult: PreparseResult): boolean;

/**
 * Format transformation of date and time strings (String -> String)
 * @param dateString - A date and time string
 * @param formatString1 - A format string before transformation
 * @param formatString2 - A format string after transformation
 * @param [utc] - Output as UTC
 * @returns A formatted string
 */
export function transform(dateString: string, formatString1: string, formatString2: string, utc?: boolean): string;

/**
 * Format transformation of date and time strings (String -> String)
 * @param dateString - A date and time string
 * @param formatString - A format string before transformation
 * @param compiledObj - A compiled object of format string after transformation
 * @param [utc] - Output as UTC
 * @returns A formatted string
 */
export function transform(dateString: string, formatString: string, compiledObj: string[], utc?: boolean): string;

/**
 * Format transformation of date and time strings (String -> String)
 * @param dateString - A date and time string
 * @param compiledObj - A compiled object of format string before transformation
 * @param formatString - A format string after transformation
 * @param [utc] - Output as UTC
 * @returns A formatted string
 */
export function transform(dateString: string, compiledObj: string[], formatString: string, utc?: boolean): string;

/**
 * Format transformation of date and time strings (String -> String)
 * @param dateString - A date and time string
 * @param compiledObj1 - A compiled object of format string before transformation
 * @param compiledObj2 - A compiled object of format string after transformation
 * @param [utc] - Output as UTC
 * @returns A formatted string
 */
export function transform(dateString: string, compiledObj1: string[], compiledObj2: string[], utc?: boolean): string;

/**
 * Adding years
 * @param dateObj - A Date object
 * @param years - Number of years to add
 * @param [utc] - Calculates as UTC
 * @returns The Date object after adding the value
 */
export function addYears(dateObj: Date, years: number, utc?: boolean): Date;

/**
 * Adding months
 * @param dateObj - A Date object
 * @param months - Number of months to add
 * @param [utc] - Calculates as UTC
 * @returns The Date object after adding the value
 */
export function addMonths(dateObj: Date, months: number, utc?: boolean): Date;

/**
 * Adding days
 * @param dateObj - A Date object
 * @param days - Number of days to add
 * @param [utc] - Calculates as UTC
 * @returns The Date object after adding the value
 */
export function addDays(dateObj: Date, days: number, utc?: boolean): Date;

/**
 * Adding hours
 * @param dateObj - A Date object
 * @param hours - Number of hours to add
 * @param [utc] - Calculates as UTC
 * @returns The Date object after adding the value
 */
export function addHours(dateObj: Date, hours: number, utc?: boolean): Date;

/**
 * Adding minutes
 * @param dateObj - A Date object
 * @param minutes - Number of minutes to add
 * @param [utc] - Calculates as UTC
 * @returns The Date object after adding the value
 */
export function addMinutes(dateObj: Date, minutes: number, utc?: boolean): Date;

/**
 * Adding seconds
 * @param dateObj - A Date object
 * @param seconds - Number of seconds to add
 * @param [utc] - Calculates as UTC
 * @returns The Date object after adding the value
 */
export function addSeconds(dateObj: Date, seconds: number, utc?: boolean): Date;

/**
 * Adding milliseconds
 * @param dateObj - A Date object
 * @param milliseconds - Number of milliseconds to add
 * @param [utc] - Calculates as UTC
 * @returns The Date object after adding the value
 */
export function addMilliseconds(dateObj: Date, milliseconds: number, utc?: boolean): Date;

/** Subtraction result object */
export type SubtractResult = {
    /** Returns the result value in milliseconds. */
    toMilliseconds: () => number;
    /** Returns the result value in seconds. */
    toSeconds: () => number;
    /** Returns the result value in minutes. This value might be a real number. */
    toMinutes: () => number;
    /** Returns the result value in hours. This value might be a real number. */
    toHours: () => number;
    /** Returns the result value in days. This value might be a real number. */
    toDays: () => number;
};

/**
 * Subtracting two dates (date1 - date2)
 * @param date1 - A Date object
 * @param date2 - A Date object
 * @returns The result object of subtracting date2 from date1
 */
export function subtract(date1: Date, date2: Date): SubtractResult;

/**
 * Whether a year is a leap year
 * @param y - A year to check
 * @returns Whether the year is a leap year
 */
export function isLeapYear(y: number): boolean;

/**
 * Comparison of two dates
 * @param date1 - A Date object
 * @param date2 - A Date object
 * @returns Whether the two dates are the same day (time is ignored)
 */
export function isSameDay(date1: Date, date2: Date): boolean;

/** Locale installer */
export type Locale = (proto: unknown) => string;

/**
 * Changing locales
 * @param [locale] - A locale installer
 * @returns The current language code
 */
export function locale(locale?: Locale): string;

/**
 * Changing locales
 * @param [locale] - A language code
 * @returns The current language code
 */
export function locale(locale?: string): string;

export type Resources = {
    [key: string]: string[] | string[][]
};

export type Formatter = {
};

export type Parser = {
};

export type Extender = {
    [key: string]: (...args: any) => any
};

/** Extension object */
export type Extension = {
    res?: Resources,
    formatter?: Formatter,
    parser?: Parser,
    extender?: Extender
};

/**
 * Functional extension
 * @param extension - An extension object
 */
export function extend(extension: Extension): void;

/**  Plugin installer */
export type Plugin = (proto: unknown, localized_proto?: unknown) => string;

/**
 * Importing plugins
 * @param plugin - A plugin installer
 */
export function plugin(plugin: Plugin): void;

/**
 * Importing plugins
 * @param plugin - A plugin name
 */
export function plugin(plugin: string): void;
