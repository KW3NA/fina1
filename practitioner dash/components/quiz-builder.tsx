"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Trash2, Brain, HelpCircle, CheckCircle, AlertCircle, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer: string | number
  explanation?: string
  points: number
}

interface QuizBuilderProps {
  onQuizCreated: (quiz: { title: string; description: string; questions: QuizQuestion[] }) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function QuizBuilder({ onQuizCreated, isOpen, onOpenChange }: QuizBuilderProps) {
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
    type: 'multiple-choice',
    points: 1
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) return

    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: currentQuestion.question,
      type: currentQuestion.type as 'multiple-choice' | 'true-false' | 'short-answer',
      options: currentQuestion.options || [],
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation || '',
      points: currentQuestion.points || 1
    }

    setQuestions(prev => [...prev, newQuestion])
    setCurrentQuestion({
      type: 'multiple-choice',
      points: 1
    })
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const updateQuestion = (questionId: string, field: keyof QuizQuestion, value: any) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }))
  }

  const updateOption = (index: number, value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt) || []
    }))
  }

  const removeOption = (index: number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }))
  }

  const generateQuizWithAI = async () => {
    if (!quizTitle) return

    setIsGenerating(true)
    
    // Simulate AI generation (replace with actual AI API call)
    setTimeout(() => {
      const generatedQuestions: QuizQuestion[] = [
        {
          id: '1',
          question: `What is the main topic of "${quizTitle}"?`,
          type: 'multiple-choice',
          options: [
            'Digital literacy fundamentals',
            'Advanced programming concepts',
            'Basic computer operations',
            'All of the above'
          ],
          correctAnswer: 0,
          explanation: 'This question tests understanding of the core concepts.',
          points: 1
        },
        {
          id: '2',
          question: `Which of the following is most important in ${quizTitle.toLowerCase()}?`,
          type: 'multiple-choice',
          options: [
            'Speed',
            'Accuracy',
            'Creativity',
            'All are equally important'
          ],
          correctAnswer: 3,
          explanation: 'All aspects are important for comprehensive learning.',
          points: 1
        },
        {
          id: '3',
          question: `True or False: ${quizTitle} requires prior technical knowledge.`,
          type: 'true-false',
          correctAnswer: 'false',
          explanation: 'This course is designed for beginners.',
          points: 1
        }
      ]

      setQuestions(generatedQuestions)
      setIsGenerating(false)
    }, 2000)
  }

  const handleSubmit = () => {
    if (!quizTitle || questions.length === 0) return

    onQuizCreated({
      title: quizTitle,
      description: quizDescription,
      questions
    })

    // Reset form
    setQuizTitle('')
    setQuizDescription('')
    setQuestions([])
    setCurrentQuestion({
      type: 'multiple-choice',
      points: 1
    })
    onOpenChange(false)
  }

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return <HelpCircle className="w-4 h-4" />
      case 'true-false': return <CheckCircle className="w-4 h-4" />
      case 'short-answer': return <AlertCircle className="w-4 h-4" />
      default: return <HelpCircle className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Quiz Builder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quiz Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Quiz Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz Title *</Label>
                <Input
                  id="quiz-title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiz-description">Description</Label>
                <Textarea
                  id="quiz-description"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Describe what this quiz covers"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={generateQuizWithAI}
                  disabled={!quizTitle || isGenerating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add New Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={currentQuestion.type}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question *</Label>
                <Textarea
                  value={currentQuestion.question || ''}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter your question"
                  rows={2}
                />
              </div>

              {/* Options for Multiple Choice */}
              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}

              {/* Correct Answer */}
              <div className="space-y-2">
                <Label>Correct Answer *</Label>
                {currentQuestion.type === 'multiple-choice' ? (
                  <Select
                    value={currentQuestion.correctAnswer?.toString()}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct option" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentQuestion.options?.map((_, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Option {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : currentQuestion.type === 'true-false' ? (
                  <Select
                    value={currentQuestion.correctAnswer as string}
                    onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={currentQuestion.correctAnswer as string || ''}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    placeholder="Enter correct answer"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Explanation (Optional)</Label>
                <Textarea
                  value={currentQuestion.explanation || ''}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why this is the correct answer"
                  rows={2}
                />
              </div>

              <Button
                onClick={addQuestion}
                disabled={!currentQuestion.question || !currentQuestion.correctAnswer}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Questions List */}
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Questions ({questions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div className="flex items-center gap-2">
                          {getQuestionIcon(question.type)}
                          <span className="font-medium">{question.question}</span>
                          <Badge variant="secondary">{question.points} pts</Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {question.type === 'multiple-choice' && question.options && (
                      <div className="ml-6 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={cn(
                              "p-2 rounded text-sm",
                              optIndex === question.correctAnswer
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-50"
                            )}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {optIndex === question.correctAnswer && (
                              <CheckCircle className="w-4 h-4 inline ml-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === 'true-false' && (
                      <div className="ml-6">
                        <Badge
                          variant={question.correctAnswer === 'true' ? 'default' : 'secondary'}
                        >
                          {question.correctAnswer === 'true' ? 'True' : 'False'}
                        </Badge>
                      </div>
                    )}

                    {question.type === 'short-answer' && (
                      <div className="ml-6">
                        <span className="text-sm text-gray-600">
                          Answer: {question.correctAnswer}
                        </span>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="ml-6 text-sm text-gray-600">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!quizTitle || questions.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Quiz
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
