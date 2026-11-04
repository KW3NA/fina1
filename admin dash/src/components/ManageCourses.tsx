import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

function CourseGrid({ courses, status, onApprove, onReject, onDelete }: { 
  courses: any[]; 
  status: string; 
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-4" style={{ color: 'inherit' }}>{status}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
        {courses.length === 0 ? (
          <div className="col-span-3 text-gray-400 italic">No courses found.</div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="bg-white rounded-md shadow-md dark:border-gray-700 flex flex-col mx-auto" style={{ minWidth: 320, maxWidth: 420 }}>
              <img 
                src={course.cover || 'https://i.pinimg.com/736x/c9/af/43/c9af431cdb9322e4ff4a43af70db96ae.jpg'} 
                alt={course.name} 
                className="h-32 w-full object-cover rounded-t-md mb-3" 
              />
              <div className="p-4 flex flex-col">
                <h3 className="font-semibold text-gray-900 text-base mb-1">{course.name}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{course.details}</p>
                <div className="text-xs text-orange-600 font-medium mb-3">By: {course.practitioner || 'Administrator'}</div>
                <div className="mt-auto flex justify-end gap-2">
                  <button className="px-4 py-2 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition" onClick={() => course.onView(course)}>View</button>
                  {onApprove && onReject && (
                    <>
                      <button className="px-3 py-2 text-xs rounded bg-green-500 text-white hover:bg-green-600 transition" onClick={() => onApprove(course.id)}>Approve</button>
                      <button className="px-3 py-2 text-xs rounded bg-red-500 text-white hover:bg-red-600 transition" onClick={() => onReject(course.id)}>Reject</button>
                    </>
                  )}
                  {onDelete && (
                    <button className="px-3 py-2 text-xs rounded bg-gray-500 text-white hover:bg-gray-600 transition" onClick={() => onDelete(course.id)}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ManageCourses({ isDarkMode }: { isDarkMode: boolean }) {
  const [viewCourse, setViewCourse] = useState<any | null>(null);
  const [approved, setApproved] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [rejected, setRejected] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'delete'>('approve');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .order('order_num', { ascending: true });

      const mapped = (coursesData || []).map(c => {
        const cModules = (modulesData || []).filter(m => m.course_id === c.id);
        return {
          id: c.id,
          name: c.title,
          cover: c.image_url,
          details: c.description,
          practitioner: c.practitioner_name || 'System Practitioner',
          category: c.competency_area || 'digital-literacy',
          difficulty: (c.level || 'beginner').toLowerCase(),
          duration: c.duration || `${c.estimated_minutes || 30} mins`,
          maxStudents: 100,
          tier: 'free',
          status: c.status,
          tags: [c.level, c.competency_area].filter(Boolean),
          weeks: cModules.length > 0 ? cModules.map((m, idx) => ({
            id: m.id,
            title: `Module ${m.order_num || idx + 1}: ${m.title}`,
            description: `${m.estimated_minutes || 10} mins`,
            lessons: [
              ...(m.video_url ? [{
                id: `v-${m.id}`,
                type: 'video',
                title: m.video_title || 'Video Lesson',
                content: m.video_url,
                duration: m.estimated_minutes
              }] : []),
              ...((m.blocks || []).map((b: any, bIdx: number) => ({
                id: `b-${m.id}-${bIdx}`,
                type: 'text',
                title: b.type?.toUpperCase() || 'INFO',
                content: b.content || b.text || ''
              }))),
              ...(m.quiz?.questions?.length ? [{
                id: `q-${m.id}`,
                type: 'quiz',
                title: `Assessment: ${m.quiz.title || m.title + ' Quiz'}`,
                content: m.quiz.questions.map((q: any, qi: number) => 
                  `Q${qi + 1}: ${q.question}\n` +
                  (q.options || []).map((opt: string, oi: number) => `   [${oi === q.correctIndex ? '✓' : ' '}] ${String.fromCharCode(65 + oi)}. ${opt}`).join('\n') +
                  (q.explanation ? `\n💡 ${q.explanation}` : '')
                ).join('\n\n')
              }] : [])
            ]
          })) : []
        };
      });

      setApproved(mapped.filter(c => c.status === 'approved'));
      setPending(mapped.filter(c => c.status === 'pending'));
      setRejected(mapped.filter(c => c.status === 'rejected'));
    } catch (err: any) {
      console.error('Error fetching courses from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleApproveCourse = async (courseId: string) => {
    const course = pending.find(c => c.id === courseId);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: 'approved', is_published: true })
        .eq('id', courseId);

      if (error) throw error;

      setApproved(prev => [...prev, { ...course, status: 'approved' }]);
      setPending(prev => prev.filter(c => c.id !== courseId));
      setModalMessage(`Course "${course?.name || ''}" has been approved.`);
      setModalType('success');
      setModalAction('approve');
      setShowModal(true);
    } catch (err: any) {
      console.error('Failed to approve course:', err);
      setModalMessage(`Error approving course: ${err.message}`);
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleRejectCourse = async (courseId: string) => {
    const course = pending.find(c => c.id === courseId);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: 'rejected', is_published: false })
        .eq('id', courseId);

      if (error) throw error;

      setRejected(prev => [...prev, { ...course, status: 'rejected' }]);
      setPending(prev => prev.filter(c => c.id !== courseId));
      setModalMessage(`Course "${course?.name || ''}" has been rejected.`);
      setModalType('error');
      setModalAction('reject');
      setShowModal(true);
    } catch (err: any) {
      console.error('Failed to reject course:', err);
      setModalMessage(`Error rejecting course: ${err.message}`);
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    const course = approved.find(c => c.id === courseId) || rejected.find(c => c.id === courseId);
    if (course) {
      setCourseToDelete(course);
      setShowConfirmDelete(true);
    }
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      try {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', courseToDelete.id);

        if (error) throw error;

        setApproved(prev => prev.filter(c => c.id !== courseToDelete.id));
        setRejected(prev => prev.filter(c => c.id !== courseToDelete.id));
        setModalMessage(`Course "${courseToDelete.name}" has been deleted.`);
        setModalType('success');
        setModalAction('delete');
        setShowModal(true);
      } catch (err: any) {
        console.error('Failed to delete course:', err);
        setModalMessage(`Error deleting course: ${err.message}`);
        setModalType('error');
        setShowModal(true);
      } finally {
        setShowConfirmDelete(false);
        setCourseToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setCourseToDelete(null);
  };

  const renderTags = (tags: string[] | undefined) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {(tags && tags.length > 0) ? tags.map(tag => (
        <span key={tag} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs">{tag}</span>
      )) : <span className="text-gray-400 italic">Not provided</span>}
    </div>
  );

  const renderLessonContent = (lesson: any) => {
    switch (lesson.type) {
      case 'video':
        if (lesson.content && /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(lesson.content)) {
          const embedUrl = lesson.content.replace('watch?v=', 'embed/');
          return (
            <div className="mt-2 rounded-lg border p-4">
              <iframe
                src={embedUrl}
                title={lesson.title}
                className="w-full h-48 rounded"
                allowFullScreen
              />
              <div className="mt-2 flex gap-2">
                <a href={lesson.content} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Open in YouTube</a>
                <button className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded" onClick={() => navigator.clipboard.writeText(lesson.content)}>Copy link</button>
              </div>
            </div>
          );
        } else if (lesson.content) {
          return (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-blue-600 underline break-all">{lesson.content}</span>
              <a href={lesson.content} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Open</a>
            </div>
          );
        }
        return <span className="text-gray-400 italic">Not provided</span>;
      case 'quiz':
        return (
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900 whitespace-pre-line font-mono leading-relaxed">
            {lesson.content}
          </div>
        );
      case 'text':
      default:
        return lesson.content ? <div className="mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-line">{lesson.content}</div> : <span className="text-gray-400 italic">Not provided</span>;
    }
  };

  const CourseModal = ({ course, onClose, onDelete }: { 
    course: any, 
    onClose: () => void,
    onDelete?: (id: string) => void
  }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-[#f7f7fa] rounded-md shadow-lg max-w-2xl w-full mx-4 max-h-[100vh] overflow-y-auto z-10 p-6">
        <button className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded hover:bg-orange-600" onClick={onClose}>Close</button>
        <div className="flex flex-col items-center mb-6">
          {course.cover ? (
            <img src={course.cover} alt={course.name} className="h-40 w-full object-cover rounded-lg mb-4" />
          ) : (
            <div className="h-40 w-full flex items-center justify-center bg-gray-100 rounded-lg mb-4 text-gray-400">No cover image</div>
          )}
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">{course.name || 'Not provided'}</h2>
          <p className="text-base text-gray-600 mb-2 text-center">{course.details || 'Not provided'}</p>
          <p className="text-sm text-blue-600 font-medium text-center mb-4">Created by: {course.practitioner || 'Unknown Practitioner'}</p>
        </div>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 px-5">
          <div><span className="font-semibold">Category:</span> {course.category || <span className="text-gray-400 italic">Not provided</span>}</div>
          <div><span className="font-semibold">Difficulty:</span> {course.difficulty || <span className="text-gray-400 italic">Not provided</span>}</div>
          <div><span className="font-semibold">Duration:</span> {course.duration || <span className="text-gray-400 italic">Not provided</span>}</div>
          <div><span className="font-semibold">Tier:</span> {course.tier || <span className="text-gray-400 italic">Free</span>}</div>
        </div>
        <div className="mb-6 px-5">
          <span className="font-semibold">Tags:</span>
          {renderTags(course.tags)}
        </div>
        <div className="px-5 mb-6">
          <h3 className="text-lg font-bold mb-2">Course Modules & Lessons</h3>
          {course.weeks && course.weeks.length > 0 ? course.weeks.map((week: any, wIdx: number) => (
            <div key={week.id || wIdx} className="mb-6 bg-white p-4 rounded-lg border">
              <div className="mb-2">
                <span className="font-semibold text-gray-900">{week.title}</span>
              </div>
              <div className="mb-2 text-gray-500 text-sm">{week.description}</div>
              <div className="space-y-3">
                {week.lessons && week.lessons.length > 0 ? week.lessons.map((lesson: any, lIdx: number) => (
                  <div key={lesson.id || lIdx} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                      <span className="px-2 py-0.5 rounded bg-gray-200 text-xs font-semibold text-gray-800">{lesson.type}</span>
                      <span className="font-medium text-sm text-gray-900">{lesson.title}</span>
                    </div>
                    {renderLessonContent(lesson)}
                  </div>
                )) : <div className="text-gray-400 italic">No lessons in this module</div>}
              </div>
            </div>
          )) : <div className="text-gray-400 italic">No modules attached</div>}
        </div>
        
        {onDelete && (
          <div className="px-5 pb-5">
            <button
              onClick={() => {
                onDelete(course.id);
                onClose();
              }}
              className="w-full py-2 px-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Delete Course
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const courseGridProps = (courses: any[]) => courses.map(course => ({ ...course, onView: setViewCourse }));

  return (
    <div className={`max-w-10xl mx-auto py-8 ${isDarkMode ? 'text-white' : 'text-black'}`}>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading courses from Supabase...</div>
      ) : (
        <>
          <CourseGrid 
            courses={courseGridProps(approved)} 
            status="Approved Courses" 
            onDelete={handleDeleteCourse}
          />
          <CourseGrid 
            courses={courseGridProps(pending)} 
            status="Pending Approval" 
            onApprove={handleApproveCourse}
            onReject={handleRejectCourse}
          />
          <CourseGrid 
            courses={courseGridProps(rejected)} 
            status="Rejected" 
          />
        </>
      )}

      {viewCourse && (
        <CourseModal 
          course={viewCourse} 
          onClose={() => setViewCourse(null)} 
          onDelete={approved.some(c => c.id === viewCourse.id) ? handleDeleteCourse : undefined}
        />
      )}

      {/* Approval/Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6 z-10">
            <div className="flex items-center justify-center mb-4">
              {modalType === 'success' ? (
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
            </div>
            <h3 className={`text-lg font-semibold text-center mb-2 ${modalType === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {modalAction === 'approve' ? 'Course Approved' : modalAction === 'reject' ? 'Course Rejected' : 'Course Deleted'}
            </h3>
            <p className="text-gray-600 text-center mb-6">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className={`w-full py-2 px-4 rounded-lg font-semibold text-white ${
                modalType === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={cancelDelete} />
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6 z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2 text-yellow-800">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete the course "{courseToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2 px-4 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 px-4 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
