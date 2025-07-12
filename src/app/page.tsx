'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
// import { db } from '@/lib/firebase'  // if using Firebase
// import { collection, getDocs } from 'firebase/firestore'

export default function Home() {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    // Fetch questions from Firebase (or your API)
    // getDocs(collection(db, 'questions')).then(snapshot => {
    //   setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    // })
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recent Questions</h1>

      <Link href="/ask" className="text-blue-600 underline mb-4 block">
        ➕ Ask a new question
      </Link>

      {questions.length === 0 ? (
        <p className="text-gray-500">No questions yet.</p>
      ) : (
        <ul className="space-y-2">
          {questions.map((q: any) => (
            <li key={q.id}>
              <Link href={`/question/${q.id}`} className="text-blue-500 underline">
                {q.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
