import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import * as App from './app.component';

@NgModule({
  declarations: [
    App.AppComponent, App.TodoComponent, App.CalcComponent, App.InvoiceComponent
  ],
  imports: [
    BrowserModule, StoreModule.forRoot(App.rootReducer),
    FormsModule
  ],
  providers: [],
  bootstrap: [App.AppComponent]
})
export class AppModule { }
