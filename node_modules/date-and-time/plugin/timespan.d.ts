declare module '../date-and-time' {
    export type TimeSpanResult = {
        /** Returns the result value in milliseconds. */
        toMilliseconds: (formatString: string) => string,
        /** Returns the result value in seconds. */
        toSeconds: (formatString: string) => string,
        /** Returns the result value in minutes. */
        toMinutes: (formatString: string) => string,
        /** Returns the result value in hours. */
        toHours: (formatString: string) => string,
        /** Returns the result value in days. */
        toDays: (formatString: string) => string
    };

    /**
     * Subtracting two dates (date1 - date2)
     * @param date1 - A Date object
     * @param date2 - A Date object
     * @returns The result object of subtracting date2 from date1
     */
    export function timeSpan(date1: Date, date2: Date): TimeSpanResult;
}

export default function (date: unknown, localized_date?: unknown): string;
