import { Component, Input, ElementRef } from '@angular/core';
import { createAction, createReducer, on, props, createSelector } from '@ngrx/store';
import { Action, Store, select, ActionReducerMap } from '@ngrx/store';
import { Observable } from 'rxjs';

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
        id: ncounter,
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
        <input type="checkbox" [checked]="todo.checked" (change)="onCheckTodo(todo.id,$event.target.checked)">
        <span [ngStyle]="{textDecoration: todo.checked?'line-through':'unset'}" >{{ todo.text }}</span>
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

@Component({
  selector: `.${InvoiceTab}`,
  template: `
    invoice`
})
export class InvoiceComponent {
  title = 'todo';
}

//------------------------------------------------------------------------------
//-- Main
interface AppState {
  tab: string;
}
const initialState : AppState = {
  tab: CalcTab
};
const tabSelector = (state:RootState) => state.app.tab;
export interface RootState {
  app: AppState;
  todoModel: TodoState,
  calcModel: CalcState
}

const changeTabAction = createAction("[App] ChangeTab", props<{tab:string}>());

export const rootReducer : ActionReducerMap<RootState> = {
  app: createReducer(
    initialState,
    on(changeTabAction, (state,{tab}) => {return {...state,tab}} )
  ),
  todoModel: todoModelReducer,
  calcModel: calcModelReducer
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
