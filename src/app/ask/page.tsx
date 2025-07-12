'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';

import styles from './ask.module.css';

const db = getFirestore(app);
const auth = getAuth(app);

export default function AskPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description) return;

    try {
      await addDoc(collection(db, 'questions'), {
        title: title.trim(),
        description: description.trim(),
        tags,
        author: {
          uid: user.uid,
          email: user.email,
        },
        createdAt: serverTimestamp(),
      });

      router.push('/');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <main className={styles.mainContainer}>
      <h1 className={styles.heading}>Ask a Question</h1>
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <input
          className={styles.inputField}
          placeholder="Enter question title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className={styles.textareaField}
          placeholder="Enter question description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className={styles.tagInputContainer}>
          <input
            className={styles.tagInput}
            placeholder="Add tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className={styles.tagList}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
                <button
                  type="button"
                  className={styles.removeTagButton}
                  onClick={() => handleRemoveTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Post Question
        </button>
      </form>
    </main>
  );
}
