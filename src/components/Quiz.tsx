'use client'

import { useState, useEffect } from 'react'
import { recordQuizResult } from '@/lib/storage'

interface Question {
  id: string
  category: string
  difficulty: number
  type: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  image?: string
  explanationImage?: string
}

interface QuizProps {
  questions: Question[]
  title: string
  onComplete?: (correct: number, total: number) => void
}

export default function Quiz({ questions, title, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 初期化済みなら再シャッフルしない（クイズ中の変更を防ぐ）
    if (isInitialized) return

    // シャッフルして最大10問
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10)
    setShuffledQuestions(shuffled)
    setIsInitialized(true)
  }, [questions, isInitialized])

  // 10問を超えないようにする安全対策
  const limitedQuestions = shuffledQuestions.slice(0, 10)

  if (limitedQuestions.length === 0) {
    return <div className="text-center py-12 text-slate-500">問題を読み込み中...</div>
  }

  const currentQuestion = limitedQuestions[currentIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer
  const progress = ((currentIndex + 1) / limitedQuestions.length) * 100

  const handleAnswer = (index: number) => {
    if (isAnswered) return
    setSelectedAnswer(index)
    setIsAnswered(true)
    if (index === currentQuestion.correctAnswer) {
      setCorrectCount((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < limitedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setIsComplete(true)
      recordQuizResult(correctCount + (isCorrect ? 1 : 0), limitedQuestions.length)
      onComplete?.(correctCount + (isCorrect ? 1 : 0), limitedQuestions.length)
    }
  }

  const handleRetry = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10)
    setShuffledQuestions(shuffled)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setCorrectCount(0)
    setIsComplete(false)
    // isInitializedはtrueのままにして再シャッフルを防ぐ
  }

  if (isComplete) {
    const finalScore = correctCount + (isCorrect ? 1 : 0)
    const percentage = Math.round((finalScore / limitedQuestions.length) * 100)

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className={`text-6xl mb-4 ${percentage >= 80 ? 'text-green-500' : percentage >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">クイズ完了！</h2>
          <p className="text-slate-600">{title}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 mb-6">
          <div className="text-4xl font-bold text-primary mb-2">
            {finalScore} / {limitedQuestions.length}
          </div>
          <div className="text-slate-600">正解率: {percentage}%</div>
        </div>

        <div className="mb-6">
          {percentage >= 80 ? (
            <p className="text-green-600 font-medium">素晴らしい！この分野はマスターしています。</p>
          ) : percentage >= 60 ? (
            <p className="text-yellow-600 font-medium">良い調子です。もう少し復習しましょう。</p>
          ) : (
            <p className="text-red-600 font-medium">もう一度学習してから再挑戦しましょう。</p>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            もう一度挑戦
          </button>
          <a
            href="/quiz"
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            カテゴリ選択に戻る
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Progress bar */}
      <div className="h-2 bg-slate-100">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-slate-500">
            問題 {currentIndex + 1} / {limitedQuestions.length}
          </span>
          <span className="text-sm font-medium text-primary">
            正解: {correctCount}
          </span>
        </div>

        {/* Question */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full ${
              currentQuestion.difficulty === 1 ? 'bg-green-100 text-green-700' :
              currentQuestion.difficulty === 2 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {currentQuestion.difficulty === 1 ? '初級' : currentQuestion.difficulty === 2 ? '中級' : '上級'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {currentQuestion.question}
          </h2>
          {currentQuestion.image && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 mb-4">
              <img
                src={currentQuestion.image}
                alt="問題画像"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all '

            if (!isAnswered) {
              buttonClass += 'border-slate-200 hover:border-primary hover:bg-primary/5'
            } else if (index === currentQuestion.correctAnswer) {
              buttonClass += 'border-green-500 bg-green-50 text-green-800'
            } else if (index === selectedAnswer) {
              buttonClass += 'border-red-500 bg-red-50 text-red-800'
            } else {
              buttonClass += 'border-slate-200 opacity-50'
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isAnswered && index === currentQuestion.correctAnswer ? 'bg-green-500 text-white' :
                    isAnswered && index === selectedAnswer ? 'bg-red-500 text-white' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {isAnswered && index === currentQuestion.correctAnswer && (
                    <span className="text-green-500 text-xl">✓</span>
                  )}
                  {isAnswered && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                    <span className="text-red-500 text-xl">✗</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50' : 'bg-amber-50'}`}>
            <div className={`font-medium mb-1 ${isCorrect ? 'text-green-700' : 'text-amber-700'}`}>
              {isCorrect ? '正解！' : '不正解'}
            </div>
            <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
              {currentQuestion.explanation}
            </p>
            {currentQuestion.explanationImage && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white mt-3">
                <img
                  src={currentQuestion.explanationImage}
                  alt="解説画像"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Next button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            {currentIndex < limitedQuestions.length - 1 ? '次の問題' : '結果を見る'}
          </button>
        )}
      </div>
    </div>
  )
}
