import React from "react";
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
export {};
