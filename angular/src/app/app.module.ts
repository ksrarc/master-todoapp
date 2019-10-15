import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { StoreModule } from '@ngrx/store';
import * as App from './app.component';

@NgModule({
  declarations: [
    App.AppComponent, App.TodoComponent, App.CalcComponent, App.InvoiceComponent
  ],
  imports: [
    BrowserModule, StoreModule.forRoot({app:App.appReducer})
  ],
  providers: [],
  bootstrap: [App.AppComponent]
})
export class AppModule { }
