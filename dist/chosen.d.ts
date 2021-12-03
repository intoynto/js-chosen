interface ILoos {
    [key: string]: any;
}
export declare type IChosenOptions = Array<ILoos>;
export declare type IChosenArrayNode = Array<React.ReactNode>;
export declare type IChosenAnyValue = string | number | null | undefined;
export declare type IChosenHTMLString = string;
export declare type IChosenAnyInputEvent = React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>;
interface IChosenInternalOptionItem extends ILoos {
    id: string;
    label: IChosenHTMLString;
    labelOrigin: string;
}
export declare type IChosenInternalOptions = Array<IChosenInternalOptionItem>;
export declare type IEvent = React.ChangeEvent<HTMLInputElement>;
export interface IChosenProps extends ILoos {
    id?: string;
    name: string;
    fieldid: string;
    fieldname: string;
    options: IChosenOptions;
    multiple?: boolean;
    value?: string | number | any;
    loading?: boolean;
    onChange?: (e: IEvent) => void;
    onFieldName?: (e: ILoos | any) => string | any;
}
interface IChosenState extends ILoos {
    force: number;
}
export declare class Chosen<P extends IChosenProps, S extends IChosenState> extends React.Component<P, S> {
    constructor(props: P);
    protected keyUpDownIndex: number;
    protected listenerBodyClick: any | null;
    protected multiple: boolean;
    protected focused: boolean;
    protected inputKey_: string | undefined;
    protected options: IChosenInternalOptions;
    protected selectOptions: IChosenArrayNode;
    protected selectValues: IChosenArrayNode;
    protected dropDowns: IChosenArrayNode;
    protected values: Array<string>;
    protected valueRef: Array<string>;
    protected value: IChosenAnyValue;
    protected search: IChosenAnyValue;
    protected nodeSelect: RefObject<HTMLSelectElement> | any | null | undefined;
    protected nodeInput: RefObject<HTMLInputElement> | any | null | undefined;
    protected nodeDropDown: RefObject<HTMLElement> | any | null | undefined;
    protected nodeSADD: RefObject<HTMLElement> | any | null | undefined;
    protected node: RefObject<HTMLElement> | any | null | undefined;
    protected getInitialState(): S;
    nextUpdate(callback?: any): void;
    checkListeners(): void;
    protected prepOptions(): void;
    protected prepPropsValues(): false | undefined;
    protected prepValues(): void;
    protected prepSelectValues(): void;
    protected prepDropDown(checkFocused?: boolean): void;
    UNSAFE_componentWillMount(): void;
    protected callPropsChange(): false | undefined;
    protected onInputChange(e: IChosenAnyInputEvent): void;
    protected onInputFocus(): false | undefined;
    protected onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>): false | undefined;
    onUnSelect(id: string | number | null | undefined, toFocus?: boolean): false | undefined;
    onSelect(id: string | number | null | undefined, exitFocus?: boolean, applySearch?: boolean): false | undefined;
    onBodyClick(e: globalThis.MouseEvent): void;
    onBodyKeyDown(e: globalThis.KeyboardEvent): boolean;
    onToggleDropDown(): false | undefined;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prev: P): false | undefined;
    render(): JSX.Element;
}
export { Chosen };

export { Chosen };
export type { IChosenProps };

interface IProps {
    dngHtml: string;
    onClick?: (e?: React.MouseEvent) => void;
}
interface IState {
    hover: boolean;
}
export declare class SelectTag<P extends IProps, S extends IState> extends React.Component<P, S> {
    constructor(props: P);
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    render(): JSX.Element;
}

export declare function isEqual(value: any, other: any): boolean;
export declare function isObjectEmpty(obj: object): boolean;
export declare function checkCompare(textContext: string | null | undefined, stringSearch: string | null | undefined): boolean;
export declare function stripHtmlTags(str: string | number | null | undefined): string;
export { isEqual, checkCompare, stripHtmlTags, isObjectEmpty };
