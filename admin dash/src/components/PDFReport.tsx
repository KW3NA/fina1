import React from 'react';
// Im

interface Stats {
    totalUsers: number;
    beginnerLevel: number;
    intermediateLevel: number;
    advancedLevel: number;
}

interface UserProfile {
    name: string;
    role: string;
}

interface Props {
    stats: Stats;
    userProfile: UserProfile;
}

const PDFReport = React.forwardRef<HTMLDivElement, Props>(({ stats, userProfile }, ref) => {
  return (
    <div ref={ref} id="pdf-content" style={{ 
      width: '800px',
      minHeight: '1131px',
      padding: '40px',
      backgroundColor: '#ffffff',
      color: '#000000',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '2px solid #E5E7EB'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/src/assets/Logo_transparent.png" alt="Logo" style={{ width: '64px', height: '64px' }} />
          <div style={{ marginLeft: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
              E-Literacy Dashboard Report
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{userProfile.name}</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>{userProfile.role}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
          Executive Summary
        </h2>
        <p style={{ color: '#4B5563', lineHeight: '1.6', marginBottom: '24px' }}>
          This report provides an overview of the E-Literacy program's current statistics and user distribution across different proficiency levels. 
          Total user engagement stands at {stats.totalUsers.toLocaleString()} participants, showing significant adoption of the platform.
        </p>
      </div>

      {/* Summary Statistics */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          Detailed Statistics
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '20px'
        }}>
          <div style={{ 
            padding: '24px', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            backgroundColor: '#F9FAFB'
          }}>
            <p style={{ color: '#6b7280', marginBottom: '8px', fontSize: '16px' }}>Total Users</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#E67012', marginBottom: '12px' }}>
              {stats.totalUsers.toLocaleString()}
            </p>
            <p style={{ color: '#4B5563', fontSize: '14px' }}>
              Active participants in the program
            </p>
          </div>
          <div style={{ 
            padding: '24px', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            backgroundColor: '#F9FAFB'
          }}>
            <p style={{ color: '#6b7280', marginBottom: '8px', fontSize: '16px' }}>Beginner Level</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#E67012', marginBottom: '12px' }}>
              {stats.beginnerLevel.toLocaleString()}
            </p>
            <p style={{ color: '#4B5563', fontSize: '14px' }}>
              {((stats.beginnerLevel / stats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </div>
          <div style={{ 
            padding: '24px', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            backgroundColor: '#F9FAFB'
          }}>
            <p style={{ color: '#6b7280', marginBottom: '8px', fontSize: '16px' }}>Intermediate Level</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#E67012', marginBottom: '12px' }}>
              {stats.intermediateLevel.toLocaleString()}
            </p>
            <p style={{ color: '#4B5563', fontSize: '14px' }}>
              {((stats.intermediateLevel / stats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </div>
          <div style={{ 
            padding: '24px', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px',
            backgroundColor: '#F9FAFB'
          }}>
            <p style={{ color: '#6b7280', marginBottom: '8px', fontSize: '16px' }}>Advanced Level</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#E67012', marginBottom: '12px' }}>
              {stats.advancedLevel.toLocaleString()}
            </p>
            <p style={{ color: '#4B5563', fontSize: '14px' }}>
              {((stats.advancedLevel / stats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
          Key Insights
        </h2>
        <ul style={{ color: '#4B5563', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '12px' }}>
            • Intermediate level users form the largest group with {((stats.intermediateLevel / stats.totalUsers) * 100).toFixed(1)}% of total participation
          </li>
          <li style={{ marginBottom: '12px' }}>
            • Beginner level engagement represents {((stats.beginnerLevel / stats.totalUsers) * 100).toFixed(1)}% of the user base
          </li>
          <li style={{ marginBottom: '12px' }}>
            • Advanced users make up {((stats.advancedLevel / stats.totalUsers) * 100).toFixed(1)}% of total users
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '2px solid #E5E7EB',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <p style={{ marginBottom: '4px' }}>E-Literacy Administration Dashboard</p>
        <p>Confidential Report • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
});

export default PDFReport; 