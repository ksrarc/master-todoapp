import { Component } from '@angular/core';
import { createAction, createReducer, on, props, createSelector } from '@ngrx/store';
import { Action, Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

//------------------------------------------------------------------------------
//-- Todos

@Component({
  selector: 'todos',
  template: `
  <div class="todo">
    todos
  </div>`
})
export class TodoComponent {
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
export const TodoTab : string = "TodoTab";
export const CalcTab : string = "CalcTab";
export const InvoiceTab : string = "InvoiceTab";
export interface AppState {
  tab: string;
}
const initialState : AppState = { tab: TodoTab };

const changeTabAction = createAction("[App] ChangeTab", props<AppState>());

export function appReducer(state: AppState | undefined, action: Action) {
  return createReducer(
    initialState,
    on(changeTabAction, (state,{tab}) => {console.info(state,tab);return {tab}} )
  )(state,action)
};
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
  constructor(private store: Store<AppState>) {
    this.tab = null;
    store.pipe(select(state=>state.app.tab)).subscribe(v=>{console.log(1,v);this.tab=v;});
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
