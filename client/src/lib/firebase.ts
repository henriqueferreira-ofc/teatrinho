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
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import type { FirestoreUser, CreateUser, UpdateUser, Subscription, Ebook, CreateEbook, UpdateEbook } from "@shared/schema";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

if (firebaseConfig.apiKey === "demo-api-key") {
  console.warn("Firebase API key ausente. Verifique suas variáveis de ambiente.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

// Auth functions
export const loginWithEmail = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const sanitizedPassword = password.trim();
  const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, sanitizedPassword);
  return userCredential.user;
};

export const registerWithEmail = async (email: string, password: string, name: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const sanitizedPassword = password.trim();
  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, sanitizedPassword);
  const user = userCredential.user;
  
  // Update display name
  await updateProfile(user, { displayName: name });
  
  // Create user document in Firestore
  await createUserDocument(user, { name, email: normalizedEmail, provider: "email", ativo: true });
  
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
      provider: "google",
      ativo: true
    });
  }
  
  return user;
};

export const logout = async () => {
  await signOut(auth);
};

export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
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
    ativo: userData.ativo ?? true, // Por padrão, usuário é criado como ativo
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

export const deleteProfileImage = async (imageUrl: string) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.warn("Erro ao deletar imagem:", error);
  }
};

// Função para carregar imagem de categoria de vídeo do Firebase Storage
export const getVideoCategoryImageUrl = async (categoryId: string): Promise<string | null> => {
  try {
    const imageRef = ref(storage, `video-categories/${categoryId}.jpg`);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.warn(`Imagem não encontrada para categoria ${categoryId}:`, error);
    return null;
  }
};

// Função para carregar imagem de atividade de vídeo do Firebase Storage  
export const getVideoActivityImageUrl = async (activityId: string): Promise<string | null> => {
  try {
    const imageRef = ref(storage, `video-activities/${activityId}.jpg`);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.warn(`Imagem não encontrada para atividade ${activityId}:`, error);
    return null;
  }
};

// Função para upload de imagem de perfil usando base64 no Firestore
export const uploadProfileImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = () => {
      reject(new Error("Erro ao processar imagem"));
    };
    reader.readAsDataURL(file);
  });
};

// Função específica para upload de foto de perfil
export const updateProfilePhoto = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  // Converter imagem para base64
  const photoURL = await uploadProfileImage(file);
  
  // Atualizar apenas o documento do usuário no Firestore
  // Não atualizamos o Firebase Auth pois base64 muito longo causa erro 400
  await updateUserDocument(user.uid, { photoURL });
  
  return photoURL;
};

// Função para sincronizar foto do Google no primeiro login
export const syncGooglePhotoOnFirstLogin = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  
  // Se usuário tem photoURL do Google mas não no Firestore, sincronizar
  if (user.photoURL) {
    const userDoc = await getUserDocument(user.uid);
    if (userDoc && !userDoc.photoURL) {
      await updateUserDocument(user.uid, { photoURL: user.photoURL });
    }
  }
};

export const updateUserProfile = async (userData: { 
  name: string; 
  currentPassword?: string; 
  newPassword?: string; 
  photoURL?: string;
  ativo?: boolean;
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
  if (userData.photoURL !== undefined) {
    updateData.photoURL = userData.photoURL;
  }
  if (userData.ativo !== undefined) {
    updateData.ativo = userData.ativo;
  }
  await updateUserDocument(user.uid, updateData);
  
  return await getUserDocument(user.uid);
};

// Função para atualizar apenas o status ativo/inativo
export const updateUserStatus = async (ativo: boolean) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  await updateUserDocument(user.uid, { ativo });
  return await getUserDocument(user.uid);
};

// Subscription functions
export const isSubscriptionActive = async (email: string): Promise<boolean> => {
  try {
    const subscriptionRef = doc(db, "assinaturas", email);
    const subscriptionSnap = await getDoc(subscriptionRef);
    
    if (!subscriptionSnap.exists()) {
      return false; // Não tem assinatura
    }
    
    // Se o documento existe, considera a assinatura ativa
    return true;
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return false;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// eBook functions
export const createEbook = async (ebookData: CreateEbook): Promise<Ebook> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  const ebookId = crypto.randomUUID();
  const ebookRef = doc(db, "usuarios", user.uid, "ebooks", ebookId);
  
  const newEbook: Omit<Ebook, "id"> = {
    ...ebookData,
    data: new Date().toISOString(),
    atividades: ebookData.atividades || [],
  };
  
  await setDoc(ebookRef, newEbook);
  return { id: ebookId, ...newEbook };
};

export const getUserEbooks = async (): Promise<Ebook[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  const ebooksCollectionRef = collection(db, "usuarios", user.uid, "ebooks");
  const ebooksQuery = query(ebooksCollectionRef, orderBy("nome"));
  const querySnapshot = await getDocs(ebooksQuery);
  
  const ebooks: Ebook[] = [];
  querySnapshot.forEach((doc) => {
    ebooks.push({ id: doc.id, ...doc.data() } as Ebook);
  });
  
  return ebooks;
};

export const getEbook = async (ebookId: string): Promise<Ebook | null> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  const ebookRef = doc(db, "usuarios", user.uid, "ebooks", ebookId);
  const ebookSnap = await getDoc(ebookRef);
  
  if (ebookSnap.exists()) {
    return { id: ebookId, ...ebookSnap.data() } as Ebook;
  }
  
  return null;
};

export const updateEbook = async (ebookId: string, ebookData: UpdateEbook): Promise<Ebook> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  const ebookRef = doc(db, "usuarios", user.uid, "ebooks", ebookId);
  await updateDoc(ebookRef, ebookData);
  
  const updatedEbook = await getEbook(ebookId);
  if (!updatedEbook) throw new Error("Erro ao atualizar eBook");
  
  return updatedEbook;
};

export const deleteEbook = async (ebookId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  const ebookRef = doc(db, "usuarios", user.uid, "ebooks", ebookId);
  await deleteDoc(ebookRef);
};

export const cloneEbook = async (originalEbookId: string, newName: string): Promise<Ebook> => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  
  // Get the original eBook
  const originalEbook = await getEbook(originalEbookId);
  if (!originalEbook) throw new Error("eBook não encontrado");
  
  // Create a new eBook with the same data but new name and ID
  const clonedEbookData: CreateEbook = {
    nome: newName,
    atividades: [...originalEbook.atividades], // Copy activities array
  };
  
  return await createEbook(clonedEbookData);
};
