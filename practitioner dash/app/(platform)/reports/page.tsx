"use client"

import { useState } from "react"
import { Download, Eye, RefreshCw, CheckCircle, X } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const router = useRouter()

  const trendData = [
    { month: "Jan", users: 2400, completion: 78 },
    { month: "Feb", users: 2800, completion: 82 },
    { month: "Mar", users: 3200, completion: 85 },
    { month: "Apr", users: 3800, completion: 88 },
    { month: "May", users: 4200, completion: 91 },
    { month: "Jun", users: 4600, completion: 89 },
  ]

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    }, 2000)
  }

  const handleGeneratePDF = async () => {
    try {
      setIsPdfGenerating(true)
      // Add pdf-export class to body
      if (typeof window !== 'undefined') {
        document.body.classList.add('pdf-export')
      }
      // Navigate to dashboard temporarily
      router.push('/dashboard')
      // Wait for dashboard to load
      await new Promise(resolve => setTimeout(resolve, 1000))
      const dashboardElement = document.querySelector('[data-dashboard-export]')
      if (!dashboardElement) {
        console.error('Dashboard element not found')
        setIsPdfGenerating(false)
        if (typeof window !== 'undefined') {
          document.body.classList.remove('pdf-export')
        }
        return
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const margin = 40
      let currentY = margin

      // Add header with logo placeholder and date
      pdf.setFillColor(247, 115, 22) // Orange color
      pdf.rect(0, 0, pdfWidth, 60, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.text('E-Literacy Platform', margin, 35)
      pdf.setFontSize(12)
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      pdf.text(today, pdfWidth - margin, 35, { align: 'right' })
      
      currentY = 80 // Start content after header

      // Cover page
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(28)
      pdf.text('Practitioner Dashboard', pdfWidth / 2, currentY, { align: 'center' })
      currentY += 30
      pdf.setFontSize(22)
      pdf.text('Analytics Report', pdfWidth / 2, currentY, { align: 'center' })
      currentY += 40
      
      // Add report date
      pdf.setFontSize(14)
      pdf.text(`Generated on: ${today}`, pdfWidth / 2, currentY, { align: 'center' })

      // Add Last Login Summary page
      pdf.addPage()
      
      // Add header to new page
      pdf.setFillColor(247, 115, 22)
      pdf.rect(0, 0, pdfWidth, 60, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.text('E-Literacy Platform', margin, 35)
      currentY = 80

      // Add Last Login Summary
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(20)
      pdf.text('Session Summary', margin, currentY)
      currentY += 30

      // Get last login element and data
      const lastLoginElement = document.querySelector('.bg-card.p-6.rounded-xl.border.mb-6')
      if (lastLoginElement) {
        // Format the last login time
        const lastLogin = new Date()
        lastLogin.setHours(lastLogin.getHours() - 3) // Mock: 3 hours ago
        const formatDate = (date: Date) => {
          return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }

        // Add last login information
        pdf.setFontSize(14)
        pdf.text('Last Login Details', margin, currentY)
        currentY += 20

        pdf.setFontSize(12)
        const loginText = `Last login was on ${formatDate(lastLogin)}`
        pdf.text(loginText, margin, currentY)
        currentY += 30

        // Add activity summary
        pdf.setFontSize(14)
        pdf.text('Activity Since Last Login:', margin, currentY)
        currentY += 20

        // Add statistics in a grid layout
        const stats = [
          { value: '12', label: 'New Learners', color: '#f97316' },
          { value: '8', label: 'Course Completions', color: '#10b981' },
          { value: '95%', label: 'Average Progress', color: '#3b82f6' }
        ]

        const statWidth = (pdfWidth - (margin * 2)) / 3
        stats.forEach((stat, index) => {
          const xPos = margin + (statWidth * index)
          
          // Add stat value
          pdf.setFontSize(24)
          pdf.setTextColor(stat.color)
          pdf.text(stat.value, xPos + (statWidth / 2), currentY, { align: 'center' })
          
          // Add stat label
          pdf.setFontSize(12)
          pdf.setTextColor(128, 128, 128)
          pdf.text(stat.label, xPos + (statWidth / 2), currentY + 20, { align: 'center' })
        })
      }

      // Capture and add each chart section
      const sections = [
        { selector: '.literacy-chart', title: 'Literacy Level Distribution' },
        { selector: '.age-chart', title: 'Age Demographics' },
        { selector: '.heatmap-chart', title: 'Learning Activity Heatmap' },
        { selector: '.trend-chart', title: 'User Growth & Completion Trends' }
      ]

      for (const section of sections) {
        const element = dashboardElement.querySelector(section.selector)
        if (element) {
          // Start each chart on a new page
          pdf.addPage()
          
          // Add header to new page
          pdf.setFillColor(247, 115, 22)
          pdf.rect(0, 0, pdfWidth, 60, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(24)
          pdf.text('E-Literacy Platform', margin, 35)
          currentY = 80

          // Add section title
          pdf.setFontSize(20)
          pdf.setTextColor(0, 0, 0)
          pdf.text(section.title, margin, currentY)
          currentY += 30

          // Force white background and black text for charts during capture
          const charts = element.querySelectorAll('.recharts-text')
          charts.forEach((chart: any) => {
            chart.style.fill = '#000000'
          })
          element.style.backgroundColor = '#ffffff'
          element.style.padding = '20px'
          
          // Capture and add chart
          const canvas = await html2canvas(element as HTMLElement, {
            backgroundColor: '#ffffff',
            scale: 2, // Increase quality
          })
          const imgData = canvas.toDataURL('image/png')
          const imgWidth = pdfWidth - (margin * 2)
          const imgHeight = (canvas.height * imgWidth) / canvas.width
          
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight)
          currentY += imgHeight + 30

          // Add chart insights
          pdf.setFontSize(14)
          pdf.setTextColor(247, 115, 22)
          pdf.text('Analysis:', margin, currentY)
          currentY += 15
          
          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          const insights = getChartInsights(section.selector)
          const splitInsights = pdf.splitTextToSize(insights, imgWidth)
          pdf.text(splitInsights, margin, currentY)
        }
      }

      // Add footer with page numbers
      const pageCount = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(10)
        pdf.setTextColor(128, 128, 128)
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth / 2, pdfHeight - 20, { align: 'center' })
      }

      // Save PDF and show notification
      pdf.save('practitioner-report.pdf')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      
      // Remove pdf-export class from body
      if (typeof window !== 'undefined') {
        document.body.classList.remove('pdf-export')
      }
      
      router.push('/reports')
    } catch (error) {
      console.error('Error generating PDF:', error)
      if (typeof window !== 'undefined') {
        document.body.classList.remove('pdf-export')
      }
    } finally {
      setIsPdfGenerating(false)
    }
  }

  const getChartInsights = (selector: string) => {
    switch (selector) {
      case '.literacy-chart':
        return 'The Literacy Level Distribution shows a strong base of beginner learners, but also a healthy progression to intermediate and advanced levels. The high number of beginners suggests ongoing outreach is effective, but the notable growth in advanced learners indicates successful upskilling. Continued support for beginners and advanced content for progressing users will sustain this trend.'
      case '.age-chart':
        return 'The Age Demographics reveal that the 26-35 age group is the most engaged, followed closely by 18-25 and 46+. This suggests the platform appeals to both young adults and older learners. Tailoring content to these groups, while investigating lower engagement in the 36-45 range, could further boost participation.'
      case '.heatmap-chart':
        return 'The Learning Activity Heatmap highlights peak engagement during mid-morning and mid-afternoon hours, especially on Wednesdays and Thursdays. These are optimal times for live sessions or new content releases. Lower activity on Fridays and late afternoons suggests opportunities for targeted engagement.'
      case '.trend-chart':
        return 'User Growth & Completion Trends show consistent increases in both users and course completions, with a slight dip in June. This positive trend reflects effective program delivery, but the June dip may warrant a review of content or outreach during that period.'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Report generated successfully!</span>
            <button onClick={() => setShowNotification(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div id="report-content" className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <Button onClick={handleRefresh} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Generating..." : "Generate Report"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Monthly Progress Report</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive analysis of learning progress and engagement metrics.
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleGeneratePDF}
              disabled={isPdfGenerating}
            >
              <Download className="w-4 h-4 mr-2" />
              {isPdfGenerating ? "Generating PDF..." : "Download Report PDF"}
            </Button>
          </div>

          <div className="bg-card p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">User Engagement Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed breakdown of user behavior and course completion rates.
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          </div>

          <div className="bg-card p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">Performance Dashboard</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Real-time performance metrics and key performance indicators.
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              <Eye className="w-4 h-4 mr-2" />
              View Online
            </Button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-6">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
