import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    // Get the auth state, then fetch the Firestore user document or return null
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        //logged in
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();

        } else {
          // Logged out
          return of(null);
        }
      })
    );
  }

  // gets the current user
  getUser() {
    return this.user$.pipe(first()).toPromise();
  }

  // Triggers the Google Signin popup window and authenticates the user.
  // It returns a Promise that resolves with the auth credential.
  googleSignIn() {
    const provider = new auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  // Resolves with the auth credential of the user.
  private async oAuthLogin(provider) {
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  //  This is how we initialize custom data in Firestore.
  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
    return userRef.set(data, { merge: true });
  }

  //Signs out the user and navigates the user to a safe route.
  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(['/']);
  }
}
