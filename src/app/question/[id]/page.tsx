'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  setDoc,
  increment,
  onSnapshot, // Import onSnapshot for real-time updates
  query,
  orderBy, // Import orderBy for sorting in real-time listener
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { ArrowUp, ArrowDown } from 'lucide-react';

import styles from './question-detail.module.css'; // Your page's CSS Module
import Breadcrumb from '@/components/Breadcrumb'; // Import the new Breadcrumb component

export default function QuestionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [userVotes, setUserVotes] = useState<{ [answerId: string]: 'upvote' | 'downvote' | null }>({});
  const [filter, setFilter] = useState<'newest' | 'oldest' | 'mostUpvoted'>('newest'); // State for filter
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(true);

  // Effect to fetch question details
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) {
        setLoadingQuestion(false);
        return;
      }

      setLoadingQuestion(true);
      const docRef = doc(db, 'questions', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuestion(docSnap.data());
      } else {
        console.warn('Question not found');
        router.push('/'); // Redirect if question not found
      }
      setLoadingQuestion(false);
    };

    fetchQuestion();
  }, [id, router]);

  // Effect to listen for real-time answer updates
  useEffect(() => {
    if (!id) {
      setLoadingAnswers(false);
      return;
    }

    setLoadingAnswers(true);
    const answersCollectionRef = collection(db, 'questions', id as string, 'answers');
    const answersQuery = query(answersCollectionRef, orderBy('createdAt', 'asc')); // Default order for listener

    const unsubscribe = onSnapshot(
      answersQuery,
      async (snapshot) => {
        const result = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAnswers(result);
        await fetchVotes(result); // Re-fetch user votes for the updated answers list
        setLoadingAnswers(false);
      },
      (error) => {
        console.error('Error listening to answers:', error);
        setLoadingAnswers(false);
      }
    );

    // Clean up the listener when the component unmounts or ID changes
    return () => unsubscribe();
  }, [id, auth.currentUser]); // Added auth.currentUser to dependency array for fetchVotes to react to login/logout

  const fetchVotes = async (currentAnswers: any[]) => {
    const user = auth.currentUser;
    if (!user || !id) {
      setUserVotes({}); // Clear votes if no user
      return;
    }

    const votes: { [key: string]: 'upvote' | 'downvote' | null } = {};

    for (const ans of currentAnswers) {
      const voteRef = doc(db, 'questions', id as string, 'answers', ans.id, 'votes', user.uid);
      const snap = await getDoc(voteRef);
      if (snap.exists()) {
        votes[ans.id] = snap.data().type || null;
      } else {
        votes[ans.id] = null;
      }
    }
    setUserVotes(votes);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !id) return router.push('/login');

    if (!newAnswer.trim()) {
      alert('Answer cannot be empty.');
      return;
    }

    try {
      // 1. Add the new answer
      const newAnswerRef = await addDoc(collection(db, 'questions', id as string, 'answers'), {
        text: newAnswer,
        author: {
          uid: user.uid,
          email: user.email,
        },
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date(),
      });

      // 2. Fetch the question to get the original author's UID
      const questionDocRef = doc(db, 'questions', id as string);
      const questionDocSnap = await getDoc(questionDocRef);

      if (questionDocSnap.exists()) {
        const questionData = questionDocSnap.data();
        const questionAuthorUid = questionData.author.uid;

        // Only create a notification if the answerer is NOT the question author
        if (questionAuthorUid !== user.uid) {
          await addDoc(collection(db, 'notifications'), {
            userId: questionAuthorUid, // Notify the question author
            type: 'new_answer',
            message: `${user.email} answered your question: "${
              questionData.title.length > 50
                ? questionData.title.substring(0, 50) + '...'
                : questionData.title
            }"`,
            questionId: id as string,
            answerId: newAnswerRef.id, // Optional: link to the specific answer
            read: false,
            createdAt: new Date(),
          });
        }
      }

      setNewAnswer('');
      // The onSnapshot listener will automatically update `answers` and `userVotes`
      // So no need for manual getDocs and setAnswers/fetchVotes here.
    } catch (error) {
      console.error('Error submitting answer or creating notification:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  const handleVote = async (
    answerId: string,
    voteType: 'upvote' | 'downvote'
  ) => {
    const user = auth.currentUser;
    if (!user || !id) return router.push('/login');

    const voteRef = doc(db, 'questions', id as string, 'answers', answerId, 'votes', user.uid);
    const answerRef = doc(db, 'questions', id as string, 'answers', answerId);
    const existingVoteSnap = await getDoc(voteRef);

    const opposite = voteType === 'upvote' ? 'downvote' : 'upvote';

    try {
      if (!existingVoteSnap.exists() || !existingVoteSnap.data()?.type) {
        // No previous vote or vote was null
        await updateDoc(answerRef, {
          [`${voteType}s`]: increment(1),
        });
        await setDoc(voteRef, { type: voteType });
      } else {
        const previousType = existingVoteSnap.data().type;

        if (previousType === voteType) {
          // Unvote: user clicks the same vote type again
          await updateDoc(answerRef, {
            [`${voteType}s`]: increment(-1),
          });
          await setDoc(voteRef, { type: null }); // Set vote to null
        } else {
          // Change vote: user changes from upvote to downvote or vice versa
          await updateDoc(answerRef, {
            [`${voteType}s`]: increment(1),
            [`${opposite}s`]: increment(-1),
          });
          await setDoc(voteRef, { type: voteType });
        }
      }
      // The onSnapshot listener will automatically update `answers` and `userVotes`
      // So no need for manual getDocs and setAnswers/fetchVotes here.
    } catch (error) {
      console.error('Error handling vote:', error);
      alert('Failed to cast vote. Please try again.');
    }
  };

  // --- Filtering Logic ---
  const getSortedAnswers = () => {
    let sortedAnswers = [...answers]; // Create a shallow copy to avoid mutating state directly

    switch (filter) {
      case 'newest':
        // Ensure createdAt is a valid Date object for sorting
        sortedAnswers.sort((a, b) => (b.createdAt?.toDate()?.getTime() || 0) - (a.createdAt?.toDate()?.getTime() || 0));
        break;
      case 'oldest':
        sortedAnswers.sort((a, b) => (a.createdAt?.toDate()?.getTime() || 0) - (b.createdAt?.toDate()?.getTime() || 0));
        break;
      case 'mostUpvoted':
        sortedAnswers.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      default:
        break;
    }
    return sortedAnswers;
  };

  if (loadingQuestion) return <p className={styles.loadingText}>Loading question details...</p>;
  if (!question) return null; // Should not happen if redirected in useEffect, but good fallback

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: question.title ? (question.title.length > 30 ? question.title.substring(0, 30) + '...' : question.title) : 'Loading...' },
  ];

  return (
    <main className={styles.mainContainer}>
      {/* Add the Breadcrumb component here */}
      <Breadcrumb items={breadcrumbItems} />

      <h1 className={styles.questionTitle}>{question.title}</h1>
      <p className={styles.questionDescription}>{question.description}</p>

      {/* New Wrapper for Answers Heading and Filter */}
      <div className={styles.answersHeaderContainer}>
        <h2 className={styles.answersHeading}>Answers</h2>
        {/* Filter Options */}
        <div className={styles.filterContainer}>
          <label htmlFor="answerFilter" className={styles.filterLabel}>Sort By:</label>
          <select
            id="answerFilter"
            className={styles.filterDropdown}
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'newest' | 'oldest' | 'mostUpvoted')}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostUpvoted">Most Upvoted</option>
          </select>
        </div>
      </div>
      {/* End New Wrapper */}

      {loadingAnswers ? (
        <p className={styles.loadingText}>Loading answers...</p>
      ) : (
        <ul className={styles.answersList}>
          {getSortedAnswers().length === 0 ? (
            <p className={styles.noAnswersMessage}>No answers yet. Be the first to answer!</p>
          ) : (
            getSortedAnswers().map((a) => (
              <li key={a.id} className={styles.answerCard}>
                <p className={styles.answerText}>{a.text}</p>
                {/* Added optional chaining and toLocaleDateString for createdAt */}
                <p className={styles.answerAuthor}>By {a.author?.email} on {a.createdAt?.toDate().toLocaleDateString()}</p>

                <div className={styles.voteControls}>
                  <button
                    onClick={() => handleVote(a.id, 'upvote')}
                    className={`${styles.voteButton} ${
                      userVotes[a.id] === 'upvote' ? styles.upvoted : ''
                    }`}
                  >
                    <ArrowUp size={18} /> {a.upvotes || 0}
                  </button>

                  <button
                    onClick={() => handleVote(a.id, 'downvote')}
                    className={`${styles.voteButton} ${
                      userVotes[a.id] === 'downvote' ? styles.downvoted : ''
                    }`}
                  >
                    <ArrowDown size={18} /> {a.downvotes || 0}
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      <form onSubmit={handleAnswerSubmit} className={styles.answerForm}>
        <textarea
          className={styles.answerTextarea}
          placeholder="Your answer..."
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          required
        />
        <button type="submit" className={styles.submitAnswerButton}>
          Submit Answer
        </button>
      </form>
    </main>
  );
}