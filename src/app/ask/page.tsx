'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

export default function AskPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // ✅ Detect if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login'); // redirect to login page
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!user) throw new Error('User not authenticated');

      await addDoc(collection(db, 'questions'), {
        title,
        description,
        author: {
          uid: user.uid,
          email: user.email,
        },
        createdAt: new Date(),
      });

      console.log('Question posted successfully');
      router.push('/'); // or show success toast
    } catch (error) {
      console.error('Error posting question:', error);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Ask a Question</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Enter question title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="border p-2 rounded min-h-[150px]"
          placeholder="Enter question description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Button type="submit">Post Question</Button>
      </form>
    </main>
  );
}
