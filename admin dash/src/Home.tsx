// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabase';
import * as echarts from 'echarts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faFileAlt, 
  faLightbulb, 
  faCog, 
  faSignOutAlt, 
  faBell, 
  faSun, 
  faMoon, 
  faChevronLeft, 
  faChevronRight, 
  faSyncAlt, 
  faEllipsisV, 
  faDownload, 
  faFilter, 
  faArrowUp, 
  faUsers, 
  faStar, 
  faStarHalfAlt, 
  faAward, 
  faTimes, 
  faChevronDown 
} from '@fortawesome/free-solid-svg-icons';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import Settings from './components/Settings.tsx';
import PDFReport from './components/PDFReport.tsx';
import UserInsightsMap from './components/UserInsightsMap';
import ManageCourses from './components/ManageCourses';
import ManageUsers from './components/ManageUsers';

// Type definitions
type NavItem = "Dashboard" | "Reports" | "User Insights" | "Settings" | "Manage Courses";

interface HomeProps {
  onLogout: () => void;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | '';
}

interface UserProfile {
    name: string;
    role: string;
    lastLogin: string;
    avatar: string;
}

interface Stats {
    totalUsers: number;
    beginnerLevel: number;
    intermediateLevel: number;
    advancedLevel: number;
}

const sidebarGradientColors = [
  '#EC643A', '#EB6937', '#EA6E34', '#E97331', '#E8772E', '#E77C2B', '#E68128'
];
const newGradientStyle = {
  background: `linear-gradient(to bottom, ${sidebarGradientColors.join(', ')})`,
};

const Home: React.FC<HomeProps> = ({ onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Auto-collapse sidebar when not hovered
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const handleMouseEnter = () => setIsMenuCollapsed(false);
    const handleMouseLeave = () => setIsMenuCollapsed(true);
    sidebar.addEventListener('mouseenter', handleMouseEnter);
    sidebar.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      sidebar.removeEventListener('mouseenter', handleMouseEnter);
      sidebar.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  const [selectedProvince, setSelectedProvince] = useState('All Provinces');
  const [selectedAge, setSelectedAge] = useState('All Ages');
  const [selectedSkill, setSelectedSkill] = useState('All Levels');
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeNav, setActiveNav] = useState<NavItem>('Dashboard');
  const [profileImage, setProfileImage] = useState("https://public.readdy.ai/ai/img_res/d1dc43f1807fb29c90e715375bb00667.jpg");
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const barChartInstance = useRef<echarts.ECharts | null>(null);
  const pieChartInstance = useRef<echarts.ECharts | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfReportRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<NotificationState>({ show: false, message: '', type: '' });
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [hoveredDropdown, setHoveredDropdown] = useState<{ type: string, value: string } | null>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const lineChartInstance = useRef<echarts.ECharts | null>(null);
  const [route, setRoute] = useState(window.location.hash);
  const [lastLogin, setLastLogin] = useState<string>('');

  // Set last login time when component mounts (simulating login time)
  useEffect(() => {
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    setLastLogin(formattedTime);
  }, []);

  const navIcons: Record<NavItem, string> = {
    "Dashboard": "chart-line",
    "Reports": "file-alt",
    "User Insights": "lightbulb",
    "Settings": "cog"
  };

  const userProfile: UserProfile = {
    name: 'Naledi Mokoena',
    role: 'Education Administrator',
    lastLogin: lastLogin,
    avatar: 'https://public.readdy.ai/ai/img_res/d1dc43f1807fb29c90e715375bb00667.jpg',
  };

  // ── Supabase-backed stats ──────────────────────────────────────────────────
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    beginnerLevel: 0,
    intermediateLevel: 0,
    advancedLevel: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('province_metrics')
        .select('learner_count, beginner_count, intermediate_count, advanced_count');
      if (error) throw error;
      const totals = (data || []).reduce(
        (acc, row) => ({
          totalUsers: acc.totalUsers + (row.learner_count || 0),
          beginnerLevel: acc.beginnerLevel + (row.beginner_count || 0),
          intermediateLevel: acc.intermediateLevel + (row.intermediate_count || 0),
          advancedLevel: acc.advancedLevel + (row.advanced_count || 0),
        }),
        { totalUsers: 0, beginnerLevel: 0, intermediateLevel: 0, advancedLevel: 0 }
      );
      setStats(totals);
    } catch (err) {
      console.error('Failed to fetch stats from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  // ──────────────────────────────────────────────────────────────────────────

  const initializeCharts = () => {
    if (activeNav !== 'Dashboard') return;

    // Initialize Bar Chart
    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.dispose();
      }
      barChartInstance.current = echarts.init(barChartRef.current);
      const barOption: echarts.EChartsOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDarkMode ? '#555' : '#ddd',
          textStyle: {
            color: isDarkMode ? '#fff' : '#333'
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '10%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Beginner', 'Intermediate', 'Advanced'],
          axisLabel: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            fontSize: 12
          },
          axisLine: {
            lineStyle: {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
            }
          },
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        series: [{
          data: [8923, 10234, 5410],
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: sidebarGradientColors[0] },
              { offset: 0.16, color: sidebarGradientColors[1] },
              { offset: 0.33, color: sidebarGradientColors[2] },
              { offset: 0.5, color: sidebarGradientColors[3] },
              { offset: 0.66, color: sidebarGradientColors[4] },
              { offset: 0.83, color: sidebarGradientColors[5] },
              { offset: 1, color: sidebarGradientColors[6] }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: sidebarGradientColors[0] },
                { offset: 0.16, color: sidebarGradientColors[1] },
                { offset: 0.33, color: sidebarGradientColors[2] },
                { offset: 0.5, color: sidebarGradientColors[3] },
                { offset: 0.66, color: sidebarGradientColors[4] },
                { offset: 0.83, color: sidebarGradientColors[5] },
                { offset: 1, color: sidebarGradientColors[6] }
              ])
            }
          }
        }]
      };
      barChartInstance.current.setOption(barOption);
    }

    // Initialize Pie Chart
    if (pieChartRef.current) {
      if (pieChartInstance.current) {
        pieChartInstance.current.dispose();
      }
      pieChartInstance.current = echarts.init(pieChartRef.current);
      const pieOption: echarts.EChartsOption = {
        animation: false,
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderColor: isDarkMode ? '#555' : '#ddd',
          textStyle: {
            color: isDarkMode ? '#fff' : '#333'
          }
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
          }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: isDarkMode ? '#1F2937' : '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 35, name: '18-25', itemStyle: { color: '#6366F1' } },
            { value: 30, name: '26-35', itemStyle: { color: '#8B5CF6' } },
            { value: 20, name: '36-45', itemStyle: { color: '#EC4899' } },
            { value: 15, name: '46+', itemStyle: { color: '#F59E0B' } }
          ]
        }]
      };
      pieChartInstance.current.setOption(pieOption);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      barChartInstance.current?.resize();
      pieChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize charts when component mounts or when dependencies change
  useEffect(() => {
    initializeCharts();
  }, [isDarkMode, activeNav]);

  // Cleanup charts when component unmounts
  useEffect(() => {
    return () => {
      barChartInstance.current?.dispose();
      pieChartInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (activeNav === 'User Insights') {
      // Literacy Level Distribution (bar chart with gradient)
      try {
        if (barChartRef.current) {
          if (barChartInstance.current) barChartInstance.current.dispose();
          barChartInstance.current = echarts.init(barChartRef.current);
          barChartInstance.current.setOption({
            xAxis: { type: 'category', data: ['Beginner', 'Intermediate', 'Advanced'] },
            yAxis: { type: 'value' },
            series: [{
              data: [8923, 10234, 5410],
              type: 'bar',
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: sidebarGradientColors[0] },
                    { offset: 0.16, color: sidebarGradientColors[1] },
                    { offset: 0.33, color: sidebarGradientColors[2] },
                    { offset: 0.5, color: sidebarGradientColors[3] },
                    { offset: 0.66, color: sidebarGradientColors[4] },
                    { offset: 0.83, color: sidebarGradientColors[5] },
                    { offset: 1, color: sidebarGradientColors[6] }
                  ],
                },
                borderRadius: [6, 6, 0, 0],
              },
            }],
            tooltip: { trigger: 'axis' },
            grid: { left: 40, right: 20, top: 30, bottom: 40 },
          });
        }
      } catch (e) { console.error('Bar chart failed to render', e); }
      // User Activity for the Month (line chart)
      try {
        if (lineChartRef.current) {
          if (lineChartInstance.current) lineChartInstance.current.dispose();
          // Delay initialization to ensure container is visible
          setTimeout(() => {
            if (!lineChartRef.current) return;
            lineChartInstance.current = echarts.init(lineChartRef.current);
            lineChartInstance.current.setOption({
              xAxis: {
                type: 'category',
                data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              },
              yAxis: { type: 'value' },
              series: [{
                data: [120, 180, 150, 210],
                type: 'line',
                smooth: true,
                lineStyle: { color: '#3498db', width: 3 },
                itemStyle: { color: '#3498db' },
                areaStyle: { color: 'rgba(52, 152, 219, 0.15)' },
              }],
              tooltip: { trigger: 'axis' },
              grid: { left: 40, right: 20, top: 30, bottom: 40 },
            });
            lineChartInstance.current.resize();
          }, 100);
        }
      } catch (e) { console.error('Line chart failed to render', e); }
      // Age Demographics (pie chart, match Home)
      try {
        if (pieChartRef.current) {
          if (pieChartInstance.current) pieChartInstance.current.dispose();
          pieChartInstance.current = echarts.init(pieChartRef.current);
          pieChartInstance.current.setOption({
            animation: false,
            tooltip: {
              trigger: 'item',
              formatter: '{b}: {c} ({d}%)',
              backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDarkMode ? '#555' : '#ddd',
              textStyle: {
                color: isDarkMode ? '#fff' : '#333'
              }
            },
            legend: {
              orient: 'vertical',
              right: '5%',
              top: 'center',
              textStyle: {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
              }
            },
            series: [{
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['40%', '50%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 6,
                borderColor: isDarkMode ? '#1F2937' : '#fff',
                borderWidth: 2
              },
              label: {
                show: false
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 35, name: '18-25', itemStyle: { color: '#6366F1' } },
                { value: 30, name: '26-35', itemStyle: { color: '#8B5CF6' } },
                { value: 20, name: '36-45', itemStyle: { color: '#EC4899' } },
                { value: 15, name: '46+', itemStyle: { color: '#F59E0B' } }
              ]
            }]
          });
        }
      } catch (e) { console.error('Pie chart failed to render', e); }
    }
  }, [activeNav, isDarkMode]);

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item);
    // You can add navigation logic here
    console.log(`Navigating to ${item}`);
  };

  const handleProfileUpdate = (newImage: string) => {
    setProfileImage(newImage);
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      setShowExportModal(false);

      // Import jsPDF and html2canvas dynamically
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      // Create temporary chart canvases and render the charts
      const tempBarChart = document.createElement('canvas');
      const tempPieChart = document.createElement('canvas');
      
      // Set dimensions for the charts
      tempBarChart.width = 500;
      tempBarChart.height = 300;
      tempPieChart.width = 500;
      tempPieChart.height = 300;

      // Initialize charts with the temporary canvases
      const pdfBarChart = echarts.init(tempBarChart);
      const pdfPieChart = echarts.init(tempPieChart);

      // Get options from existing charts and disable animation
      const barOptions = barChartInstance.current?.getOption();
      const pieOptions = pieChartInstance.current?.getOption();
      if (!barOptions || !pieOptions) {
          throw new Error("Chart options not available");
      }
      barOptions.animation = false;
      pieOptions.animation = false;

      // Set options to temporary charts
      pdfBarChart.setOption(barOptions);
      pdfPieChart.setOption(pieOptions);

      // Wait for charts to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert charts to data URLs
      const barChartUrl = tempBarChart.toDataURL('image/png');
      const pieChartUrl = tempPieChart.toDataURL('image/png');

      // Clean up temporary charts
      pdfBarChart.dispose();
      pdfPieChart.dispose();

      // Get the logo as base64
      const logoUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
          reject(new Error('Failed to load logo'));
        };
        img.src = '/src/assets/Logo_transparent.png';
      }).catch(() => {
        console.warn('Failed to load logo, continuing without it');
        return '';
      });

      const reportHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                    line-height: 1.6;
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 40px;
                    background-color: #f5f5f5;
                }
                .report-container {
                    background-color: #ffffff;
                    padding-left: 80px;
                    padding-right: 40px;
                    padding-top: 40px;
                    padding-bottom: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                h1, h2 {
                    color: #E67012;
                    text-align: center;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                h2 {
                    font-size: 20px;
                    color: #1F2937;
                    margin-top: 30px;
                    position: relative;
                }
                h2::after {
                    content: '';
                    display: block;
                    width: 50px;
                    height: 3px;
                    background-color: #E67012;
                    margin: 10px auto;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #E5E7EB;
                }
                .logo-section {
                    display: flex;
                    align-items: center;
                }
                .logo {
                    width: 74px;
                    height: 74px;
                    margin-right: 16px;
                    ${!logoUrl ? 'display: none;' : ''}
                }
                .date {
                    color: #6B7280;
                    font-size: 14px;
                }
                .user-info {
                    text-align: right;
                }
                .user-name {
                    font-weight: 600;
                    color: #1F2937;
                    margin-bottom: 4px;
                }
                .user-role {
                    color: #6B7280;
                    font-size: 14px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-box {
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    padding: 20px;
                    background-color: #F9FAFB;
                }
                .stat-label {
                    color: #6B7280;
                    font-size: 16px;
                    margin-bottom: 8px;
                }
                .stat-value {
                    color: #E67012;
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .stat-percentage {
                    color: #4B5563;
                    font-size: 14px;
                }
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                    margin: 30px 0;
                }
                .chart-container {
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    padding: 24px;
                    background-color: #F9FAFB;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .chart-title {
                    color: #1F2937;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .chart-image {
                    width: 100%;
                    height: auto;
                    border-radius: 4px;
                }
                .insights {
                    margin-top: 40px;
                    background-color: #F9FAFB;
                    padding: 24px;
                    border-radius: 8px;
                    border: 1px solid #E5E7EB;
                }
                .insights ul {
                    list-style-type: none;
                    padding-left: 0;
                }
                .insights li {
                    margin-bottom: 12px;
                    color: #4B5563;
                    padding-left: 24px;
                    position: relative;
                }
                .insights li::before {
                    content: '•';
                    color: #E67012;
                    font-size: 20px;
                    position: absolute;
                    left: 0;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #E5E7EB;
                    text-align: center;
                    color: #6B7280;
                }
                .footer p {
                    margin: 4px 0;
                }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="header">
                    <div class="logo-section">
                        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" />` : ''}
                        <div>
                            <h1>E-Literacy Dashboard Report</h1>
                            <p class="date">Generated on ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="user-info">
                        <p class="user-name">${userProfile.name}</p>
                        <p class="user-role">${userProfile.role}</p>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-label">Total Users</div>
                        <div class="stat-value">${stats.totalUsers.toLocaleString()}</div>
                        <div class="stat-percentage">Active participants</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Beginner Level</div>
                        <div class="stat-value">${stats.beginnerLevel.toLocaleString()}</div>
                        <div class="stat-percentage">${((stats.beginnerLevel / stats.totalUsers) * 100).toFixed(1)}% of total users</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Intermediate Level</div>
                        <div class="stat-value">${stats.intermediateLevel.toLocaleString()}</div>
                        <div class="stat-percentage">${((stats.intermediateLevel / stats.totalUsers) * 100).toFixed(1)}% of total users</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Advanced Level</div>
                        <div class="stat-value">${stats.advancedLevel.toLocaleString()}</div>
                        <div class="stat-percentage">${((stats.advancedLevel / stats.totalUsers) * 100).toFixed(1)}% of total users</div>
                    </div>
                </div>

                <h2>Analytics Overview</h2>
                <div class="charts-grid">
                    <div class="chart-container">
                        <div class="chart-title">Literacy Level Distribution</div>
                        <img src="${barChartUrl}" alt="Literacy Level Distribution" class="chart-image"/>
                    </div>
                    <div class="chart-container">
                        <div class="chart-title">Age Demographics</div>
                        <img src="${pieChartUrl}" alt="Age Demographics" class="chart-image"/>
                    </div>
                </div>

                <div class="insights">
                    <h2>Key Insights</h2>
                    <ul>
                        <li>Intermediate level users form the largest group with ${((stats.intermediateLevel / stats.totalUsers) * 100).toFixed(1)}% of total participation</li>
                        <li>Beginner level engagement represents ${((stats.beginnerLevel / stats.totalUsers) * 100).toFixed(1)}% of the user base</li>
                        <li>Advanced users make up ${((stats.advancedLevel / stats.totalUsers) * 100).toFixed(1)}% of total users</li>
                    </ul>
                </div>

                <div class="footer">
                    <p>E-Literacy Administration Dashboard</p>
                    <p>Confidential Report • ${new Date().getFullYear()}</p>
                </div>
            </div>
        </body>
        </html>
      `;

      // Create a temporary container for the HTML
      const container = document.createElement('div');
      container.innerHTML = reportHTML;
      document.body.appendChild(container);

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1000, // Match the max-width from the template
        windowWidth: 1000,
        logging: false
      });

      // Remove the temporary container
      document.body.removeChild(container);

      // Create PDF (A4 size: 210x297mm)
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      
      // Calculate dimensions to fit A4
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight
      );

      // Save the PDF
      const fileName = `E-Literacy_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Show success notification
      showNotification(`PDF report "${fileName}" has started downloading`);

    } catch (error) {
      console.error('Detailed error in PDF generation:', error);
      const message = error instanceof Error ? error.message : String(error);
      showNotification(`Failed to generate PDF: ${message}`, 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Function to render the active page content
  const renderActivePage = () => {
    console.log('activeNav:', activeNav);
    switch (activeNav) {
      case 'Settings':
        return <Settings isDarkMode={isDarkMode} onProfileUpdate={handleProfileUpdate} />;
      case 'Manage Courses':
        return <ManageCourses isDarkMode={isDarkMode} />;
      case 'Dashboard':
        return (
          <>
            {/* Welcome Banner */}
            <div
              className="mb-8 rounded-xl p-6 shadow-lg"
              style={{
                background: `linear-gradient(to right, ${sidebarGradientColors.join(', ')})`,
              }}
            >
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-white">
                  <h1 className="text-2xl font-bold mb-2">Welcome back, Alexander!</h1>
                  <p className="opacity-80">Here's what's happening with your literacy program today.</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-xl shadow-lg flex flex-col justify-between" style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : { background: '#fff' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Users</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</h3>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-green-500 font-medium flex items-center">
                        <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> 12.5%
                      </span>
                      <span className="text-xs text-gray-400 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faUsers} className="text-2xl" />
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-xl shadow-lg flex flex-col justify-between" style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : { background: '#fff' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Beginner Level</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.beginnerLevel.toLocaleString()}</h3>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-green-500 font-medium flex items-center">
                        <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> 12.5%
                      </span>
                      <span className="text-xs text-gray-400 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faStar} className="text-2xl" />
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-xl shadow-lg flex flex-col justify-between" style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : { background: '#fff' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Intermediate</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.intermediateLevel.toLocaleString()}</h3>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-green-500 font-medium flex items-center">
                        <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> 12.5%
                      </span>
                      <span className="text-xs text-gray-400 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faStar} className="text-2xl" />
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-xl shadow-lg flex flex-col justify-between" style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : { background: '#fff' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Advanced</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.advancedLevel.toLocaleString()}</h3>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-green-500 font-medium flex items-center">
                        <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> 12.5%
                      </span>
                      <span className="text-xs text-gray-400 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faAward} className="text-2xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {/* Province Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(showDropdown === 'province' ? null : 'province')}
                  className="flex items-center px-5 py-2 rounded-md border border-gray-200 focus:outline-none min-w-[200px] text-sm"
                  style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)', color: '#fff', borderColor: '#333' } : { background: '#fff', color: '#222' }}
                >
                  <span className="font-medium mr-1">Province:</span>
                  <span className="font-medium mr-2" style={isDarkMode ? { color: '#ff9800' } : { color: '#e67012' }}>{selectedProvince}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
                </button>
                {showDropdown === 'province' && (
                  <div className="absolute left-0 mt-2 w-full rounded-xl shadow-lg border z-10"
                    style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)', color: '#fff', borderColor: '#333' } : { background: '#fff', color: '#222' }}>
                    {["All Provinces", "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"].map(option => (
                      <div
                        key={option}
                        onClick={() => { setSelectedProvince(option); setShowDropdown(null); }}
                        onMouseEnter={() => isDarkMode && setHoveredDropdown({ type: 'province', value: option })}
                        onMouseLeave={() => isDarkMode && setHoveredDropdown(null)}
                        className={`px-5 py-2 cursor-pointer text-sm ${!isDarkMode ? 'hover:bg-gray-50' : ''} ${selectedProvince === option ? (isDarkMode ? 'text-orange-400 font-semibold' : 'text-orange-600 font-semibold') : ''}`}
                        style={isDarkMode ? {
                          color: '#fff',
                          background: hoveredDropdown && hoveredDropdown.type === 'province' && hoveredDropdown.value === option ? 'rgba(70,70,70,0.95)' : 'rgba(50,50,50,0.9)'
                        } : {}}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Age Range Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(showDropdown === 'age' ? null : 'age')}
                  className="flex items-center px-5 py-2 rounded-md border border-gray-200 focus:outline-none min-w-[200px] text-sm"
                  style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)', color: '#fff', borderColor: '#333' } : { background: '#fff', color: '#222' }}
                >
                  <span className="font-medium mr-1">Age Range:</span>
                  <span className="font-medium mr-2" style={isDarkMode ? { color: '#ff9800' } : { color: '#e67012' }}>{selectedAge}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
                </button>
                {showDropdown === 'age' && (
                  <div className="absolute left-0 mt-2 w-full rounded-xl shadow-lg border z-10"
                    style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)', color: '#fff', borderColor: '#333' } : { background: '#fff', color: '#222' }}>
                    {["All Ages", "18-25", "26-35", "36-45", "46+"].map(option => (
                      <div
                        key={option}
                        onClick={() => { setSelectedAge(option); setShowDropdown(null); }}
                        onMouseEnter={() => isDarkMode && setHoveredDropdown({ type: 'age', value: option })}
                        onMouseLeave={() => isDarkMode && setHoveredDropdown(null)}
                        className={`px-5 py-2 cursor-pointer text-sm ${!isDarkMode ? 'hover:bg-gray-50' : ''} ${selectedAge === option ? (isDarkMode ? 'text-orange-400 font-semibold' : 'text-orange-600 font-semibold') : ''}`}
                        style={isDarkMode ? {
                          color: '#fff',
                          background: hoveredDropdown && hoveredDropdown.type === 'age' && hoveredDropdown.value === option ? 'rgba(70,70,70,0.95)' : 'rgba(50,50,50,0.9)'
                        } : {}}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Skill Level Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(showDropdown === 'skill' ? null : 'skill')}
                  className="flex items-center px-5 py-2 rounded-md border border-gray-200 focus:outline-none min-w-[200px] text-sm"
                  style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)', color: '#fff', borderColor: '#333' } : { background: '#fff', color: '#222' }}
                >
                  <span className="font-medium mr-1">Skill Level:</span>
                  <span className="font-medium mr-2" style={isDarkMode ? { color: '#ff9800' } : { color: '#e67012' }}>{selectedSkill}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
                </button>
                {showDropdown === 'skill' && (
                  <div className="absolute left-0 mt-2 w-full rounded-xl shadow-lg border z-10"
                    style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)', color: '#fff', borderColor: '#333' } : { background: '#fff', color: '#222' }}>
                    {["All Levels", "Beginner", "Intermediate", "Advanced"].map(option => (
                      <div
                        key={option}
                        onClick={() => { setSelectedSkill(option); setShowDropdown(null); }}
                        onMouseEnter={() => isDarkMode && setHoveredDropdown({ type: 'skill', value: option })}
                        onMouseLeave={() => isDarkMode && setHoveredDropdown(null)}
                        className={`px-5 py-2 cursor-pointer text-sm ${!isDarkMode ? 'hover:bg-gray-50' : ''} ${selectedSkill === option ? (isDarkMode ? 'text-orange-400 font-semibold' : 'text-orange-600 font-semibold') : ''}`}
                        style={isDarkMode ? {
                          color: '#fff',
                          background: hoveredDropdown && hoveredDropdown.type === 'skill' && hoveredDropdown.value === option ? 'rgba(70,70,70,0.95)' : 'rgba(50,50,50,0.9)'
                        } : {}}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* More Filters Button */}
              <div className="flex-1 flex justify-end min-w-[180px]">
                <button
                  className="flex items-center px-5 py-3 rounded-xl shadow border border-gray-200 text-sm"
                  style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)', color: '#fff', borderColor: '#333' } : { background: '#fff', color: '#222' }}
                  onMouseEnter={e => { if (isDarkMode) e.currentTarget.style.background = 'rgba(70,70,70,0.95)'; }}
                  onMouseLeave={e => { if (isDarkMode) e.currentTarget.style.background = 'rgba(50,50,50,0.9)'; }}
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2 text-lg text-gray-500" />
                  More Filters
                </button>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="p-6 rounded-md shadow-sm mb-8" style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : { background: '#fff' }}>
                <h3 className="text-base font-bold mb-3">Literacy Level Distribution</h3>
                <div ref={barChartRef} style={{ height: '250px' }}></div>
              </div>
              <div className="p-6 rounded-md shadow-sm mb-8" style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : { background: '#fff' }}>
                <h3 className="text-base font-bold mb-3">Age Demographics</h3>
                <div ref={pieChartRef} style={{ height: '250px' }}></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3 mb-8">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-[#E67012] text-white rounded-lg shadow-lg hover:shadow-[#E6701240] text-sm"
                id='download-report'
              >
                <i className="fas fa-download mr-2"></i>
                Download Report
              </button>
              <button className="px-4 py-2 bg-[#3498DB] text-white rounded-lg shadow-lg hover:shadow-[#3498DB40] text-sm" id='view-detailed-stats'>
                <i className="fas fa-chart-line mr-2"></i>
                View Detailed Stats
              </button>
            </div>

            {/* User Activity Table */}
            <div className={isDarkMode ? ' p-8 rounded-md  p-8 mb-10 text-white' : 'bg-white p-8 mb-10 text-sm rounded-md'}
                 style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : {}}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Recent User Activity</h3>
                <button className="font-medium hover:underline text-sm" style={isDarkMode ? { color: '#ff9800' } : { color: '#e67012' }}>View All</button>
              </div>
              {/* Top User of the Week Highlight (inside Recent User Activity) */}
              <div className={isDarkMode ? 'flex items-center bg-yellow-900/30 border-l-8 border-yellow-400 rounded-xl p-4 mb-6 max-w-xl w-full' : 'flex items-center bg-yellow-50 border-l-8 border-yellow-400 rounded-xl p-4 mb-6 max-w-xl w-full'}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4" style={{ background: `linear-gradient(135deg, ${sidebarGradientColors.join(', ')})` }}>
                  <span role="img" aria-label="Trophy">🥇</span>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-base font-bold mr-2" style={{ color: '#ff9800' }}>
                      Top User of the Week
                    </span>
                    <span className="text-xl">🏆</span>
                  </div>
                  <div className="flex items-center">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Top User" className="w-8 h-8 rounded-full border-2 border-yellow-400 mr-2" />
                    <span className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-black'}>Sarah Johnson</span>
                  </div>
                  <div className={isDarkMode ? 'text-xs text-gray-200 mt-1' : 'text-xs text-gray-700 mt-1'}>Completed the most modules this week!</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-black">
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>User</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Activity</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Progress</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Date</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { user: 'Sarah Johnson', activity: 'Completed Module 3', progress: 75, date: '2025-06-15', status: 'Completed' },
                      { user: 'Michael Brown', activity: 'Started Assessment', progress: 45, date: '2025-06-14', status: 'In Progress' },
                      { user: 'Emily Davis', activity: 'Joined Program', progress: 10, date: '2025-06-13', status: 'New' },
                      { user: 'David Wilson', activity: 'Completed Module 2', progress: 60, date: '2025-06-12', status: 'Completed' }
                    ].map((item, idx) => (
                      <tr
                        key={idx}
                        style={isDarkMode ? {
                          background: 'rgba(50,50,50,0.0)',
                          color: '#fff',
                          borderBottom: '1px solid #333'
                        } : {}}
                      >
                        <td className="py-4 text-sm">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg, ${sidebarGradientColors.join(', ')})` }}>
                              {item.user.charAt(0)}
                            </div>
                            <span className={isDarkMode ? 'ml-3 font-semibold text-white flex items-center' : 'ml-3 font-semibold text-black flex items-center'}>
                              {idx === 0 && <span title="Top 1" className="mr-1">🥇</span>}
                              {idx === 1 && <span title="Top 2" className="mr-1">🥈</span>}
                              {idx === 2 && <span title="Top 3" className="mr-1">🥉</span>}
                              {item.user}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm">{item.activity}</td>
                        <td className="py-4 text-sm">
                          <div className="flex items-center min-w-[120px]">
                            <div className="flex-1 h-2 rounded-full mr-2 overflow-hidden" style={isDarkMode ? { background: '#b0b0b0' } : { background: '#e5e7eb' }}>
                              <div className="h-2 rounded-full bg-orange-500" style={{ width: `${item.progress}%` }}></div>
                            </div>
                            <span className="ml-1 font-semibold text-sm mr-3">{item.progress}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-black">{item.date}</td>
                        <td className="py-4 text-sm">
                          {item.status === 'Completed' && (
                            <span style={isDarkMode ? { background: '#1e3a1e', color: '#7fffaf' } : { background: '#d1fae5', color: '#059669' }} className="px-3 py-1 rounded-full text-xs font-semibold text-sm">Completed</span>
                          )}
                          {item.status === 'In Progress' && (
                            <span style={isDarkMode ? { background: '#3a2e1e', color: '#ffe680' } : { background: '#fef3c7', color: '#b45309' }} className="px-3 py-1 rounded-full text-xs font-semibold text-sm">In Progress</span>
                          )}
                          {item.status === 'New' && (
                            <span style={isDarkMode ? { background: '#1e2740', color: '#a5b4fc' } : { background: '#dbeafe', color: '#2563eb' }} className="px-3 py-1 rounded-full text-xs font-semibold text-sm">New</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case 'User Insights':
        return (
          <>
            <div className={isDarkMode ? 'mb-5 text-white' : 'mb-5'}>
              <h1 className={isDarkMode ? 'text-2xl font-bold mb-2 text-white' : 'text-2xl font-bold mb-2'}>User Insights</h1>
            </div>
            <UserInsightsMap isDarkMode={isDarkMode} />
            {/* Detailed Graphs Section */}
            <div className={isDarkMode ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 text-white' : 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'}>
              <div className={isDarkMode ? 'bg-[rgba(50,50,50,0.9)] rounded-xl shadow-lg p-6 flex flex-col text-white' : 'bg-white rounded-xl shadow-lg p-6 flex flex-col'}>
                <h3 className={isDarkMode ? 'text-base font-bold mb-3 text-white' : 'text-base font-bold mb-3'}>Literacy Level Distribution</h3>
                <div ref={barChartRef} style={{ height: '250px', width: '100%', minHeight: '250px', minWidth: '200px' }}></div>
              </div>
              <div className={isDarkMode ? 'bg-[rgba(50,50,50,0.9)] rounded-xl shadow-lg p-6 flex flex-col text-white' : 'bg-white rounded-xl shadow-lg p-6 flex flex-col'}>
                <h3 className={isDarkMode ? 'text-base font-bold mb-3 text-white' : 'text-base font-bold mb-3'}>User Activity for the Month</h3>
                <div ref={lineChartRef} style={{ height: '250px', width: '100%', minHeight: '250px', minWidth: '200px' }}></div>
              </div>
            </div>
            {/* Standalone Pie Chart Section */}
            <div className={isDarkMode ? 'bg-[rgba(50,50,50,0.9)] rounded-xl shadow-lg p-6 flex flex-col mb-8 max-w-4xl w-full mx-auto text-white' : 'bg-white rounded-xl shadow-lg p-6 flex flex-col mb-8 max-w-4xl w-full mx-auto'}>
              <h3 className={isDarkMode ? 'text-base font-bold mb-3 text-white' : 'text-base font-bold mb-3'}>Age Demographics</h3>
              <div ref={pieChartRef} style={{ height: '350px', width: '100%', minHeight: '350px', minWidth: '300px' }}></div>
            </div>
            {/* Inactive Users / Danger Zone */}
            <div className={isDarkMode ? 'bg-red-900/40 rounded-xl shadow-lg p-6 mb-10 text-white' : 'bg-red-50 rounded-xl shadow-lg p-6 mb-10'}>
              <h2 className={isDarkMode ? 'text-lg font-bold mb-4 text-white' : 'text-lg font-bold mb-4 text-red-600'}>Inactive Users / Danger Zone</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>User</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Last Activity</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-200">
                    {[
                      { user: 'Nomsa Dlamini', last: '2024-05-01', status: 'Inactive 30+ days' },
                      { user: 'Thabo Mokoena', last: '2024-05-10', status: 'Inactive 20+ days' },
                      { user: 'Lerato Khumalo', last: '2024-05-15', status: 'Inactive 15+ days' },
                      { user: 'Sipho Ndlovu', last: '2024-05-18', status: 'Inactive 10+ days' },
                      { user: 'Zanele Mthembu', last: '2024-05-20', status: 'Inactive 7+ days' },
                    ].map((item, idx) => (
                      <tr key={idx}>
                        <td className={isDarkMode ? 'py-3 font-semibold text-white' : 'py-3 font-semibold text-black'}>{item.user}</td>
                        <td className={isDarkMode ? 'py-3 text-white' : 'py-3 text-black'}>{item.last}</td>
                        <td className="py-3">
                          <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* User Activity Table */}
            <div className={isDarkMode ? ' p-8 mb-10 text-white' : 'bg-white rounded-md shadow-md p-8 mb-10 text-sm'}
                 style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : {}}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Recent User Activity</h3>
                <button className="font-medium hover:underline text-sm" style={isDarkMode ? { color: '#ff9800' } : { color: '#e67012' }}>View All</button>
              </div>
              {/* Top User of the Week Highlight (inside Recent User Activity) */}
              <div className={isDarkMode ? 'flex items-center bg-yellow-900/30 border-l-8 border-yellow-400 rounded-xl p-4 mb-6 max-w-xl w-full' : 'flex items-center bg-yellow-50 border-l-8 border-yellow-400 rounded-xl p-4 mb-6 max-w-xl w-full'}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4" style={{ background: `linear-gradient(135deg, ${sidebarGradientColors.join(', ')})` }}>
                  <span role="img" aria-label="Trophy">🥇</span>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <span className="text-base font-bold mr-2" style={{ color: '#ff9800' }}>
                      Top User of the Week
                    </span>
                    <span className="text-xl">🏆</span>
                  </div>
                  <div className="flex items-center">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Top User" className="w-8 h-8 rounded-full border-2 border-yellow-400 mr-2" />
                    <span className={isDarkMode ? 'font-semibold text-white' : 'font-semibold text-black'}>Sarah Johnson</span>
                  </div>
                  <div className={isDarkMode ? 'text-xs text-gray-200 mt-1' : 'text-xs text-gray-700 mt-1'}>Completed the most modules this week!</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-black">
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>User</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Activity</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Progress</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Date</th>
                      <th className={isDarkMode ? 'pb-3 font-medium text-left text-white' : 'pb-3 font-medium text-left text-black'}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { user: 'Sarah Johnson', activity: 'Completed Module 3', progress: 75, date: '2025-06-15', status: 'Completed' },
                      { user: 'Michael Brown', activity: 'Started Assessment', progress: 45, date: '2025-06-14', status: 'In Progress' },
                      { user: 'Emily Davis', activity: 'Joined Program', progress: 10, date: '2025-06-13', status: 'New' },
                      { user: 'David Wilson', activity: 'Completed Module 2', progress: 60, date: '2025-06-12', status: 'Completed' }
                    ].map((item, idx) => (
                      <tr
                        key={idx}
                        style={isDarkMode ? {
                          background: 'rgba(50,50,50,0.0)',
                          color: '#fff',
                          borderBottom: '1px solid #333'
                        } : {}}
                      >
                        <td className="py-4 text-sm">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: `linear-gradient(135deg, ${sidebarGradientColors.join(', ')})` }}>
                              {item.user.charAt(0)}
                            </div>
                            <span className={isDarkMode ? 'ml-3 font-semibold text-white flex items-center' : 'ml-3 font-semibold text-black flex items-center'}>
                              {idx === 0 && <span title="Top 1" className="mr-1">🥇</span>}
                              {idx === 1 && <span title="Top 2" className="mr-1">🥈</span>}
                              {idx === 2 && <span title="Top 3" className="mr-1">🥉</span>}
                              {item.user}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm">{item.activity}</td>
                        <td className="py-4 text-sm">
                          <div className="flex items-center min-w-[120px]">
                            <div className="flex-1 h-2 rounded-full mr-2 overflow-hidden" style={isDarkMode ? { background: '#b0b0b0' } : { background: '#e5e7eb' }}>
                              <div className="h-2 rounded-full bg-orange-500" style={{ width: `${item.progress}%` }}></div>
                            </div>
                            <span className="ml-1 font-semibold text-sm mr-3">{item.progress}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-black">{item.date}</td>
                        <td className="py-4 text-sm">
                          {item.status === 'Completed' && (
                            <span style={isDarkMode ? { background: '#1e3a1e', color: '#7fffaf' } : { background: '#d1fae5', color: '#059669' }} className="px-3 py-1 rounded-full text-xs font-semibold text-sm">Completed</span>
                          )}
                          {item.status === 'In Progress' && (
                            <span style={isDarkMode ? { background: '#3a2e1e', color: '#ffe680' } : { background: '#fef3c7', color: '#b45309' }} className="px-3 py-1 rounded-full text-xs font-semibold text-sm">In Progress</span>
                          )}
                          {item.status === 'New' && (
                            <span style={isDarkMode ? { background: '#1e2740', color: '#a5b4fc' } : { background: '#dbeafe', color: '#2563eb' }} className="px-3 py-1 rounded-full text-xs font-semibold text-sm">New</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case 'Manage Users':
        return <ManageUsers />;
      default:
        return <div className="p-6">Page under construction</div>;
    }
  };

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: isDarkMode ? '#141414' : '#f3f4f6',
        color: isDarkMode ? '#ffffff' : '#1f2937',
        display: 'flex',
        flexDirection: 'row'
      }}
    >
      {/* Sidebar */}
      <div
        ref={sidebarRef}
  className={`fixed left-0 top-0 h-full ${isMenuCollapsed ? 'w-12' : 'w-48'} transition-all duration-300 shadow-xl z-50 text-sm`}
        style={isDarkMode ? { background: 'rgba(50, 50, 50, 0.9)' } : newGradientStyle}
      >
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center">
            {!isMenuCollapsed && <span className="text-white font-bold ml-5 text-lg mt-5">E-Literacy</span>}
          </div>
        </div>
        <div className="mt-8 flex flex-col h-[calc(100vh-8rem)] justify-between text-sm">
          <div>
            {[
              { name: 'Dashboard', icon: faChartLine },
              { name: 'Reports', icon: faFileAlt },
              { name: 'User Insights', icon: faLightbulb },
              { name: 'Manage Courses', icon: faUsers },
              { name: 'Settings', icon: faCog }
            ].map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  setActiveNav(item.name as NavItem);
                  // Clear hash route when switching main navigation
                  if (window.location.hash) {
                    window.location.hash = '';
                    setRoute('');
                  }
                }}
                className={`px-4 py-3 flex items-center cursor-pointer transition-all duration-200 rounded-lg mb-2
                  ${activeNav === item.name ? (isDarkMode ? 'bg-white/20 border-l-4' : 'bg-white/20 border-l-4 border-yellow-400') + ' text-white font-bold shadow' : 'text-gray-100 hover:bg-white/10'}
                  ${isMenuCollapsed ? 'justify-center' : ''}`}
                style={activeNav === item.name && isDarkMode ? { borderLeft: '4px solid #E67012' } : {}}
              >
                <FontAwesomeIcon icon={item.icon} className={isMenuCollapsed ? 'text-xl' : 'w-6'} />
                {!isMenuCollapsed && <span className="ml-3">{item.name}</span>}
              </div>
            ))}
          </div>
          {!isMenuCollapsed && (
            <div className="mb-8 px-4">
              <div
                className="p-3 bg-white/10 rounded-lg flex items-center text-gray-100 hover:bg-white/20 cursor-pointer transition-all"
                onClick={onLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-6" />
                <span className="ml-3">Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
  className={`${isMenuCollapsed ? 'ml-12' : 'ml-48'} pl-8 pr-8 transition-all duration-300 text-base`}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pt-7">
          {activeNav !== 'Settings' && (
            <div className="flex items-center space-x-3">
              <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full border-2 border-[#E67012]" id='profile-image'/>
              <div>
                <h2 className="text-lg font-bold">Alexander Mitchell</h2>
                <p className="text-xs text-gray-500">Administrator | Last login: {lastLogin}</p>
              </div>
            </div>
          )}
          <div className={activeNav === 'Settings' ? 'ml-auto' : ''}>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-gray-800 text-white">
              <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {route === '#/manage-users' && activeNav === 'User Insights' ? (
          <ManageUsers />
        ) : (
          renderActivePage()
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" 
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}>
          <div style={{ 
            backgroundColor: isDarkMode ? 'rgba(46, 46, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            maxWidth: '28rem',
            width: '100%',
            margin: '0 1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Export Report</h3>
              <button 
                onClick={() => setShowExportModal(false)} 
                style={{ color: '#6b7280' }}
                className="hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              <button 
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: isGeneratingPDF ? '#f3a15f' : '#E67012',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  opacity: isGeneratingPDF ? 0.5 : 1,
                  cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-file-pdf"></i>
                <span>{isGeneratingPDF ? 'Generating PDF...' : 'Export as PDF'}</span>
              </button>
              <button 
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FF0000',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-file-csv"></i>
                <span>Export as CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div 
          style={{ 
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 50,
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: notification.type === 'error' ? '#EF4444' : '#10B981',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <i className={`fas fa-${notification.type === 'error' ? 'exclamation-circle' : 'check-circle'}`}></i>
          <p>{notification.message}</p>
        </div>
      )}

      {/* Hidden PDF Report Template */}
      <div style={{ display: 'none' }}>
        <div ref={pdfReportRef}>
          <PDFReport
            stats={stats}
            userProfile={userProfile}
          />
        </div>
      </div>
    </div>
  );
};

// Animation styles
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Home;
