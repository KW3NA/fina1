import React from 'react';

interface Props {
    type: 'success' | 'error';
    message: string;
}

const Alert: React.FC<Props> = ({ type, message }) => {
  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';
  const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} rounded-lg p-4 shadow-lg animate-slide-in z-[1000]`}>
      <div className="flex items-center">
        <i className={`fas fa-${icon} ${iconColor} text-xl mr-3`}></i>
        <p className={`${textColor} font-medium`}>{message}</p>
      </div>
    </div>
  );
};

export default Alert; 