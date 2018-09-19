import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  constructor (private db: AngularFireDatabase) {
  }

  ngOnInit () {
    this.cuisinesRef = this.db.list('/cuisines');
    this.cuisines = this.cuisinesRef.valueChanges();

    this.restaurantsRef = this.db.list('/restaurants');
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
  }

  // add () {
  //   this.cuisinesRef.push({
  //     name: 'Asian',
  //     details: {
  //       description: 'bla'
  //     }
  //   });
  // }
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
