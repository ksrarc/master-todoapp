import { Component, Input, ElementRef } from '@angular/core';
import { createAction, createReducer, on, props, createSelector } from '@ngrx/store';
import { Action, Store, select, ActionReducerMap } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Statement } from '@angular/compiler';

const TodoTab : string = "todo";
const CalcTab : string = "calc";
const InvoiceTab : string = "invoice";

//------------------------------------------------------------------------------
//-- Todos

interface Todo {
  id: number,
  text: string,
  checked: boolean
}
interface TodoState {
  //newText: string, no es necesario en el store?
  todos: Array<Todo>,
  counter: number
}
const initialTodoModel : TodoState = {
  counter: 100,
  todos: [{id:1,text:"cesar",checked:false}]
};
const addTodo = createAction('[TodoComponent AddTodo]', props<{text:string}>());
const checkTodo = createAction('[TodoComponent CheckTodo]',props<{id:number, checked:boolean}>());
const deleteTodo = createAction('[TodoComponent DeleteTodo]',props<{id:number}>());
// inecesario? se utiliza el modelo de angular.
//const updateNewTodo = createAction('[TodoComponent UpdateNewTodo]',props<{text:string}>());
const todoModelReducer = createReducer(
  initialTodoModel,
  on(addTodo,(state:TodoState,{text})=>{
    let ncounter = state.counter + 1;
    return {
      ...state,
      counter: ncounter,
      todos: [...state.todos,{
        id: state.counter,
        text: text,
        checked: false
      }]
    }
  }),
  on(checkTodo,(state:TodoState,{id,checked})=>{
    return {
      ...state,
      todos: state.todos.map(t => t.id === id ? {...t, checked}: t)
    }
  }),
  on(deleteTodo,(state:TodoState,{id})=>{
    return {
      ...state,
      todos: state.todos.filter(t => t.id !== id)
    }
  })
);
const todoModelSelector = (state:RootState) => state.todoModel;
const todosSelector = createSelector(todoModelSelector, (model)=>model.todos);

@Component({
  selector: `.todo`,
  template: `
    <div>
      <input [(ngModel)]="newText" />
      <button (click)="onAddTodo()">+</button>
    </div>
    <ul>
      <li *ngFor="let todo of todos | async">
        <input  type="checkbox"
                [checked]="todo.checked"
                (change)="onCheckTodo(todo.id,$event.target.checked)">
        <span   [ngStyle]="{textDecoration: todo.checked?'line-through':'unset'}">
          {{ todo.text }}
        </span>
        <button (click)="onDeleteTodo(todo.id)">x</button>
      </li>
    </ul>`
})
export class TodoComponent {
  todos: Observable<Array<Todo>>;
  newText: string = "";
  constructor(private store: Store<RootState>) {
    this.todos = store.pipe(select(todosSelector));
  }
  onAddTodo() {
    this.store.dispatch(addTodo({text:this.newText}));
  }
  onCheckTodo(id: number, checked: boolean) {
    this.store.dispatch(checkTodo({id, checked}));
  }
  onDeleteTodo(id){
    this.store.dispatch(deleteTodo({id}));
  }
}

//------------------------------------------------------------------------------
//-- Calc

const resolveOperation = (left, operation, input) => {
  let right = parseFloat(input);
  console.warn(left, operation, input, right);
  if ( !isNaN(right) && operation === "+" && !isNaN(left) ) return left + right;
  if ( !isNaN(right) && operation === "-" && !isNaN(left) ) return left - right;
  if ( !isNaN(right) && operation === "*" && !isNaN(left) ) return left * right;
  if ( !isNaN(right) && operation === "/" && !isNaN(left) ) return left / right;
  if ( !isNaN(right) && operation === "=" ) return right;
  if ( !isNaN(right) && left === null ) return right;
  return left;
};

const calcClear = createAction('[CalcComponent Clear]');
const calcDot = createAction('[CalcComponent Dot]');
const calcEnter = createAction('[CalcComponent Enter]');
const calcOper = createAction('[CalcComponent Oper]',props<{oper:string}>());
const calcNumber = createAction('[CalcComponent Number]',props<{str:string}>());
interface CalcState {
  prev: number,
  input: string,
  operation: string
}
const initialCalcModel = {
  prev: null,
  input:"",
  operation: null
};
const calcModelReducer = createReducer(
  initialCalcModel,
  on(calcClear,(state:CalcState)=>{
    return {
      ...initialCalcModel
    }
  }),
  on(calcNumber,(state,{str})=>{
    let {input, prev, operation} = state;
    let nprev = operation == null ? null: prev;
    let text = "";
    if ( input === "" && prev == null ) text = input + str;
    if ( input === "" && prev != null ) text = str;
    else text = input + str;
    return {
      prev: nprev,
      input: text,
      operation
    }
  }),
  on(calcDot,(state)=>{
    let {input}=state;
    let text = input.indexOf(".") > -1 ? input : input + ".";
    return {
      ...state,
      input:text
    };
  }),
  on(calcEnter,({prev,operation,input})=>{
    let result = resolveOperation(prev, operation, input);
    return {
      prev: result,
      input: "",
      operation: null
    }
  }),
  on(calcOper,(state,{oper})=>{
    let {input, prev, operation} = state;
    if ( prev == null ) {
      return {
        operation: oper,
        prev: parseFloat(input),
        input: ""
      };
    } else {
      let result = resolveOperation(prev,operation, input);
      return {
        prev: result,
        input: "",
        operation: oper
      }
    }
  })
);
const calcModelSelector = (state:RootState) => state.calcModel;
const calcOperationSelector = createSelector(calcModelSelector,({operation})=>{
  return operation == null ? "" : operation;
});
const calcDisplaySelector = createSelector(calcModelSelector,({input,prev})=>{
  return input === "" && prev != null ? ""+ prev : input;
});
const numberSet = new Set(["0","1","2","3","4","5","6","7","8","9"]);
const operSet = new Set(["+","-","*","/"]);
@Component({
  selector: `[vCb]`,
  template: `
      <button (click)="click()">{{b}}</button>
    `
})
export class CalcButtonComponent {
  @Input()
  b: string;
  action: any;
  constructor(private el: ElementRef,private store: Store<RootState>){
  }
  ngOnInit() {
    this.el.nativeElement.colSpan = 1;
    this.el.nativeElement.rowSpan = 1;
    if ( this.b == "+" || this.b == "=" ) {
      this.el.nativeElement.rowSpan = 2;
    }
    if ( this.b == "0" ) {
      this.el.nativeElement.colSpan = 2;
    }
    let str = this.b;
    if ( str === "C" ) this.action = calcClear();
    if ( numberSet.has(str) ) this.action = calcNumber({str});
    if ( str === ".") this.action = calcDot();
    if ( str === "=") this.action = calcEnter();
    if ( operSet.has(str)) this.action = calcOper({oper:str});
  }
  click() {
    this.store.dispatch(this.action);
  }
}

@Component({
  selector: `.${CalcTab}`,
  template: `
  <ng-container>
    <span>
      <input readonly value="{{operation | async}}" />
      <input readonly value="{{display | async }}" />
    </span>
    <table>
      <tbody>
        <tr><td vCb b="C"><td vCb b="/"><td vCb b="*"><td vCb b="-"></tr>
        <tr><td vCb b="7"><td vCb b="8"><td vCb b="9"><td vCb b="+"></tr>
        <tr><td vCb b="4"><td vCb b="5"><td vCb b="6"></tr>
        <tr><td vCb b="1"><td vCb b="2"><td vCb b="3"><td vCb b="="></tr>
        <tr><td vCb b="0"><td vCb b="."></tr>
      </tbody>
    </table>
    </ng-container>
    `
})
export class CalcComponent {
  display: Observable<string>;
  operation: Observable<string>;
  constructor(private store: Store<RootState>) {
    this.operation = store.pipe(select(calcOperationSelector));
    this.display = store.pipe(select(calcDisplaySelector));
  }
}

//------------------------------------------------------------------------------
//-- Invoice

interface Item {
  id: number,
  text: string,
  price: number,
  quantity: number,
  checked: boolean
}
interface Tax {
  percent: boolean,
  value: number
}
interface InvoiceState {
  //newText: string, no es necesario en el store?
  items: Array<Item>,
  tax: Tax,
  counter:number
}
const addNewItem = createAction('[InvoiceComponent AddNew]');
const deleteItem = createAction('[InvoiceComponent Delete]', props<{id:number}>());
const checkItem = createAction('[InvoiceComponent Check]', props<{id:number, checked: boolean}>());
const changeItemText = createAction('[InvoiceComponent ChangeText]',props<{id:number, text:string}>());
const changeItemPrice = createAction('[InvoiceComponent ChangePrice]',props<{id:number, price:string}>());
const changeItemQuantity = createAction('[InvoiceComponent ChangeQuantity]',props<{id:number,quantity:string}>());
const changeInvoiceTaxUI = createAction('[InvoiceComponent ChangeTax]',props<{tax:string}>());
const initialInvoiceModel:InvoiceState = {
  items: [],
  tax: {
    percent:true,
    value: 19
  },
  counter: 100
}
const invoiceModelReducer = createReducer(
  initialInvoiceModel,
  on(addNewItem,(state)=>{
    let ncounter = state.counter+1;
    return {
      ...state,
      items: [...state.items,{
        id: state.counter,
        text: "algos",
        price: 2,
        quantity: 3,
        checked: true
      }],
      counter: ncounter
    }
  }),
  on(deleteItem,(state,{id})=>{return{
    ...state,
    items: state.items.filter(i=>i.id !== id)
  }}),
  on(changeItemPrice,(state,{id,price})=>{
    let nprice = parseFloat(price);
    if ( isNaN(nprice) ) return state;
    return{
      ...state,
      items: state.items.map(i=>i.id !== id? i : {...i, price:nprice})
    };
  }),
  on(changeItemQuantity,(state,{id,quantity})=>{
    let nquantity = parseFloat(quantity);
    if ( isNaN(nquantity) ) return state;
    return{
      ...state,
      items: state.items.map(i=>i.id !== id? i : {...i, quantity:nquantity})
    };
  }),
  on(checkItem,(state,{id,checked})=>{
    return {
      ...state,
      items: state.items.map( i=> i.id!==id? i : { ...i, checked})
    }
  }),
  on(changeItemText,(state,{id,text})=>{
    return {
      ...state,
      items: state.items.map( i=> i.id!==id? i : { ...i, text})
    }
  }),
  on(changeInvoiceTaxUI,(state,{tax})=>{
    let percent = tax.indexOf("%") > -1;
    let value = parseFloat(tax.replace(/%/g,""));
    console.info(percent,value);
    return {
      ...state,
      tax: {
        percent,
        value
      }
    };
  })
);

const invoiceModelSelector = (state:RootState) => state.invoiceModel;
const invoiceSummarySelector = createSelector(
  invoiceModelSelector,
  ({items, tax}) => {
    let nitems = items.map(item=>{return{
      ...item,
      total:(item.checked?item.quantity*item.price:0)
    }});
    let subtotal = nitems.reduce((sub,item)=>
      sub + item.total
    ,0);
    let taxValue = (tax.percent?(subtotal*tax.value/100):tax.value);
    return {
      items: nitems,
      subtotal,
      taxValue,
      total: subtotal + taxValue,
      tax: (tax.percent)?tax.value+" %":tax.value
    };
  }
);

@Component({
  selector: `.${InvoiceTab}`,
  template: `
  <ng-container>
    <ul>
      <li>
        <span>Item</span>
        <span>Vlr U.</span>
        <span>Cantidad</span>
        <span>Total</span>
      </li>
      <li *ngFor="let item of (summary | async).items; trackBy: trackById">
        <span>
          <button (click)="deleteItem(item.id)">x</button>
          <input  type="checkbox"
                  [checked]="item.checked"
                  (change)="checkItem(item.id,$event.target.checked)">
        </span>
        <input  value="{{item.text}}"
                (keyup)="changeText(item.id,$event)" />
        <input  value="{{item.price}}"
                (keyup)="changePrice(item.id,$event)"/>
        <input  value="{{item.quantity}}"
                (keyup)="changeQuantity(item.id,$event)"/>
        <span>{{ item.total }}</span>
      </li>
    </ul>
    <div>
      <button (click)="addNew()">+</button>
    </div>
    <div>
      <span>Sub Total</span>
      <span>{{(summary | async).subtotal}}</span>
    </div>
    <div>
      <span>Impuesto</span>
      <span><input value="{{(summary | async).tax}}"
                   (keyup)="changeTax($event)" /></span>
      <span>{{(summary | async).taxValue}}</span>
    </div>
    <div>
      <span>Total</span>
      <span>{{(summary | async).total}}</span>
    </div>
  </ng-container>
  `
})
export class InvoiceComponent {
  summary: Observable<Object>;
  constructor(private store: Store<RootState>) {
    this.summary = store.pipe(select(invoiceSummarySelector));
  }
  addNew(){
    this.store.dispatch(addNewItem());
  }
  changeTax(event){
    event.stopPropagation();
    this.store.dispatch(changeInvoiceTaxUI({tax:event.target.value}));
  }
  deleteItem(id:number){
    this.store.dispatch(deleteItem({id}));
  }
  changePrice(id,$event){
    $event.stopPropagation();
    this.store.dispatch(changeItemPrice({id,price:$event.target.value}))
  }
  changeQuantity(id,$event){
    $event.stopPropagation();
    this.store.dispatch(changeItemQuantity({id,quantity:$event.target.value}))
  }
  checkItem(id,checked){
    this.store.dispatch(checkItem({id,checked}));
  }
  changeText(id,event){
    event.stopPropagation();
    let text = event.target.value;
    this.store.dispatch(changeItemText({id,text}));
  }
  trackById(index: number, item:Item) {
    return item.id;
  }
}

//------------------------------------------------------------------------------
//-- Main
interface AppState {
  tab: string;
}
const initialState : AppState = {
  tab: InvoiceTab
};
const tabSelector = (state:RootState) => state.app.tab;
export interface RootState {
  app: AppState;
  todoModel: TodoState,
  calcModel: CalcState,
  invoiceModel: InvoiceState
}

const changeTabAction = createAction("[App] ChangeTab", props<{tab:string}>());

export const rootReducer : ActionReducerMap<RootState> = {
  app: createReducer(
    initialState,
    on(changeTabAction, (state,{tab}) => {return {...state,tab}} )
  ),
  todoModel: todoModelReducer,
  calcModel: calcModelReducer,
  invoiceModel: invoiceModelReducer
}

const appSelector = (state) => state.app;
@Component({
  selector: '[todoapp-angular]',
  template: `
  <div class="todoapp">
    <div>
      <ul>
          <li><button (click)="change2TodoTab()">Todo</button></li>
          <li><button (click)="change2CalcTab()">Calc</button></li>
          <li><button (click)="change2InvoiceTab()">Invoice</button></li>
      </ul>
      <div *ngIf="isTodoTab()" class="todo"></div>
      <div *ngIf="isCalcTab()" class="calc"></div>
      <div *ngIf="isInvoiceTab()" class="invoice"></div>
    <div>
</div>`
})
export class AppComponent {
  tabClass: string;
  constructor(private store: Store<RootState>) {
    this.tabClass = null;
    store.pipe(select(tabSelector)).subscribe(
      v=>{
        this.tabClass=v;
      }
    );
  }
  change2TodoTab(){
    this.store.dispatch(changeTabAction({tab:TodoTab}));
  }
  change2CalcTab(){
    this.store.dispatch(changeTabAction({tab:CalcTab}));
  }
  change2InvoiceTab(){
    this.store.dispatch(changeTabAction({tab:InvoiceTab}));
  }
  isTodoTab = () => this.tabClass === TodoTab;
  isCalcTab = () => this.tabClass === CalcTab;
  isInvoiceTab = () => this.tabClass === InvoiceTab;

}
