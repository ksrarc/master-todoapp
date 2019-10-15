import { Component } from '@angular/core';
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
  selector: `[data-cmp="${TodoTab}"]`,
  template: `<div>
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
    </ul></div>`
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
  selector: `.${CalcTab}`,
  template: `

    calc`
})
export class CalcComponent {
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
  selector: '[todoapp-angular]',
  template: `
  <div class="todoapp">
    <div>
      <ul>
          <li><button (click)="change2TodoTab()">Todo</button></li>
          <li><button (click)="change2CalcTab()">Calc</button></li>
          <li><button (click)="change2InvoiceTab()">Invoice</button></li>
      </ul>
      <div [attr.data-cmp]="tabClass"></div>
    <div>
</div>`
})
export class AppComponent {
  tabClass: string;
  constructor(private store: Store<RootState>) {
    this.tabClass = null;
    store.pipe(select(tabSelector)).subscribe(
      v=>{
        console.info(v);
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
