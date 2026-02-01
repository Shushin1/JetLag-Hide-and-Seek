'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Question } from '@/types/game'
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react'

export default function QuestionsAdminPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Question>>({
    category: 'Matching',
    type: 'matching',
    question: '',
    answer: '',
    drawCards: 3,
    keepCards: 1,
    timeLimit: 300,
  })

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    if (!db) return
    try {
      const questionsRef = collection(db, 'questions')
      const snapshot = await getDocs(questionsRef)
      const questionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[]
      setQuestions(questionsData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading questions:', error)
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!db) return
    try {
      await addDoc(collection(db, 'questions'), formData)
      setShowAddForm(false)
      setFormData({
        category: 'Matching',
        type: 'matching',
        question: '',
        answer: '',
        drawCards: 3,
        keepCards: 1,
        timeLimit: 300,
      })
      loadQuestions()
    } catch (error) {
      console.error('Error adding question:', error)
      alert('Failed to add question')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!db) return
    try {
      const questionRef = doc(db, 'questions', id)
      await updateDoc(questionRef, formData)
      setEditingId(null)
      loadQuestions()
    } catch (error) {
      console.error('Error updating question:', error)
      alert('Failed to update question')
    }
  }

  const handleDelete = async (id: string) => {
    if (!db) return
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      await deleteDoc(doc(db, 'questions', id))
      loadQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    }
  }

  const startEdit = (question: Question) => {
    setEditingId(question.id)
    setFormData({
      category: question.category,
      type: question.type,
      question: question.question,
      answer: question.answer,
      drawCards: question.drawCards,
      keepCards: question.keepCards,
      timeLimit: question.timeLimit,
    })
  }

  const categories = ['Matching', 'Measuring', 'Radar', 'Thermometer', 'Photo', 'Tentacle']
  const types = ['matching', 'measuring', 'radar', 'thermometer', 'photo', 'tentacle']

  if (loading) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading questions...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh w-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Questions Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>

        {showAddForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Add New Question</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value as Question['category'] })
                    const typeMap: Record<string, Question['type']> = {
                      'Matching': 'matching',
                      'Measuring': 'measuring',
                      'Radar': 'radar',
                      'Thermometer': 'thermometer',
                      'Photo': 'photo',
                      'Tentacle': 'tentacle',
                    }
                    setFormData({ ...formData, category: e.target.value as Question['category'], type: typeMap[e.target.value] })
                  }}
                  className="w-full bg-gray-700 text-white p-2 rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Question</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full bg-gray-700 text-white p-2 rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Answer</label>
                <input
                  type="text"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full bg-gray-700 text-white p-2 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Draw Cards</label>
                  <input
                    type="number"
                    value={formData.drawCards}
                    onChange={(e) => setFormData({ ...formData, drawCards: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Keep Cards</label>
                  <input
                    type="number"
                    value={formData.keepCards}
                    onChange={(e) => setFormData({ ...formData, keepCards: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Time Limit (seconds)</label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 300 })}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="bg-gray-800 rounded-lg p-4">
              {editingId === question.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const typeMap: Record<string, Question['type']> = {
                          'Matching': 'matching',
                          'Measuring': 'measuring',
                          'Radar': 'radar',
                          'Thermometer': 'thermometer',
                          'Photo': 'photo',
                          'Tentacle': 'tentacle',
                        }
                        setFormData({ ...formData, category: e.target.value as Question['category'], type: typeMap[e.target.value] })
                      }}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Question</label>
                    <textarea
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Answer</label>
                    <input
                      type="text"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Draw Cards</label>
                      <input
                        type="number"
                        value={formData.drawCards}
                        onChange={(e) => setFormData({ ...formData, drawCards: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-700 text-white p-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Keep Cards</label>
                      <input
                        type="number"
                        value={formData.keepCards}
                        onChange={(e) => setFormData({ ...formData, keepCards: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-700 text-white p-2 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Time Limit (seconds)</label>
                      <input
                        type="number"
                        value={formData.timeLimit}
                        onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 300 })}
                        className="w-full bg-gray-700 text-white p-2 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(question.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                        {question.category}
                      </span>
                      <span className="text-sm text-gray-400">
                        Draw: {question.drawCards || 1} | Keep: {question.keepCards || 1} | Time: {question.timeLimit || 300}s
                      </span>
                    </div>
                    <p className="text-lg font-semibold mb-1">{question.question}</p>
                    <p className="text-sm text-gray-400">Answer: {question.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(question)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No questions found. Add your first question above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
