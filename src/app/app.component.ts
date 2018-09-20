import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators'
import { Http } from '@angular/http';
import {sendRequest} from 'selenium-webdriver/http';
import {error} from 'util';

// import 'rxjs/add/operator/take';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  cuisines: Observable<any[]>;
  cuisinesRef: AngularFireList<any[]>;
  restaurants: Observable<any[]>;
  restaurantsRef: AngularFireList<any>;

  exists;

  displayName;
  photoURL;
  error;


  constructor (private db: AngularFireDatabase, private afAuth: AngularFireAuth, private http: Http) {
  }

  ngOnInit () {
    this.cuisinesRef = this.db.list('/cuisines', ref => ref.orderByKey());
    this.cuisines = this.cuisinesRef.valueChanges();

    this.restaurantsRef = this.db.list('/restaurants', ref => ref.orderByChild('rating').equalTo(5).limitToLast(1));
    this.restaurants = this.restaurantsRef.valueChanges().pipe(
      map(restaurants => {
        restaurants.map(restaurant => {
          restaurant.cuisineType = this.db.object('/cuisines/' + restaurant.cuisine).valueChanges();
          restaurant.featureTypes = [];
          for (var f in restaurant.features) {
            restaurant.featureTypes.push(this.db.object('/features/' + f).valueChanges());
          }
        });
        return restaurants;
      })
    );

    this.exists = this.db.object('/restaurants/1/features/1').valueChanges();
    this.exists.pipe(take(1)).subscribe(x => {
        if (x && x === true) {
          console.log("EXIST");
        } else {
          console.log("NOT EXIST");
        }
      });

    this.afAuth.authState.subscribe(authState => {
      if (!authState) {
        console.log('NOT LOGGED IN');
        this.displayName = null;
        this.photoURL = null;
        return;
      }

      let uid = authState.providerData[0].uid;
      let userRef = this.db.object('users/'+ authState.uid);
      userRef.valueChanges().subscribe(user => {
        let url = `https://graph.facebook.com/v3.1/${uid}?field=id,name&access_token=${user.accessToken}`;
        this.http.get(url).subscribe(response => {
          let user = response.json();
          userRef.update(user);
        });
      });

      this.displayName = authState.displayName;
      this.photoURL = authState.photoURL;
      console.log('LOGGED IN', authState);
    });
  }

  addRestaurant () {
    this.restaurantsRef.push({
      name: ''
    }).then(x => {
      // x.key
      let restaurant =  { name: 'My new restaurant'};
      let update = {};
      update['restaurants/'+ x.key] = restaurant;
      update['restaurant-by-city/camberwell/'+ x.key] = restaurant;
      this.db.object('/').update(update);
    });
  }

  loginWithFacebook() {
    this.afAuth.auth.signInWithPopup(new auth.FacebookAuthProvider()).then(authState => {
      console.log('AFTER LOGIN', authState);
      this.db.object('users/' + authState.user.uid).update({
        accessToken: authState.credential.accessToken
      })
    });
  }

  login(email, password) {
    this.afAuth.auth.signInWithEmailAndPassword(email, password).then(authState => {
      console.log('Sign in', authState);
    }).catch(error => {
      console.log('sign in error', error);
      this.error = error;
    });
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  register(email, password) {
    this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(authState => {
      console.log(authState);
      authState.user.sendEmailVerification(email).then(sendRequest => {
        console.log('Send email', sendRequest);
      }).catch(error => {
        console.log('Send email error', error);
      });
    }).catch(error => {
      console.log('Register', error);
    });
  }

  //
  // update () {
  //   this.afDb.object('/favourites/1/').set(null);
  // }
  //
  // remove () {
  //   this.afDb.object('/restaurants').remove()
  //     .then(() => {
  //       console.log('SUCCESS');
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }
}
