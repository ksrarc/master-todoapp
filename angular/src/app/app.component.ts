import { Component } from '@angular/core';
import { createAction, createReducer, on, props, createSelector } from '@ngrx/store';
import { Action, Store, select, ActionReducerMap } from '@ngrx/store';
import { Observable } from 'rxjs';

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
const initialTodoModel = {
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
  selector: 'todos',
  template: `
  <div className="todo">
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
    </ul>
  </div>`
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

@Component({
  selector: 'calc',
  template: `
  <div class="calc">
    calc
  </div>`
})
export class CalcComponent {
}

//------------------------------------------------------------------------------
//-- Invoice

@Component({
  selector: 'invoice',
  template: `
  <div class="invoice">
    invoice
  </div>`
})
export class InvoiceComponent {
  title = 'todo';
}

//------------------------------------------------------------------------------
//-- Main
const TodoTab : string = "TodoTab";
const CalcTab : string = "CalcTab";
const InvoiceTab : string = "InvoiceTab";
interface AppState {
  tab: string;
}
const initialState : AppState = {
  tab: TodoTab
};
const tabSelector = (state:RootState) => state.app.tab;
export interface RootState {
  app: AppState;
  todoModel: TodoState
}

const changeTabAction = createAction("[App] ChangeTab", props<{tab:string}>());

export const rootReducer : ActionReducerMap<RootState> = {
  app: createReducer(
    initialState,
    on(changeTabAction, (state,{tab}) => {return {...state,tab}} )
  ),
  todoModel: todoModelReducer
}

const appSelector = (state) => state.app;
@Component({
  selector: 'app-root',
  template: `
  <div class="todoapp">
    <ul>
        <li><button (click)="change2TodoTab()">Todo</button></li>
        <li><button (click)="change2CalcTab()">Calc</button></li>
        <li><button (click)="change2InvoiceTab()">Invoice</button></li>
        <todos *ngIf="isTodoTab()"></todos>
        <calc *ngIf="isCalcTab()"></calc>
        <invoice *ngIf="isInvoiceTab()"></invoice>
    </ul>
</div>`
})
export class AppComponent {
  tab: string;
  constructor(private store: Store<RootState>) {
    this.tab = null;
    store.pipe(select(tabSelector)).subscribe(v=>this.tab=v);
  }
  isTodoTab = () => this.tab === TodoTab;
  isCalcTab = () => this.tab === CalcTab;
  isInvoiceTab = () => this.tab === InvoiceTab;
  change2TodoTab(){
    this.store.dispatch(changeTabAction({tab:TodoTab}));
  }
  change2CalcTab(){
    this.store.dispatch(changeTabAction({tab:CalcTab}));
  }
  change2InvoiceTab(){
    this.store.dispatch(changeTabAction({tab:InvoiceTab}));
  }
}
