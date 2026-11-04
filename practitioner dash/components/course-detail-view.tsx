"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Video, FileText, Link, BookOpen, Clock, Users, Star, Calendar, Tag, DollarSign, BarChart3, Plus, Download, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document' | 'quiz' | 'link' | 'assignment' | 'text' | 'ar'
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

interface CourseDetailViewProps {
  course: Course
  onClose: () => void
}

export function CourseDetailView({ course, onClose }: CourseDetailViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Prevent background scrolling when modal is open
  useEffect(() => {
    // Store current scroll position and prevent scrolling
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    
    return () => {
      // Restore scrolling
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [])

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'quiz': return <BookOpen className="w-4 h-4" />
      case 'link': return <Link className="w-4 h-4" />
      case 'assignment': return <FileText className="w-4 h-4" />
      case 'text': return <FileText className="w-4 h-4" />
      case 'ar': return <ExternalLink className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'digital-literacy': 'bg-blue-100 text-blue-800',
      'computer-skills': 'bg-purple-100 text-purple-800',
      'internet-safety': 'bg-green-100 text-green-800',
      'mobile-tech': 'bg-orange-100 text-orange-800',
      'software': 'bg-indigo-100 text-indigo-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const totalLessons = course.weeks.reduce((total, week) => total + week.lessons.length, 0)
  const totalDuration = course.weeks.reduce((total, week) => 
    total + week.lessons.reduce((weekTotal, lesson) => weekTotal + (lesson.duration || 0), 0), 0
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6">
          {/* Course Cover Image */}
          {course.thumbnail && (
            <div className="w-full h-48 rounded-lg overflow-hidden mb-6">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-2">{course.description}</p>
            </div>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {/* TODO: Add lesson functionality */}}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {/* TODO: Add week functionality */}}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Week
              </Button>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-2xl font-bold">{course.duration} weeks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Lessons</p>
                        <p className="text-2xl font-bold">{totalLessons}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Time</p>
                        <p className="text-2xl font-bold">{totalDuration}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Max Students</p>
                        <p className="text-2xl font-bold">{course.maxStudents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <Badge className={getCategoryColor(course.category)}>
                        {course.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Difficulty</span>
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tier</span>
                      <span className="font-semibold">
                        {course.tier === 'free' ? 'Free' : 'Premium'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-6">
              <div className="space-y-4">
                {course.weeks.map((week, weekIndex) => (
                  <Card key={week.id} className="border-2">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {weekIndex + 1}
                        </span>
                        {week.title}
                      </CardTitle>
                      <p className="text-muted-foreground">{week.description}</p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {week.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {getLessonIcon(lesson.type)}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold">
                                    {lessonIndex + 1}. {lesson.title}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    {lesson.duration && (
                                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration}min
                                      </span>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {lesson.type}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {lesson.description && (
                                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                )}

                                {lesson.type === 'video' && lesson.content && (
                                  <div className="bg-gray-50 rounded-lg p-3 border">
                                    {lesson.content.startsWith('http') ? (
                                      <div className="space-y-2">
                                        <a 
                                          href={lesson.content} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                        >
                                          <Video className="w-3 h-3" />
                                          Watch Video
                                        </a>
                                        <p className="text-sm text-muted-foreground">{lesson.content}</p>
                                      </div>
                                    ) : (
                                      <p className="text-sm">{lesson.content}</p>
                                    )}
                                  </div>
                                )}

                                {lesson.type === 'document' && lesson.content && (
                                  <div className="space-y-3">
                                    {/* File Download Section */}
                                    {lesson.content && !lesson.content.startsWith('http') && (
                                      <div className="bg-gray-50 rounded-lg p-3 border">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <File className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium">{lesson.content}</span>
                                          </div>
                                          <Button variant="outline" size="sm">
                                            <Download className="w-3 h-3 mr-1" />
                                            Download
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* AR Link Section */}
                                    {lesson.content.startsWith('http') && (
                                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <ExternalLink className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium">AR Experience</span>
                                          </div>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => window.open(lesson.content, '_blank')}
                                          >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            Open AR
                                          </Button>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-1 break-all">{lesson.content}</p>
                                      </div>
                                    )}
                                    
                                    {/* Document Description */}
                                    {lesson.description && (
                                      <div className="bg-gray-50 rounded-lg p-3 border">
                                        <p className="text-sm">{lesson.description}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {lesson.type === 'quiz' && lesson.content && (
                                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    {lesson.content.startsWith('http') ? (
                                      <div className="space-y-2">
                                        <a 
                                          href={lesson.content} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                        >
                                          <BookOpen className="w-3 h-3" />
                                          Take Quiz
                                        </a>
                                        <p className="text-sm text-muted-foreground">{lesson.content}</p>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-blue-900 whitespace-pre-line leading-relaxed font-mono bg-white p-3 rounded border border-blue-100">{lesson.content}</div>
                                    )}
                                  </div>
                                )}

                                {lesson.type === 'link' && lesson.content && (
                                  <div className="space-y-2">
                                    {lesson.content.startsWith('http') && (
                                      <a 
                                        href={lesson.content} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                                      >
                                        <Link className="w-3 h-3" />
                                        Open Resource
                                      </a>
                                    )}
                                    {lesson.description && (
                                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                    )}
                                  </div>
                                )}

                                {lesson.type === 'assignment' && lesson.content && (
                                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                    <p className="text-sm text-green-800">{lesson.content}</p>
                                  </div>
                                )}

                                {lesson.type === 'text' && lesson.content && (
                                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                    <p className="text-sm text-purple-800">{lesson.content}</p>
                                  </div>
                                )}

                                {lesson.type === 'ar' && lesson.content && (
                                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <ExternalLink className="w-5 h-5 text-purple-600" />
                                        <span className="font-medium text-purple-800">AR Experience</span>
                                      </div>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => window.open(lesson.content, '_blank')}
                                        className="bg-purple-100 hover:bg-purple-200 border-purple-300"
                                      >
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Launch AR
                                      </Button>
                                    </div>
                                    <p className="text-sm text-purple-700 mb-2 break-all">{lesson.content}</p>
                                    {lesson.description && (
                                      <p className="text-xs text-purple-600">{lesson.description}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Videos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-red-500" />
                      Video Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.weeks.flatMap(week => 
                        week.lessons.filter(lesson => lesson.type === 'video')
                      ).map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            {lesson.duration && (
                              <p className="text-sm text-muted-foreground">{lesson.duration} minutes</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            Watch
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      Documents & Materials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.weeks.flatMap(week => 
                        week.lessons.filter(lesson => lesson.type === 'document')
                      ).map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground">{lesson.description}</p>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AR Experiences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-purple-500" />
                      AR Experiences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.weeks.flatMap(week => 
                        week.lessons.filter(lesson => lesson.type === 'ar')
                      ).map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-purple-500" />
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              {lesson.description && (
                                <p className="text-sm text-muted-foreground">{lesson.description}</p>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(lesson.content, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Launch AR
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quizzes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-500" />
                      Quizzes & Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.weeks.flatMap(week => 
                        week.lessons.filter(lesson => lesson.type === 'quiz')
                      ).map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            Take Quiz
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* External Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="w-5 h-5 text-purple-500" />
                      External Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.weeks.flatMap(week => 
                        week.lessons.filter(lesson => lesson.type === 'link')
                      ).map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            Visit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Text Lessons */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      Text Lessons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.weeks.flatMap(week => 
                        week.lessons.filter(lesson => lesson.type === 'text')
                      ).map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            Read
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.weeks.flatMap(week => 
                        week.lessons.filter(lesson => lesson.type === 'assignment')
                      ).map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                      Course Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Weeks Completed</span>
                        <span className="font-semibold">0 / {course.weeks.length}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '0%' }} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Lessons Completed</span>
                        <span className="font-semibold">0 / {totalLessons}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      Time Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total Time Spent</span>
                        <span className="font-semibold">0 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Average per Week</span>
                        <span className="font-semibold">0 hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Estimated Completion</span>
                        <span className="font-semibold">Not started</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 