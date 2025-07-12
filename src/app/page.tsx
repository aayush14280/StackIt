'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import styles from './home.module.css';

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: {
    email: string;
  };
  createdAt: any;
}

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const fetched: Question[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            title: data.title || 'Untitled',
            description: data.description || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            author: {
              email: data.author?.email || 'Unknown',
            },
            createdAt: data.createdAt,
          };
        });

        setQuestions(fetched);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.header}>
        <h1 className={styles.heading}>All Questions</h1>
        <Link href="/ask" className={styles.askButton}>
          Ask a Question
        </Link>
      </div>

      <ul className={styles.questionsList}>
        {questions.length === 0 ? (
          <p className={styles.noQuestions}>No questions posted yet. Be the first to ask!</p>
        ) : (
          questions.map((q) => (
            <li key={q.id} className={styles.questionCard}>
              <Link href={`/question/${q.id}`} className={styles.questionTitle}>
                <h2>{q.title}</h2>
              </Link>

              <p className={styles.description}>{q.description}</p>

              {/* Show tags if they exist */}
              {q.tags.length > 0 && (
                <div className={styles.tagList}>
                  {q.tags.map((tag, idx) => (
                    <span key={idx} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className={styles.authorInfo}>By: {q.author.email}</p>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
