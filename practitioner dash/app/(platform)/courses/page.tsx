"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, Star, BookOpen, Clock, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CourseCreationDialog } from "@/components/course-creation-dialog"
import { CourseDetailView } from "@/components/course-detail-view"
import { supabase } from "@/lib/supabase"

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*, modules(*)')
        .order('created_at', { ascending: false })

      if (error) throw error

      const mapped: Course[] = (coursesData || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description || '',
        category: c.competency_area || 'digital-literacy',
        difficulty: ((c.level || 'beginner').toLowerCase()) as 'beginner' | 'intermediate' | 'advanced',
        duration: c.estimated_minutes ? Math.ceil(c.estimated_minutes / 60) : 1,
        maxStudents: 100,
        tier: 'free' as const,
        thumbnail: c.image_url || undefined,
        tags: [c.level, c.competency_area, c.status].filter(Boolean) as string[],
        weeks: (c.modules || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          description: `${m.estimated_minutes ?? 10} min`,
          lessons: [
            ...(m.video_url ? [{
              id: `v-${m.id}`,
              title: m.video_title || 'Video Lesson',
              type: 'video' as const,
              content: m.video_url,
              duration: m.estimated_minutes,
            }] : []),
            ...((m.blocks || []).map((b: any, i: number) => ({
              id: `b-${m.id}-${i}`,
              title: (b.type || 'Block').toUpperCase(),
              type: 'text' as const,
              content: b.content || b.text || '',
            }))),
            ...(m.quiz?.questions?.length ? [{
              id: `q-${m.id}`,
              title: `Quiz: ${m.quiz.title || m.title + ' Knowledge Check'}`,
              type: 'quiz' as const,
              content: m.quiz.questions.map((q: any, qi: number) => 
                `Q${qi + 1}: ${q.question}\n` +
                (q.options || []).map((opt: string, oi: number) => `   [${oi === q.correctIndex ? '✓' : ' '}] ${String.fromCharCode(65 + oi)}. ${opt}`).join('\n') +
                (q.explanation ? `\n💡 Explanation: ${q.explanation}` : '')
              ).join('\n\n'),
              duration: 10,
              description: `${m.quiz.questions.length} questions • Passing score: ${m.quiz.passingScore || 70}%`,
            }] : []),
          ],
        })),
      }))

      setCourses(mapped)
    } catch (err) {
      console.error('Error fetching courses from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  const handleCourseCreated = (newCourse: Course) => {
    setCourses(prev => [newCourse, ...prev])
  }

  const handleCourseDeleted = async (courseId: string) => {
    try {
      await supabase.from('courses').delete().eq('id', courseId)
      setCourses(prev => prev.filter(course => course.id !== courseId))
    } catch (err) {
      console.error('Error deleting course:', err)
    }
  }

  const handleCourseUpdated = (updatedCourse: Course) => {
    setCourses(prev => prev.map(course =>
      course.id === updatedCourse.id ? updatedCourse : course
    ))
    setEditingCourse(null)
  }

  const handleCourseDuplicated = (courseToDuplicate: Course) => {
    const duplicatedCourse: Course = {
      ...courseToDuplicate,
      id: Date.now().toString(),
      title: `${courseToDuplicate.title} (Copy)`,
    }
    setCourses(prev => [duplicatedCourse, ...prev])
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
    const colors: Record<string, string> = {
      'digital-literacy': 'bg-blue-100 text-blue-800',
      'using_devices': 'bg-blue-100 text-blue-800',
      'getting_online': 'bg-purple-100 text-purple-800',
      'finding_judging_info': 'bg-indigo-100 text-indigo-800',
      'staying_safe': 'bg-green-100 text-green-800',
      'doing_things_online': 'bg-orange-100 text-orange-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getTotalLessons = (course: Course) => {
    return course.weeks.reduce((total, week) => total + week.lessons.length, 0)
  }

  const getTotalDuration = (course: Course) => {
    return course.weeks.reduce((total, week) =>
      total + week.lessons.reduce((weekTotal, lesson) => weekTotal + (lesson.duration || 0), 0), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <CourseCreationDialog onCourseCreated={handleCourseCreated} />
      </div>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading courses from Supabase…</div>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No courses found. Create your first course above.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-card p-6 rounded-xl border transition-all duration-300 hover:shadow-lg">
            <div className="space-y-4">
              {/* Course Cover Image */}
              {course.thumbnail && (
                <div className="w-full h-32 rounded-lg overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Course Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(course.category)}>
                      {course.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    className="p-1 hover:bg-muted rounded"
                    onClick={() => setEditingCourse(course)}
                    title="Edit Course"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-muted rounded text-blue-500"
                    onClick={() => handleCourseDuplicated(course)}
                    title="Duplicate Course"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-muted rounded text-red-500"
                    onClick={() => handleCourseDeleted(course.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Course Description */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              </div>

              {/* Course Stats */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{course.duration}h</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">Lessons:</span>
                  <span className="font-medium">{getTotalLessons(course)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-muted-foreground">Total Time:</span>
                  <span className="font-medium">{getTotalDuration(course)} min</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Tier */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {course.tier === 'free' ? 'Free' : 'Premium'}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">4.8</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setSelectedCourse(course)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEditingCourse(course)}
                >
                  Edit Course
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail View Modal */}
      {selectedCourse && (
        <CourseDetailView
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {/* Course Edit Dialog */}
      {editingCourse && (
        <CourseCreationDialog
          mode="edit"
          courseToEdit={editingCourse}
          onCourseCreated={() => { }}
          onCourseUpdated={handleCourseUpdated}
          isOpen={!!editingCourse}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCourse(null)
            }
          }}
        />
      )}
    </div>
  )
}
