import Link from 'next/link'

interface Question {
  id: string
  title: string
  description: string
  tags: string[]
  author: string
  upvotes: number
}

export default function QuestionCard({ question }: { question: Question }) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
      <Link href={`/question/${question.id}`}>
        <h2 className="text-lg font-semibold text-blue-700 hover:underline">{question.title}</h2>
      </Link>
      <p className="text-sm text-gray-600 mt-1">{question.description}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
        <span>By {question.author}</span>
        <span>👍 {question.upvotes}</span>
      </div>
    </div>
  )
}
