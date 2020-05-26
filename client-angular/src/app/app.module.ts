import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialImportModule} from './material.import.module';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {HttpClientModule} from '@angular/common/http';
import { PointingDashboardComponent } from './pointing-dashboard/pointing-dashboard.component';
import { PointingCardComponent } from './pointing-card/pointing-card.component';
import { StoryDialogBoxComponent } from './story-dialog-box/story-dialog-box.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PointingDashboardComponent,
    PointingCardComponent,
    StoryDialogBoxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialImportModule,
    FormsModule,
    MatInputModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
