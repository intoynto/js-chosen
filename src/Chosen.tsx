/**
 * 01 Juni 2020 
 * - Tambah data di event change 
 */

import React,{RefObject} from "react";
import { SelectTag } from "./selectTag";
import {isEqual,checkCompare,stripHtmlTags, isObjectEmpty} from "./util";

/*
declare module 'react' 
{
    interface HTMLAttributes<T> extends React.AriaAttributes,React.DOMAttributes<T>{
        index?:string
    }
}
*/

function toUtf8String(value:string){
    let val='';
    value=value?value:'';
    for(let i=0; i<value.length; i++)
    {
        const ichar = value.charCodeAt(i);
        if(ichar<=127){
            val+=value.charAt(i);
        }
    }
    return val;
}

function toStr(value:string|number|null|undefined,usingUtf8:boolean=true){
    if(value===null || value===undefined) return '';

    value=typeof value==="string" || typeof value==="number"?value.toString():"";
    value=usingUtf8?toUtf8String(value):value.toString();
    return value;
}


interface ILoos {
    [key: string]: any,
}

type IChosenOptions=Array<ILoos>;
type IChosenArrayNode=Array<React.ReactNode>;
type IChosenAnyValue=string | number | null | undefined;
type IChosenArrayString=Array<string>;
type IChosenHTMLString=string;
type IChosenAnyInputEvent=React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLTextAreaElement>;

interface IChosenInternalOptionItem extends ILoos {
    id:string
    label:IChosenHTMLString
    labelOrigin:string
}

type IChosenInternalOptions=Array<IChosenInternalOptionItem>;

let inputKey_=0;

function isEqualStringify(value1:any,value2:any,dsInfo=false){
    let val1=value1===null || value1===undefined?"":typeof value1==="object" && Array.isArray(value1)?JSON.stringify(value1):"";
    let val2=value2===null || value2===undefined?"":typeof value1==="object" && Array.isArray(value2)?JSON.stringify(value2):"";
    const sama=val1===val2;
    //if(!sama && dsInfo){ console.log("A:",val1,"B:",val2);}
    return sama;
}

function toSingleString(value:any):string{
    if(typeof value === "string" || typeof value === "number"){
        return value.toString().trim();
    }
    
    if(Array.isArray(value) && value.length>0){
        return toSingleString(value[0]);
    }

    return "";
}

function toArrayString(options:any):IChosenArrayString{
    let s:IChosenArrayString=[];
    if(typeof options==="string" || typeof options==="number"){
        if(options.toString().trim().length>0) s.push(options.toString().trim());
    }
    else
    if(Array.isArray(options) && options.length>0){
        for(let i=0; i<options.length; i++){
            let val=toSingleString(options[i]);
            if(val.length>0){
                s.push(val);
            }
        }
    }
    return s;
}


type IEvent=React.ChangeEvent<HTMLInputElement>;

export interface IChosenProps extends ILoos {
    id?:string
    name:string
    fieldid:string
    fieldname:string
    options:IChosenOptions
    multiple?:boolean
    value?:string | number | any
    loading?:boolean
    onChange?:(e:IEvent)=>void 
    onFieldName?:(e:ILoos | any)=>string | any
}

interface IChosenState extends ILoos {
    force:number
}

class Chosen<P extends IChosenProps, S extends IChosenState> extends React.Component<P,S>
{
    constructor(props:P){
        super(props);

        this.state=this.getInitialState();

        this.prepOptions=this.prepOptions.bind(this); 
        this.prepPropsValues=this.prepPropsValues.bind(this);
        this.prepSelectValues=this.prepSelectValues.bind(this); 
        this.prepValues=this.prepValues.bind(this);
        this.prepDropDown=this.prepDropDown.bind(this);

        this.onInputChange=this.onInputChange.bind(this);
        this.onInputFocus=this.onInputFocus.bind(this);
        this.onInputKeyDown=this.onInputKeyDown.bind(this);        
        this.onSelect=this.onSelect.bind(this);
        this.onUnSelect=this.onUnSelect.bind(this);
        this.onToggleDropDown=this.onToggleDropDown.bind(this);
        this.onBodyClick=this.onBodyClick.bind(this);
        this.onBodyKeyDown=this.onBodyKeyDown.bind(this);
        this.callPropsChange=this.callPropsChange.bind(this);
        this.keyUpDownIndex=-1;
        this.listenerBodyClick=null;
        this.multiple=false;
        this.focused=false;
        this.inputKey_=undefined;
        this.options=[];
        this.selectOptions=[];
        this.selectValues=[];
        this.dropDowns=[];
        this.values=[];
        this.valueRef=[];
        this.value="";
        this.search="";
    }

    protected keyUpDownIndex:number;
    protected listenerBodyClick:any | null;
    protected multiple:boolean;
    protected focused:boolean;
    protected inputKey_:string | undefined;
    protected options:IChosenInternalOptions;
    protected selectOptions:IChosenArrayNode;
    protected selectValues:IChosenArrayNode;
    protected dropDowns:IChosenArrayNode;
    protected values:Array<string>;
    protected valueRef:Array<string>;
    protected value:IChosenAnyValue;
    protected search:IChosenAnyValue;
    protected nodeSelect:RefObject<HTMLSelectElement> | any | null | undefined;
    protected nodeInput:RefObject<HTMLInputElement> | any | null | undefined;
    protected nodeDropDown:RefObject<HTMLElement> | any | null | undefined;
    protected nodeSADD:RefObject<HTMLElement> | any | null | undefined;
    protected node:RefObject<HTMLElement> | any | null | undefined;

    protected getInitialState():S
    {
        return {force:0} as S;
    }

    nextUpdate(callback?:any){
        let force=this.state.force;
        force++;
        if(force>1000) force=0;
        this.setState({force:force},callback && typeof callback==="function"?callback:undefined);
    }

    checkListeners(){
        if(this.focused){
            if(!this.listenerBodyClick){
                this.listenerBodyClick=true;
                window.addEventListener("click",this.onBodyClick);
                window.addEventListener("keydown",this.onBodyKeyDown);
            }
        }
        else {
            if(this.listenerBodyClick){
                this.listenerBodyClick=null;
                window.removeEventListener("click",this.onBodyClick);
                window.removeEventListener("keydown", this.onBodyKeyDown);
            }
            if(!this.multiple && this.nodeSelect){
                this.nodeSelect.value=this.value;                
            }
        }      
    }

    protected prepOptions(){    
        //console.log("call prepOptions")    
        this.multiple=this.props.multiple===true?true:this.props.multiple===false?false:false;       
        
        this.options=[];  
        this.valueRef=[];              

        if(Array.isArray(this.props.options) && this.props.options.length>0){
            const onFieldName=typeof this.props.onFieldName==="function"?this.props.onFieldName:null;
            let fieldid=toStr(this.props.fieldid).toString().trim();
            let fieldname=toStr(this.props.fieldname).toString().trim();
            fieldid=fieldid.length<1?"id":fieldid;
            fieldname=fieldname.length<1?fieldid:fieldname;
            const dataKeys=[];
            for(let i=0; i<this.props.options.length; i++){
                const o:ILoos=this.props.options[i];
                if(isObjectEmpty(o)) continue;

                let valueId=toStr(o[fieldid]).toString().trim();
                if(dataKeys.indexOf(valueId)>=0) continue;
                let label=toStr(o[fieldname]);  
                label = label.length < 1 ? valueId : label;
                const labelOrigin=label;
                if(typeof onFieldName==="function"){
                    try{
                        const test=onFieldName(o);
                        if(typeof test==="string" && toStr(test).length>0){
                            label=toStr(test).toString().trim();
                        }
                    }
                    catch(e){

                    }
                }
                dataKeys.push(valueId);
                this.valueRef.push(valueId);
                this.options.push({
                    ...o,
                    id:valueId,
                    label:label,
                    labelOrigin:labelOrigin,              
                });
            }
        }
    }    

    protected prepPropsValues(){
        const newValues=toArrayString(this.props.value);
        const changed=!isEqual(newValues,this.values);
        if(!changed) return false;

        //console.log("call prepPropsValues from ",this.props.value," changed ",changed); 
        this.values=newValues.slice(0);    
        this.selectValues=[];        
        this.value="";        
    }

    protected prepValues(){        
        this.selectValues=[];
        this.value="";
        if(this.multiple){
            //console.log("prepValues ",this.values," valRef ",this.valueRef," from ",this.props.value);
            for(let i=0; i<this.values.length; i++){
               let iof=this.valueRef.indexOf(this.values[i]);
               let inValue=iof>=0;               

               if(!inValue) continue;

               let html=this.options[iof].label;
               const val=this.options[iof].id;
               //this.value=this.options[iof].id;               
               this.selectValues.push(<SelectTag dngHtml={html} onClick={e=>{ e?.preventDefault(); this.onUnSelect(val); }} />);              
           } 
        }
        else 
        {
           for(let i=0; i<this.values.length; i++){
               let iof=this.valueRef.indexOf(this.values[i]);
               let inValue=iof>=0;               

               if(!inValue) continue;

               let html=this.options[iof].label;
               this.value=this.options[iof].id;               
               this.selectValues.push(<div className="SelectValue selected"><span className="SelectAria">&nbsp;</span><span className="SelectLabel" dangerouslySetInnerHTML={{__html:html}}/></div>);
               break;
           } 
        }
    }

    protected prepSelectValues()
    {       
        this.selectOptions=[]; //clear        
        for(let i=0; i<this.options.length; i++){
            let val=this.options[i].id;            
            let inValue=this.values.indexOf(val)>-1; 
            let html=this.options[i].label;
            let normalText=stripHtmlTags(html);
            const ops:ILoos={
                value:val,               
            }
            if(inValue){
                ops.selected=true;
            }
            this.selectOptions.push(<option {...ops}>{normalText}</option>)
        }
    }    

    protected prepDropDown(checkFocused=true){       
        let search=toStr(this.search).toString().trim();
        this.dropDowns=[];  

        let focused=this.nodeInput && document && document.activeElement && this.nodeInput===document.activeElement;             
        
        for(let i=0; i<this.options.length; i++){            
            let id=toStr(this.options[i].id);
            let val=toStr(this.options[i].label);
            let isCompare=true;
            
            if(search.length>0 && checkFocused && focused){
                isCompare=checkCompare(id,search) || checkCompare(val,search);
            }   

            const is_in_value=this.values.indexOf(id)>=0;
            // index={i.toString()}
            if(!is_in_value && isCompare){                 
                 this.dropDowns.push(<li><a className={"SelectDropDownItem"} onClick={e=>{ e.preventDefault(); this.onSelect(id); }}><span dangerouslySetInnerHTML={{__html:val}} /></a></li>)
            }
        }
    }

    UNSAFE_componentWillMount(){
        inputKey_++;
        this.inputKey_="_noCs_"+inputKey_+'tX_';     
        this.prepOptions();
        this.prepPropsValues();
        this.prepValues();
        this.prepSelectValues(); //apply select values              
        const oldSearch=this.search;
        this.search="";
        this.prepDropDown(); //prepare filter dropDown
        this.search=oldSearch;     
        if(this.values.length>0){
            if(!this.multiple){
                const iof=this.valueRef.indexOf(this.values[0]);
                if(iof>=0){
                    this.search=stripHtmlTags(this.options[iof].label);
                }                
            }
        }
    }

    protected callPropsChange(){
        const onChange=this.props.onChange;  

        if(typeof onChange!=="function") return false;        
        //const value=this.multiple?this.values:this.values.length>0 && toStr(this.values[0]).length>0?this.values[0]:"";
        const tg={
            id:this.nodeSelect.id,
            name:this.nodeSelect.name,
        }
        const e:ILoos={
            target:{
                ...tg,    
                value:this.nodeSelect?this.nodeSelect.value:"",// value,
            },            
            preventDefault:function(){},
            stopPropagation:function(){},
        };
        let data:ILoos | null | undefined=null;
        if(!this.multiple){
            const iof=this.values.length>0 && toStr(this.values[0]).length>0?this.valueRef.indexOf(this.values[0]):-1;
            data={
                ...(this.options[iof]?this.options[iof]:null)
            };
            if(this.nodeSelect){
                data[this.nodeSelect.name] = this.valueRef[iof]?this.valueRef[iof]:"";
            }           
            data[this.props.fieldname] = this.options[iof]?this.options[iof].labelOrigin:"";
            e.target.data=data;
        }
        else {
            e.target.value=this.values.filter((fi)=>{                
                return this.valueRef.indexOf(fi)>=0;
            })
        }
        e.currentTarget={...e.target};        
        (onChange as any)(e);
    }


    protected onInputChange(e:IChosenAnyInputEvent){
        this.search=e.target.value;
        const la=this.dropDowns?this.dropDowns.length:0;
        this.prepDropDown();
        const lb=this.dropDowns?this.dropDowns.length:0;        
        if(la!==lb){
            this.nextUpdate();
        }
    }

    protected onInputFocus(){
        if(this.focused) return false;
        this.focused=true;
        this.nextUpdate();
    }

    protected onInputKeyDown(e:React.KeyboardEvent<HTMLInputElement>){
        const hasBackspace=e && e.key && e.key==="Backspace"; 
        
        
        let val=toStr(e.currentTarget.value);
        //handle for multiple
        if(this.multiple){   
            if(val.length<1 && hasBackspace && this.values.length>0){
                e.preventDefault();
                e.stopPropagation();       

                if(this.multiple){
                    this.onUnSelect(this.values[this.values.length-1],this.focused);
                }
                else {
                    const iof = this.values.length - 1;
                    this.values.splice(iof, 1);
                    this.selectValues.splice(iof, 1);
                    this.value=this.values.length>0?this.values[0]:"";
                }
            }
            return false;
        }

        const up=e && e.key==="ArrowUp"; //arrow up keyCode=38
        const down=e && e.key==="ArrowDown"; //arrow down keyCode=40
        const enter=e && e.key==="Enter"; //enter keyCode=13
        const hasEvent=up || down || enter || hasBackspace;
        
        if(!hasEvent) {
            return;
        }

        const length=this.dropDowns && this.dropDowns.length>0?this.dropDowns.length-1:0;
        const oldKey=this.keyUpDownIndex;

        if(up){
            this.keyUpDownIndex--;
            if(this.keyUpDownIndex<0) this.keyUpDownIndex=0;
        }
        if(down){
            this.keyUpDownIndex++;
            if(this.keyUpDownIndex>length) this.keyUpDownIndex=length;
        }        

        const changeKey=oldKey!==this.keyUpDownIndex;

        if((up || down) && !changeKey){
            e.preventDefault();
            return;
        }

        if(up || down){    
            e.preventDefault();        
            //console.log("find key in ",this.keyUpDownIndex);  
            const index=this.keyUpDownIndex;
            const list=this.nodeDropDown.querySelectorAll('li');            
            let selected=null;
            for(let i=0; i<list.length; i++){
                const li=list[i];   
                const a=li.firstChild;             
                if(i===index){
                    a.classList.add("hover");
                    selected=a;
                }
                else {
                    a.classList.remove("hover");
                }
            }
            if(selected){
                const dropdown=this.nodeDropDown;
                const docViewBottom=dropdown.scrollTop+ dropdown.offsetHeight;
                const elmChildBottom=selected.offsetTop + selected.offsetHeight;
                const inScrollView=((elmChildBottom<docViewBottom) && (selected.offsetTop>=dropdown.scrollTop));
                
                if(!inScrollView){                    
                    dropdown.scrollTop=selected.offsetTop;
                }               
            }
            return false;
        }

        if(enter)
        {
            //e.preventDefault();            
            if(this.keyUpDownIndex>=0 && this.keyUpDownIndex<=length){
                const list=this.nodeDropDown.querySelectorAll('li');
                const li=list[this.keyUpDownIndex]?list[this.keyUpDownIndex]:null;
                const a=li?li.querySelector("a"):null;                
                if(a){
                    const iof=parseInt(a.getAttribute("index"))||0;
                    const valueId=this.valueRef[iof];
                    if(!valueId) return false;                    
                    this.onSelect(valueId,false);
                }
            }
        }

        if(hasBackspace && this.nodeInput && this.values.length>0){
            let val=this.nodeInput.value;            
            this.keyUpDownIndex=-1; //reset key index
            if(val.length<=1){
                e.preventDefault();          
                this.onUnSelect(null, true);
            }
        }
        return false;
    }

    onUnSelect(id:string | number | null | undefined,toFocus=false){
        let val=toStr(id).toString().trim();
        let exists=this.values.indexOf(val)>=0 && this.valueRef.indexOf(val)>=0;                

        if(this.multiple){
           if(!exists) return false;
           this.values.splice(this.values.indexOf(val),1);
           this.focused=toFocus;   
           this.prepValues();
           this.prepSelectValues();
           this.prepDropDown();
           this.nextUpdate(this.callPropsChange);
            if(toFocus && this.nodeInput){
                const selfFocused=document && document.activeElement && this.nodeInput===document.activeElement;
                if(!selfFocused){
                    this.nodeInput.focus();
                }
            }
        }
        else {            
            this.values=[];//empty
            this.selectValues=[];//empty
            this.value="";
            this.search="";
            if(this.nodeSelect) this.nodeSelect.value="";            
            this.focused=toFocus;        
            this.prepValues();
            this.prepSelectValues();
            this.prepDropDown();            
            this.nextUpdate(this.callPropsChange);
            if(toFocus && this.nodeInput){
                const selfFocused=document && document.activeElement && this.nodeInput===document.activeElement;
                if(!selfFocused){
                    this.nodeInput.focus();
                }
            }
        }
    }

    onSelect(id:string | number | null | undefined,exitFocus=true,applySearch=true){
        //console.log("handle select ",id);
        let val=toStr(id).toString().trim();
        let exists=this.values.indexOf(val)>=0 && this.valueRef.indexOf(val)>=0;        
        if(exists) return false;

        if(this.multiple){            
            const change=this.values.indexOf(val)<0;
            const iof=this.valueRef.indexOf(val);
            if(change) {
                this.values.push(val);                
                this.prepValues();
                this.prepSelectValues();
            }
            if(exitFocus && this.focused){
                this.focused=false;
            }

            this.search="";
            this.prepDropDown();  

            this.nextUpdate(()=>{
                if(change){
                    this.callPropsChange();
                }
            })
        }
        else {
            this.values=[val];
            this.value=val;
            if(this.nodeSelect) this.nodeSelect.value=val;            
            const iof=this.valueRef.indexOf(val);

            this.prepValues();
            this.prepSelectValues();

            if(exitFocus && this.focused){
                this.focused=false;
            }
            if(applySearch){
                this.search="";
                this.prepDropDown();  
                this.search=stripHtmlTags(this.options[iof].label);            
            }
            else {
                this.search=stripHtmlTags(this.options[iof].label);        
                this.prepDropDown();  
            }
            this.nextUpdate(this.callPropsChange);
        }
    }

    onBodyClick(e:globalThis.MouseEvent){       
        const isContains=this.node.contains(e.target);             
        if(!isContains && this.focused){            
            this.focused=false;
            this.forceUpdate();
        }
    }

    onBodyKeyDown(e:globalThis.KeyboardEvent){    
        const vkTab=e.key==="Tab"; //keycode=9
        if(this.focused && vkTab){
            this.focused=false;
            this.nextUpdate();
        }
        return false;
    }

    onToggleDropDown(){
        const inputFocused=this.nodeInput && !this.nodeInput.focused
        if(!this.focused && !inputFocused){
            this.nodeInput.focus();
            return;            
        }

        if(inputFocused && !this.focused){
            this.focused=true;
            this.forceUpdate();
            if(this.nodeInput) this.nodeInput.focus();
            return false;
        }
        
        if(this.focused){
            this.focused=false;
            this.forceUpdate();
        }
    }

    componentDidMount(){
        if(!this.multiple && this.nodeSelect){            
            this.nodeSelect.value=this.value;            
        }
    }

    componentWillUnmount(){        
        if(this.listenerBodyClick){
            window.removeEventListener("click",this.onBodyClick);
            window.removeEventListener("keydown",this.onBodyKeyDown);
            this.listenerBodyClick=null;
        }
    }

    componentDidUpdate(prev:P){       
        this.checkListeners();
        if(this.props.loading) return false;        

        //const time=(new Date()).getMilliseconds();
        const satu=!isEqualStringify(this.props.options,prev.options);
        const dua=!isEqualStringify(toArrayString(this.props.value),toArrayString(prev.value),true);
        const tiga=!isEqualStringify(toArrayString(this.props.value),this.values,true);

        const harus=satu || dua || tiga;
        if(!harus) return false;

        if(satu){
            
            this.prepOptions();
        }

        const oldValue=toSingleString(this.search);
        const newValue=toSingleString(this.props.value);
        this.prepPropsValues();
        
        this.prepValues();
        this.prepSelectValues();        
        if(!this.multiple){
            let found=false;
            let svalue="";
            if((dua || newValue.length>0 || oldValue && oldValue.length>0))
            {
                
                if(newValue.length>0){
                    let iof=newValue.length>0?this.valueRef.indexOf(newValue):-1;
                    if(iof>=0){
                        svalue=stripHtmlTags(this.options[iof].label);
                        found=true;                    
                    }
                }            
                if(found){               
                    this.search=svalue;
                    this.prepDropDown(false); 
                }               
            } 
            
            if(!found){
                this.search = "";
                this.prepDropDown();
            }
        }
        else {
            if(satu && this.multiple){
                this.prepDropDown();
            }
        }       
        
        this.nextUpdate(()=>{            
            const selfFocused=document && document.activeElement && this.nodeInput && this.nodeInput===document.activeElement;
            if(!selfFocused && this.focused && this.multiple){
                this.nodeInput.focus();
            }            
        });
    }
    
    render(){
        const defAttrIdName="select"+this.inputKey_;
        let selectAttrId=toStr(this.props.id);
        let selectAttrName=toStr(this.props.name);
        selectAttrId=selectAttrId.length<1?(selectAttrName.length>0?selectAttrName:defAttrIdName):defAttrIdName;
        selectAttrName=selectAttrName.length<1?selectAttrId:selectAttrName;
        const selectProps:ILoos={
            id:selectAttrId,
            name:selectAttrName,
            className:"SelectSelect",            
        }
        let textValue=toSingleString(this.search);

        if(!this.multiple){
            selectProps.value=this.value;
        }

        if(this.multiple){
            selectProps.multiple=true;
        }

        let showPlaceholder=!this.focused; 
        if(this.selectValues.length>0){
            showPlaceholder=false;
        }

        if(!showPlaceholder && !this.multiple && !this.focused && this.selectValues.length>0){
            const iof=this.valueRef.indexOf(this.values[0]);
            textValue=stripHtmlTags(this.options[iof].label);
        }       

        //console.log("render selectProps ",selectProps);
        
        let placeholder=toStr(this.props.placeholder).toString().trim();
        if(placeholder.length<1){
            placeholder ="Pilihan";
        }        
        return (
            <div ref={node=>this.node=node} className={"Select "+(this.multiple?"multiple":"single")+(this.focused?" focus":"")+(this.props.loading?" loading":"")}>
                <div className="SelectConta">
                    <select {...selectProps} ref={fn=>this.nodeSelect=fn}>
                        {this.selectOptions}
                    </select>
                    <div className="SelectAreas">
                        <div className="SelectControls">
                            <div className="SelectValues">
                                {showPlaceholder && <div className="SelectValue placeholder"><span className="SelectAria">{placeholder}</span><span className="SelectLabel">{placeholder}</span></div>}
                                {this.selectValues}
                                <input ref={nodeInput=>this.nodeInput=nodeInput} size={1} className="SelectInput" type="text" id={this.inputKey_} name={this.inputKey_} spellCheck="false" autoComplete="off" value={this.focused?textValue:''} onChange={this.onInputChange} onFocus={this.onInputFocus} onKeyDown={this.onInputKeyDown} />
                            </div>
                        </div>
                        <div className="SelectArrows">
                            <a className={"SelectArrow SelectUnDropDown "+((!this.multiple && this.selectValues.length>0)?"show":"hidden")} onClick={e=>this.onUnSelect(this.values[0],this.focused)}><span>&#10006;</span></a>
                            <a ref={nodeSADD=>this.nodeSADD=nodeSADD} className="SelectArrow SelectArrowDropDown" onClick={this.onToggleDropDown}><span>&#9662;</span></a>
                        </div>
                    </div>
                    <div className="SelectDropDownLine"/>
                    <div tabIndex={-1} ref={nodeDropDown=>this.nodeDropDown=nodeDropDown} className="SelectDropDown">
                        <ul>
                            {this.dropDowns}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

export {Chosen}