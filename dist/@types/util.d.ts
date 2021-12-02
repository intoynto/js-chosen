declare function isEqual(value: any, other: any): boolean;
declare function isObjectEmpty(obj: object): boolean;
declare function checkCompare(textContext: string | null | undefined, stringSearch: string | null | undefined): boolean;
declare function stripHtmlTags(str: string | number | null | undefined): string;
export { isEqual, checkCompare, stripHtmlTags, isObjectEmpty };
