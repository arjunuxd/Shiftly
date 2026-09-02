import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { app } from "./firebase";

export const firebaseAuth = getAuth(app);

export function registerWithEmail(
  email: string,
  password: string,
): Promise<User> {
  return createUserWithEmailAndPassword(firebaseAuth, email, password).then(
    (credential) => credential.user,
  );
}

export function loginWithEmail(email: string, password: string): Promise<User> {
  return signInWithEmailAndPassword(firebaseAuth, email, password).then(
    (credential) => credential.user,
  );
}

export function logoutUser(): Promise<void> {
  return signOut(firebaseAuth);
}

export function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(firebaseAuth, email);
}

export function sendVerificationEmail(): Promise<void> {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    return Promise.reject(new Error("No authenticated user"));
  }
  return sendEmailVerification(currentUser);
}

export function reloadUser(): Promise<void> {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    return Promise.reject(new Error("No authenticated user"));
  }
  return reload(currentUser);
}

export function getCurrentIdToken(): Promise<string> {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    return Promise.reject(new Error("No authenticated user"));
  }
  return currentUser.getIdToken();
}

export function subscribeToAuthState(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(firebaseAuth, callback);
}
