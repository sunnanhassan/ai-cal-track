import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const saveUserToFirestore = async (user: {
  id: string;
  email: string | undefined;
  firstName?: string | null;
  lastName?: string | null;
}) => {
  try {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: new Date().toISOString(),
      });
      console.log('User saved to Firestore successfully');
    } else {
      console.log('User already exists in Firestore');
    }
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
};
