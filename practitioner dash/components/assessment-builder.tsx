"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

type AnswerType = 'multiple-choice' | 'checkbox' | 'short-answer' | 'scenario'

type AssessmentQuestion = {
  id: string
  text: string
  type: AnswerType
  options?: { id: string; text: string; correct?: boolean }[]
  media?: { url: string; type: 'image' | 'video' }
  points: number
}

type Assessment = {
  title: string
  description: string
  durationMins: number
  credits: number
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  questions: AssessmentQuestion[]
  settings: {
    shuffleQuestions: boolean
    shuffleAnswers: boolean
    timeLimitMins: number
    passingPercent: number
    retakeAllowed: boolean
  }
}

export function AssessmentBuilder({
  open,
  onOpenChange,
  onSave,
  initialValue,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Assessment) => void
  initialValue?: Assessment
}) {
  const [activeTab, setActiveTab] = useState<'create' | 'questions' | 'settings' | 'preview'>('create')
  const [assessment, setAssessment] = useState<Assessment>(
    initialValue || {
      title: '',
      description: '',
      durationMins: 45,
      credits: 5,
      skillLevel: 'Beginner',
      category: '',
      questions: [],
      settings: {
        shuffleQuestions: true,
        shuffleAnswers: true,
        timeLimitMins: 45,
        passingPercent: 70,
        retakeAllowed: true,
      },
    }
  )

  // Draft question state for the question editor
  const [questionDraft, setQuestionDraft] = useState<{ text: string; type: AnswerType; points: number }>(
    { text: '', type: 'multiple-choice', points: 1 }
  )

  const addQuestion = () => {
    setAssessment(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { id: Date.now().toString(), text: questionDraft.text, type: questionDraft.type, options: [], points: questionDraft.points },
      ],
    }))
    setQuestionDraft({ text: '', type: 'multiple-choice', points: 1 })
  }

  const updateQuestion = (qid: string, updater: (q: AssessmentQuestion) => AssessmentQuestion) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map(q => (q.id === qid ? updater(q) : q)),
    }))
  }

  const removeQuestion = (qid: string) => {
    setAssessment(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== qid) }))
  }

  const saveAndClose = () => {
    onSave(assessment)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assessment Builder</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* 1. Create New Assessment */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assessment Title</Label>
                    <Input value={assessment.title} onChange={e => setAssessment(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (mins)</Label>
                    <Input type="number" value={assessment.durationMins} onChange={e => setAssessment(p => ({ ...p, durationMins: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Credits Awarded</Label>
                    <Input type="number" value={assessment.credits} onChange={e => setAssessment(p => ({ ...p, credits: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Skill Level</Label>
                    <select className="border rounded px-3 py-2 text-sm" value={assessment.skillLevel} onChange={e => setAssessment(p => ({ ...p, skillLevel: e.target.value as any }))}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Category / Topic</Label>
                    <Input value={assessment.category} onChange={e => setAssessment(p => ({ ...p, category: e.target.value }))} placeholder="e.g., Cybersecurity" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={assessment.description} onChange={e => setAssessment(p => ({ ...p, description: e.target.value }))} rows={3} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setActiveTab('questions')}>Save & Continue</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. Add Questions */}
          <TabsContent value="questions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Add Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea rows={3} value={questionDraft.text} onChange={e => setQuestionDraft(d => ({ ...d, text: e.target.value }))} placeholder="Enter question text..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Answer Type</Label>
                      <select className="border rounded px-3 py-2 text-sm" value={questionDraft.type} onChange={e => setQuestionDraft(d => ({ ...d, type: e.target.value as AnswerType }))}>
                        <option value="multiple-choice">Multiple choice</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="short-answer">Short answer</option>
                        <option value="scenario">Scenario-based</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input type="number" value={questionDraft.points} onChange={e => setQuestionDraft(d => ({ ...d, points: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Answer Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input placeholder="Option text" />
                        <label className="text-sm flex items-center gap-1"><input type="checkbox" /> Correct</label>
                        <Button variant="outline" size="sm"><X className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Option</Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Add Media</Label>
                    <Input type="file" accept="image/*,video/*" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={addQuestion}>+ Add Another Question</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {assessment.questions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No questions yet.</p>
                  )}
                  {assessment.questions.map((q, i) => (
                    <div key={q.id} className="p-2 border rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{i + 1}</Badge>
                        <span className="text-sm line-clamp-1">{q.text || 'Untitled question'}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeQuestion(q.id)}>Remove</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 3. Settings */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Assessment Settings</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between border rounded px-3 py-2 text-sm">Shuffle Questions
                  <input type="checkbox" checked={assessment.settings.shuffleQuestions} onChange={e => setAssessment(p => ({ ...p, settings: { ...p.settings, shuffleQuestions: e.target.checked } }))} />
                </label>
                <label className="flex items-center justify-between border rounded px-3 py-2 text-sm">Shuffle Answers
                  <input type="checkbox" checked={assessment.settings.shuffleAnswers} onChange={e => setAssessment(p => ({ ...p, settings: { ...p.settings, shuffleAnswers: e.target.checked } }))} />
                </label>
                <div className="space-y-2">
                  <Label>Time Limit (mins)</Label>
                  <Input type="number" value={assessment.settings.timeLimitMins} onChange={e => setAssessment(p => ({ ...p, settings: { ...p.settings, timeLimitMins: parseInt(e.target.value) || 0 } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Passing Score %</Label>
                  <Input type="number" value={assessment.settings.passingPercent} onChange={e => setAssessment(p => ({ ...p, settings: { ...p.settings, passingPercent: parseInt(e.target.value) || 0 } }))} />
                </div>
                <label className="flex items-center justify-between border rounded px-3 py-2 text-sm">Retake Allowed
                  <input type="checkbox" checked={assessment.settings.retakeAllowed} onChange={e => setAssessment(p => ({ ...p, settings: { ...p.settings, retakeAllowed: e.target.checked } }))} />
                </label>
              </CardContent>
            </Card>
            <div className="flex justify-end"><Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setActiveTab('preview')}>Save Settings</Button></div>
          </TabsContent>

          {/* 4. Preview */}
          <TabsContent value="preview" className="space-y-4">
            <div className="border rounded p-3 text-sm bg-muted">Assessment Preview Mode
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('questions')}>Edit Question</Button>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>Edit Settings</Button>
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Exit Preview</Button>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded overflow-hidden">
              <div className="h-full bg-orange-600" style={{ width: '0%' }} />
            </div>
            <Card>
              <CardHeader><CardTitle>{assessment.title || 'Untitled Assessment'}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {assessment.questions.slice(0, 2).map((q, i) => (
                  <div key={q.id} className="border rounded p-3">
                    <div className="font-medium">{i + 1}. {q.text || 'Sample question'}</div>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="border rounded p-2">Option A</li>
                      <li className="border rounded p-2">Option B</li>
                      <li className="border rounded p-2">Option C</li>
                    </ul>
                  </div>
                ))}
                <Button disabled className="w-full">Submit</Button>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={saveAndClose}>Save Assessment</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


