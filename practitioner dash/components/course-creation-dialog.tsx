"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Video, FileText, Link, BookOpen, Clock, Users, Upload, File, ExternalLink, GripVertical, Trash2, ChevronUp, ChevronDown, Copy, Calendar, Brain, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { QuizBuilder } from "./quiz-builder"
import { AssessmentBuilder } from "./assessment-builder"

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document' | 'quiz' | 'link' | 'assignment' | 'text' | 'ar' | 'assessment'
  content: string
  duration?: number
  description?: string
}

interface Week {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  maxStudents: number
  tier: 'free' | 'premium'
  weeks: Week[]
  tags: string[]
  thumbnail?: string
}

interface CourseCreationDialogProps {
  onCourseCreated: (course: Course) => void
  onCourseUpdated?: (course: Course) => void
  courseToEdit?: Course | null
  mode?: 'create' | 'edit'
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CourseCreationDialog({ onCourseCreated, onCourseUpdated, courseToEdit, mode = 'create', isOpen: externalIsOpen, onOpenChange }: CourseCreationDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = mode === 'edit' ? externalIsOpen : internalIsOpen
  const [course, setCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: 4,
    maxStudents: 100,
    tier: 'free',
    weeks: [],
    tags: []
  })
  const [newTag, setNewTag] = useState('')
  const [newWeekTitle, setNewWeekTitle] = useState('')
  const [newWeekDescription, setNewWeekDescription] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<{ [lessonId: string]: File | null }>({})
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false)
  const [isAssessmentBuilderOpen, setIsAssessmentBuilderOpen] = useState(false)
  const [currentQuizData, setCurrentQuizData] = useState<{ title: string; description: string; questions: any[] } | null>(null)
  const [editingQuizLesson, setEditingQuizLesson] = useState<{ weekId: string; lessonId: string } | null>(null)
  const [editingAssessmentLesson, setEditingAssessmentLesson] = useState<{ weekId: string; lessonId: string } | null>(null)
  const [courseCoverImage, setCourseCoverImage] = useState<File | null>(null)
  const [courseCoverPreview, setCourseCoverPreview] = useState<string | null>(null)

  // Handle edit mode - populate form with existing course data
  useEffect(() => {
    if (mode === 'edit' && courseToEdit) {
      console.log('Populating edit form with course:', courseToEdit)
      setCourse(courseToEdit)
    }
  }, [mode, courseToEdit])

  // Debug logging
  useEffect(() => {
    console.log('CourseCreationDialog state:', { mode, isOpen, courseToEdit: !!courseToEdit })
  }, [mode, isOpen, courseToEdit])

  // Cleanup body scroll when component unmounts
  useEffect(() => {
    return () => {
      // Restore scrolling if component unmounts while modal is open
      const scrollY = document.body.style.top
      if (document.body.style.position === 'fixed') {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
  }, [])

  console.log('CourseCreationDialog rendered, isOpen:', isOpen)

  const addWeek = () => {
    console.log('addWeek called')
    if (!newWeekTitle.trim()) return
    
    const newWeek: Week = {
      id: Date.now().toString(),
      title: newWeekTitle,
      description: newWeekDescription,
      lessons: []
    }
    
    setCourse(prev => ({
      ...prev,
      weeks: [...(prev.weeks || []), newWeek]
    }))
    
    setNewWeekTitle('')
    setNewWeekDescription('')
  }

  const addLesson = (weekId: string, type: Lesson['type']) => {
    console.log('addLesson called for week:', weekId, 'type:', type)
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: `New ${type}`,
      type,
      content: '',
      description: ''
    }

    setCourse(prev => ({
      ...prev,
      weeks: prev.weeks?.map(week => 
        week.id === weekId 
          ? { ...week, lessons: [...week.lessons, newLesson] }
          : week
      )
    }))
  }

  const updateLesson = (weekId: string, lessonId: string, field: keyof Lesson, value: any) => {
    setCourse(prev => ({
      ...prev,
      weeks: prev.weeks?.map(week => 
        week.id === weekId 
          ? {
              ...week,
              lessons: week.lessons.map(lesson => 
                lesson.id === lessonId 
                  ? { ...lesson, [field]: value }
                  : lesson
              )
            }
          : week
      )
    }))
  }

  const removeWeek = (weekId: string) => {
    setCourse(prev => ({
      ...prev,
      weeks: prev.weeks?.filter(week => week.id !== weekId)
    }))
  }

  const removeLesson = (weekId: string, lessonId: string) => {
    setCourse(prev => ({
      ...prev,
      weeks: prev.weeks?.map(week => 
        week.id === weekId 
          ? { ...week, lessons: week.lessons.filter(lesson => lesson.id !== lessonId) }
          : week
      )
    }))
  }

  const addTag = () => {
    console.log('addTag called')
    if (!newTag.trim() || course.tags?.includes(newTag.trim())) return
    
    setCourse(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }))
    setNewTag('')
  }

  const removeTag = (tag: string) => {
    setCourse(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag)
    }))
  }

  const handleSubmit = () => {
    console.log('handleSubmit called')
    if (!course.title || !course.description || course.weeks?.length === 0) {
      alert('Please fill in all required fields and add at least one week')
      return
    }

    if (mode === 'edit' && courseToEdit && onCourseUpdated) {
      // Update existing course
      const updatedCourse: Course = {
        ...course as Course,
        id: courseToEdit.id, // Keep the original ID
        weeks: course.weeks || [],
        thumbnail: courseCoverPreview || course.thumbnail
      }
      console.log('Updating course:', updatedCourse)
      onCourseUpdated(updatedCourse)
    } else {
      // Create new course
      const newCourse: Course = {
        ...course as Course,
        id: Date.now().toString(),
        weeks: course.weeks || [],
        thumbnail: courseCoverPreview || course.thumbnail
      }
      console.log('Creating new course:', newCourse)
      onCourseCreated(newCourse)
    }
    
    if (mode === 'edit' && onOpenChange) {
      onOpenChange(false)
    } else {
      setInternalIsOpen(false)
    }
    resetForm()
  }

  const resetForm = () => {
    setCourse({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      duration: 4,
      maxStudents: 100,
      tier: 'free',
      weeks: [],
      tags: []
    })
    setUploadedFiles({})
    setCourseCoverImage(null)
    setCourseCoverPreview(null)
  }

  const handleFileUpload = (weekId: string, lessonId: string, file: File | null) => {
    setUploadedFiles(prev => ({
      ...prev,
      [lessonId]: file
    }))
    
    if (file) {
      // Update lesson content with file name
      updateLesson(weekId, lessonId, 'content', file.name)
    }
  }

  const handleARLinkUpload = (weekId: string, lessonId: string, arLink: string) => {
    updateLesson(weekId, lessonId, 'content', arLink)
  }

  const handleQuizCreated = (quizData: { title: string; description: string; questions: any[] }) => {
    setCurrentQuizData(quizData)
    
    // Update the lesson content with quiz information
    if (editingQuizLesson) {
      const quizContent = `Quiz: ${quizData.title} - ${quizData.questions.length} questions`
      updateLesson(editingQuizLesson.weekId, editingQuizLesson.lessonId, 'content', quizContent)
      setEditingQuizLesson(null)
    }
    
    setIsQuizBuilderOpen(false)
  }

  const handleAssessmentSaved = (data: any) => {
    if (editingAssessmentLesson) {
      const summary = `Assessment: ${data.title || 'Untitled'} • ${data.questions?.length || 0} questions • ${data.durationMins || 0} mins`
      updateLesson(editingAssessmentLesson.weekId, editingAssessmentLesson.lessonId, 'content', summary)
      setEditingAssessmentLesson(null)
    }
    setIsAssessmentBuilderOpen(false)
  }

  const handleCourseCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      
      setCourseCoverImage(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setCourseCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeCourseCover = () => {
    setCourseCoverImage(null)
    setCourseCoverPreview(null)
  }

  const moveWeek = (weekId: string, direction: 'up' | 'down') => {
    const currentIndex = course.weeks?.findIndex(week => week.id === weekId) || 0
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex < 0 || newIndex >= (course.weeks?.length || 0)) return
    
    const newWeeks = [...(course.weeks || [])]
    const [movedWeek] = newWeeks.splice(currentIndex, 1)
    newWeeks.splice(newIndex, 0, movedWeek)
    
    setCourse(prev => ({
      ...prev,
      weeks: newWeeks
    }))
  }

  const moveLesson = (weekId: string, lessonId: string, direction: 'up' | 'down') => {
    const week = course.weeks?.find(w => w.id === weekId)
    if (!week) return
    
    const currentIndex = week.lessons.findIndex(lesson => lesson.id === lessonId)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex < 0 || newIndex >= week.lessons.length) return
    
    const newLessons = [...week.lessons]
    const [movedLesson] = newLessons.splice(currentIndex, 1)
    newLessons.splice(newIndex, 0, movedLesson)
    
    setCourse(prev => ({
      ...prev,
      weeks: prev.weeks?.map(w => 
        w.id === weekId ? { ...w, lessons: newLessons } : w
      )
    }))
  }

  const confirmRemoveWeek = (weekId: string) => {
    if (window.confirm('Are you sure you want to remove this week? All lessons in this week will be deleted.')) {
      removeWeek(weekId)
    }
  }

  const confirmRemoveLesson = (weekId: string, lessonId: string) => {
    if (window.confirm('Are you sure you want to remove this lesson?')) {
      removeLesson(weekId, lessonId)
    }
  }

  const duplicateLesson = (weekId: string, lessonId: string) => {
    const week = course.weeks?.find(w => w.id === weekId)
    if (!week) return
    
    const lesson = week.lessons.find(l => l.id === lessonId)
    if (!lesson) return
    
    const duplicatedLesson: Lesson = {
      ...lesson,
      id: Date.now().toString(),
      title: `${lesson.title} (Copy)`
    }
    
    setCourse(prev => ({
      ...prev,
      weeks: prev.weeks?.map(w => 
        w.id === weekId 
          ? { ...w, lessons: [...w.lessons, duplicatedLesson] }
          : w
      )
    }))
  }

  const duplicateWeek = (weekId: string) => {
    const week = course.weeks?.find(w => w.id === weekId)
    if (!week) return
    
    const duplicatedWeek: Week = {
      ...week,
      id: Date.now().toString(),
      title: `${week.title} (Copy)`,
      lessons: week.lessons.map(lesson => ({
        ...lesson,
        id: Date.now().toString() + Math.random(),
        title: `${lesson.title} (Copy)`
      }))
    }
    
    setCourse(prev => ({
      ...prev,
      weeks: [...(prev.weeks || []), duplicatedWeek]
    }))
  }

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'quiz': return <BookOpen className="w-4 h-4" />
      case 'assessment': return <BookOpen className="w-4 h-4" />
      case 'link': return <Link className="w-4 h-4" />
      case 'assignment': return <FileText className="w-4 h-4" />
      case 'text': return <FileText className="w-4 h-4" />
      case 'ar': return <ExternalLink className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    
    if (mode === 'edit' && onOpenChange) {
      onOpenChange(open)
    } else {
      setInternalIsOpen(open)
    }
    
    // Prevent background scrolling when modal is open
    if (open) {
      // Store current scroll position and prevent scrolling
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      // Restore scrolling
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {mode === 'create' && (
        <DialogTrigger asChild>
          <Button 
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => {
              console.log('Add Course button clicked')
              setInternalIsOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </DialogTrigger>
      )}
      {mode === 'edit' && (
        <div className="hidden" />
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'edit' ? 'Edit Course' : 'Create New Course'}
            {mode === 'edit' && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Editing
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Course Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={course.title}
                    onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={course.category} onValueChange={(value) => setCourse(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital-literacy">Digital Literacy</SelectItem>
                      <SelectItem value="computer-skills">Computer Skills</SelectItem>
                      <SelectItem value="internet-safety">Internet Safety</SelectItem>
                      <SelectItem value="mobile-tech">Mobile Technology</SelectItem>
                      <SelectItem value="software">Software Applications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={course.description}
                  onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your course"
                  rows={3}
                />
              </div>

              {/* Course Cover Image Upload */}
              <div className="space-y-2">
                <Label>Course Cover Image</Label>
                <div className="space-y-4">
                  {courseCoverPreview ? (
                    <div className="relative">
                      <img
                        src={courseCoverPreview}
                        alt="Course cover preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeCourseCover}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload course cover image</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="course-cover"
                      accept="image/*"
                      onChange={handleCourseCoverUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('course-cover')?.click()}
                      className="flex-1"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {courseCoverPreview ? 'Change Image' : 'Select Image'}
                    </Button>
                    {courseCoverPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={removeCourseCover}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={course.difficulty} onValueChange={(value: any) => setCourse(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={course.duration}
                    onChange={(e) => setCourse(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={course.maxStudents}
                    onChange={(e) => setCourse(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 0 }))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tier">Tier</Label>
                  <Select value={course.tier} onValueChange={(value: any) => setCourse(prev => ({ ...prev, tier: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {course.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-blue-200 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Course Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Week */}
              <div className="flex gap-2">
                <Input
                  value={newWeekTitle}
                  onChange={(e) => setNewWeekTitle(e.target.value)}
                  placeholder="Week title"
                />
                <Input
                  value={newWeekDescription}
                  onChange={(e) => setNewWeekDescription(e.target.value)}
                  placeholder="Week description"
                />
                <Button onClick={addWeek} variant="outline">Add Week</Button>
              </div>

              {/* Weeks */}
              <div className="space-y-4">
                {course.weeks?.map((week, weekIndex) => (
                  <Card key={week.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <CardTitle className="text-lg">Week {weekIndex + 1}: {week.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => moveWeek(week.id, 'up')}
                            variant="ghost"
                            size="sm"
                            disabled={weekIndex === 0}
                            className="text-gray-500 hover:text-gray-700"
                            title="Move week up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => moveWeek(week.id, 'down')}
                            variant="ghost"
                            size="sm"
                            disabled={weekIndex === (course.weeks?.length || 0) - 1}
                            className="text-gray-500 hover:text-gray-700"
                            title="Move week down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => duplicateWeek(week.id)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-700"
                            title="Duplicate week"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => confirmRemoveWeek(week.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            title="Remove week"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{week.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Add Lesson Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {(['video', 'document', 'quiz', 'assessment', 'link', 'assignment', 'text', 'ar'] as const).map((type) => (
                          <Button
                            key={type}
                            onClick={() => addLesson(week.id, type)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {getLessonIcon(type)}
                            Add {type}
                          </Button>
                        ))}
                      </div>

                      {/* Lessons */}
                      <div className="space-y-3">
                        {week.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="border rounded-lg p-3 bg-muted/50">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                <GripVertical className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {lessonIndex + 1}
                                </span>
                              </div>
                              {getLessonIcon(lesson.type)}
                              <Input
                                value={lesson.title}
                                onChange={(e) => updateLesson(week.id, lesson.id, 'title', e.target.value)}
                                placeholder={`${lesson.type} title`}
                                className="flex-1"
                              />
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() => moveLesson(week.id, lesson.id, 'up')}
                                  variant="ghost"
                                  size="sm"
                                  disabled={lessonIndex === 0}
                                  className="text-gray-500 hover:text-gray-700 p-1"
                                  title="Move up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => moveLesson(week.id, lesson.id, 'down')}
                                  variant="ghost"
                                  size="sm"
                                  disabled={lessonIndex === week.lessons.length - 1}
                                  className="text-gray-500 hover:text-gray-700 p-1"
                                  title="Move down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => duplicateLesson(week.id, lesson.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700 p-1"
                                  title="Duplicate lesson"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => confirmRemoveLesson(week.id, lesson.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove lesson"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {lesson.type === 'video' && (
                              <div className="space-y-2">
                                <Textarea
                                  value={lesson.content}
                                  onChange={(e) => updateLesson(week.id, lesson.id, 'content', e.target.value)}
                                  placeholder="Video URL, embed code, or video description"
                                  rows={3}
                                />
                                <Input
                                  type="number"
                                  value={lesson.duration || ''}
                                  onChange={(e) => updateLesson(week.id, lesson.id, 'duration', parseInt(e.target.value) || 0)}
                                  placeholder="Duration in minutes"
                                />
                              </div>
                            )}
                            
                            {lesson.type === 'document' && (
                              <div className="space-y-4">
                                {/* File Upload Section */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Upload Document</Label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      id={`file-${lesson.id}`}
                                      accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                                      onChange={(e) => handleFileUpload(week.id, lesson.id, e.target.files?.[0] || null)}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor={`file-${lesson.id}`}
                                      className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex-1"
                                    >
                                      <Upload className="w-4 h-4" />
                                      <span className="text-sm">
                                        {uploadedFiles[lesson.id] ? uploadedFiles[lesson.id]?.name : 'Choose file...'}
                                      </span>
                                    </label>
                                    {uploadedFiles[lesson.id] && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFileUpload(week.id, lesson.id, null)}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Supported formats: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, Images, Videos
                                  </p>
                                </div>
                                
                                {/* Document Content/Description */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Document Description</Label>
                                  <Textarea
                                    value={lesson.content}
                                    onChange={(e) => updateLesson(week.id, lesson.id, 'content', e.target.value)}
                                    placeholder="Document description or content..."
                                    rows={3}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {lesson.type === 'quiz' && (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingQuizLesson({ weekId: week.id, lessonId: lesson.id })
                                      setIsQuizBuilderOpen(true)
                                    }}
                                    className="flex-1"
                                  >
                                    <Brain className="w-4 h-4 mr-2" />
                                    {lesson.content ? 'Edit Quiz' : 'Create Quiz'}
                                  </Button>
                                  {lesson.content && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => updateLesson(week.id, lesson.id, 'content', '')}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                {lesson.content && (
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <HelpCircle className="w-4 h-4 text-blue-600" />
                                      <span className="font-medium text-blue-900">Quiz Created</span>
                                    </div>
                                    <p className="text-sm text-blue-700">
                                      {lesson.content.includes('questions') ? 'Interactive quiz with questions' : lesson.content}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {lesson.type === 'link' && (
                              <div className="space-y-2">
                                <Input
                                  value={lesson.content}
                                  onChange={(e) => updateLesson(week.id, lesson.id, 'content', e.target.value)}
                                  placeholder="Resource URL"
                                />
                                <Textarea
                                  value={lesson.description || ''}
                                  onChange={(e) => updateLesson(week.id, lesson.id, 'description', e.target.value)}
                                  placeholder="Resource description or additional notes"
                                  rows={2}
                                />
                              </div>
                            )}
                            
                            {lesson.type === 'assignment' && (
                              <div className="space-y-2">
                                <Textarea
                                  value={lesson.content}
                                  onChange={(e) => updateLesson(week.id, lesson.id, 'content', e.target.value)}
                                  placeholder="Assignment description"
                                  rows={3}
                                />
                              </div>
                            )}
                            
                            {lesson.type === 'text' && (
                              <div className="space-y-2">
                                <Textarea
                                  value={lesson.content}
                                  onChange={(e) => updateLesson(week.id, lesson.id, 'content', e.target.value)}
                                  placeholder="Text content or lesson material"
                                  rows={4}
                                />
                              </div>
                            )}

                            {lesson.type === 'assessment' && (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingAssessmentLesson({ weekId: week.id, lessonId: lesson.id })
                                      setIsAssessmentBuilderOpen(true)
                                    }}
                                    className="flex-1"
                                  >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    {lesson.content ? 'Edit Assessment' : 'Create Assessment'}
                                  </Button>
                                  {lesson.content && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => updateLesson(week.id, lesson.id, 'content', '')}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                                {lesson.content && (
                                  <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BookOpen className="w-4 h-4 text-green-600" />
                                      <span className="font-medium text-green-900">Assessment Saved</span>
                                    </div>
                                    <p className="text-sm text-green-700">
                                      {lesson.content}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {lesson.type === 'ar' && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">AR Experience URL</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={lesson.content}
                                      onChange={(e) => updateLesson(week.id, lesson.id, 'content', e.target.value)}
                                      placeholder="https://example.com/ar-experience"
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(lesson.content, '_blank')}
                                      disabled={!lesson.content.startsWith('http')}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Add a link to an AR experience, VR content, or interactive 3D content
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">AR Experience Description</Label>
                                  <Textarea
                                    value={lesson.description || ''}
                                    onChange={(e) => updateLesson(week.id, lesson.id, 'description', e.target.value)}
                                    placeholder="Describe the AR experience, what students will see, and how to interact with it..."
                                    rows={3}
                                  />
                                </div>
                              </div>
                            )}
                            
                            <Textarea
                              value={lesson.description || ''}
                              onChange={(e) => updateLesson(week.id, lesson.id, 'description', e.target.value)}
                              placeholder="Additional notes (optional)"
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
              {mode === 'edit' ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Quiz Builder Dialog */}
      <QuizBuilder
        onQuizCreated={handleQuizCreated}
        isOpen={isQuizBuilderOpen}
        onOpenChange={setIsQuizBuilderOpen}
      />

      {/* Assessment Builder Dialog */}
      <AssessmentBuilder
        open={isAssessmentBuilderOpen}
        onOpenChange={setIsAssessmentBuilderOpen}
        onSave={handleAssessmentSaved}
      />
    </Dialog>
  )
} 