import React from "react";

interface IProps {
    dngHtml:string
    onClick?:(e?:React.MouseEvent)=>void
}

interface IState {
    hover:boolean
}

export class SelectTag<P extends IProps, S extends IState> extends React.Component<P,S>
{
    constructor(props:P)
    {
        super(props);
        this.state={
            hover:false
        } as S;
    }
    onMouseEnter=()=>{
        this.setState({hover:true});
    }
    onMouseLeave=()=>{
        this.setState({hover:false})
    }
    render(){
        const {hover}=this.state;
        return (
            <div className={"SelectValue SelectValueItem selected"+(hover?" hover":"")} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
                <span className="SelectLabel" dangerouslySetInnerHTML={{ __html:this.props.dngHtml }} /><a className="triggerUnSelect" onClick={this.props.onClick}>&#10006;</a>
            </div>
        )
    }
}