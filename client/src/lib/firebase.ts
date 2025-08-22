import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import type { FirestoreUser, CreateUser, UpdateUser } from "@shared/schema";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

// Auth functions
export const loginWithEmail = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const registerWithEmail = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update display name
  await updateProfile(user, { displayName: name });
  
  // Create user document in Firestore
  await createUserDocument(user, { name, email, provider: "email" });
  
  return user;
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // Check if user document exists, create if not
  const userDoc = await getUserDocument(user.uid);
  if (!userDoc) {
    await createUserDocument(user, {
      name: user.displayName || user.email?.split('@')[0] || "User",
      email: user.email!,
      provider: "google"
    });
  }
  
  return user;
};

export const logout = async () => {
  await signOut(auth);
};

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("Usuário não autenticado");
  
  // Reauthenticate user
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  
  // Update password
  await updatePassword(user, newPassword);
};

// Firestore functions
export const createUserDocument = async (user: User, userData: CreateUser) => {
  const userRef = doc(db, "usuarios", user.uid);
  const docData: Omit<FirestoreUser, "id"> = {
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await setDoc(userRef, docData);
  return { id: user.uid, ...docData };
};

export const getUserDocument = async (uid: string): Promise<FirestoreUser | null> => {
  const userRef = doc(db, "usuarios", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { id: uid, ...userSnap.data() } as FirestoreUser;
  }
  
  return null;
};

export const updateUserDocument = async (uid: string, userData: UpdateUser) => {
  const userRef = doc(db, "usuarios", uid);
  const updateData = {
    ...userData,
    updatedAt: new Date().toISOString(),
  };
  
  await updateDoc(userRef, updateData);
  return updateData;
};

export const uploadProfileImage = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  // Create a reference to the image in Firebase Storage
  const imageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}-${file.name}`);
  
  // Upload the file
  const snapshot = await uploadBytes(imageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};

export const deleteProfileImage = async (imageUrl: string) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.warn("Erro ao deletar imagem:", error);
  }
};

export const updateUserProfile = async (userData: { 
  name: string; 
  currentPassword?: string; 
  newPassword?: string; 
  photoURL?: string;
}) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  // Update display name and photo in Firebase Auth
  await updateProfile(user, { 
    displayName: userData.name,
    ...(userData.photoURL && { photoURL: userData.photoURL })
  });
  
  // Update password if provided
  if (userData.currentPassword && userData.newPassword) {
    await updateUserPassword(userData.currentPassword, userData.newPassword);
  }
  
  // Update user document in Firestore (garante que apenas o próprio usuário possa atualizar)
  const updateData: any = { name: userData.name };
  if (userData.photoURL) {
    updateData.photoURL = userData.photoURL;
  }
  await updateUserDocument(user.uid, updateData);
  
  return await getUserDocument(user.uid);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
