import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { AppComponent } from './app.component';

export const firebaseConfig = {
    apiKey: "AIzaSyCxBEX0rLe740y4sMVgin0swCfzGU9RiPc",
    authDomain: "pepper-6ba78.firebaseapp.com",
    databaseURL: "https://pepper-6ba78.firebaseio.com",
    projectId: "pepper-6ba78",
    storageBucket: "pepper-6ba78.appspot.com",
    messagingSenderId: "67955095165"
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
