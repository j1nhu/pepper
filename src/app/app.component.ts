import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
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


  constructor (private db: AngularFireDatabase, private afAuth: AngularFireAuth) {
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

      this.displayName = authState.displayName;
      this.photoURL = authState.photoURL;
      console.log('LOGGED IN', this.displayName, this.photoURL);
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

  login() {
    this.afAuth.auth.signInWithPopup(new auth.FacebookAuthProvider()).then(authState => {
      console.log('AFTER LOGIN', authState);
    });
  }

  logout() {
    this.afAuth.auth.signOut();
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
