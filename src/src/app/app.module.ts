import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AuthorizationModule } from './authorization/authorization.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FallbackComponent } from './home/fallback.component';
import { LoggedOutComponent } from './home/logged-out.component';
import { LostUserComponent } from './home/lost-user.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FallbackComponent,
    LoggedOutComponent,
    LostUserComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthorizationModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
