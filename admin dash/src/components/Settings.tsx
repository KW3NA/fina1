import React, { useState, useRef } from 'react';

interface Props {
  isDarkMode: boolean;
  onProfileUpdate: (newImage: string) => void;
}

const Settings: React.FC<Props> = ({ isDarkMode, onProfileUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState("https://public.readdy.ai/ai/img_res/d1dc43f1807fb29c90e715375bb00667.jpg");

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const validateAndOptimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject('Image size should be less than 5MB');
        return;
      }

      // Check dimensions and optimize if needed
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target?.result) return;
        img.src = e.target.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // If image is too large, scale it down while maintaining aspect ratio
          const MAX_SIZE = 800;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject('Could not get canvas context');
            return;
          }

          // Use better quality settings
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw image with white background to handle transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to high-quality JPEG
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject('Could not create blob from canvas');
            }
          }, 'image/jpeg', 0.92); // 92% quality
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError('');
        const optimizedImageUrl = await validateAndOptimizeImage(file);
        setTempImage(optimizedImageUrl);
        setShowPreviewModal(true);
      } catch (err) {
        if (typeof err === 'string') {
          setError(err);
        } else if (err instanceof Error) {
          setError(err.message);
        }
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleSaveImage = () => {
    if (tempImage) {
      setCurrentImage(tempImage);
      setPreviewImage(tempImage);
      onProfileUpdate(tempImage);
      setShowPreviewModal(false);
    }
  };

  const handleCancelImage = () => {
    setTempImage(null);
    setShowPreviewModal(false);
  };

  return (
    <div className="p-6 max-w-3xl mr-50" id='settings-container' style={{ marginTop: '-32px' }}>
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-full mb-4 overflow-hidden cursor-pointer group"
               style={{ borderWidth: '4px', borderColor: '#E67012' }}
               onClick={handleImageClick}>
            <img 
              src={previewImage || currentImage} 
              alt="Profile" 
              className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                 style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <i className="fas fa-camera text-white text-2xl"></i>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
        </div>
        {error && (
          <div style={{ color: '#EF4444' }} className="text-sm mb-2">
            {error}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-1">Alexander Mitchell</h2>
        <p style={{ color: '#6b7280' }} className="text-base mb-1">alexm@gmail.com</p>
        <p style={{ color: '#6b7280' }} className="text-sm mb-2">Administrator | Last login: 2025-04-20</p>
        <button 
          onClick={handleImageClick}
          style={{ color: '#E67012' }}
          className="hover:text-[#ff8a3d] transition-colors flex items-center space-x-2 text-sm"
        >
          <i className="fas fa-pencil-alt"></i>
          <span>Edit Profile Picture</span>
        </button>
      </div>

      {/* Settings Options */}
      <div className="space-y-3">
        {/* General Settings */}
        <button 
          className={`w-full p-4 rounded-lg shadow hover:border-[#E67012] border border-transparent transition-all duration-300 flex items-center text-sm`}
          style={{ 
            backgroundColor: isDarkMode ? '#2E2E2E' : '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <i style={{ color: '#E67012' }} className="fas fa-cog text-xl mr-4"></i>
          <span className="font-medium flex-grow text-left">General Settings</span>
          <i style={{ color: '#E67012' }} className="fas fa-chevron-right"></i>
        </button>

        {/* Notification Settings */}
        <button 
          className={`w-full p-4 rounded-lg shadow hover:border-[#E67012] border border-transparent transition-all duration-300 flex items-center text-sm`}
          style={{ 
            backgroundColor: isDarkMode ? '#2E2E2E' : '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <i style={{ color: '#E67012' }} className="fas fa-bell text-xl mr-4"></i>
          <span className="font-medium flex-grow text-left">Notification Settings</span>
          <i style={{ color: '#E67012' }} className="fas fa-chevron-right"></i>
        </button>

        {/* Manage Users */}
        <button 
          className={`w-full p-4 rounded-lg shadow hover:border-[#E67012] border border-transparent transition-all duration-300 flex items-center text-sm`}
          style={{ 
            backgroundColor: isDarkMode ? '#2E2E2E' : '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <i style={{ color: '#E67012' }} className="fas fa-users text-xl mr-4"></i>
          <span className="font-medium flex-grow text-left">Manage Users</span>
          <i style={{ color: '#E67012' }} className="fas fa-chevron-right"></i>
        </button>

        {/* Deactivate Account */}
        <button 
          className="w-full p-4 rounded-lg shadow transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
          style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
        >
          <i className="fas fa-user-slash"></i>
          <span className="font-medium">Deactivate Account</span>
        </button>
      </div>

      {/* Image Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}>
          <div style={{ 
            backgroundColor: isDarkMode ? 'rgba(46, 46, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }} className="rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Preview Profile Picture</h3>
              <button 
                onClick={handleCancelImage}
                style={{ color: '#6b7280' }}
                className="hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="mb-6">
              <div className="w-48 h-48 rounded-full mx-auto mb-4 overflow-hidden"
                   style={{ borderWidth: '4px', borderColor: '#E67012' }}>
                <img 
                  src={tempImage || ''} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelImage}
                className="px-4 py-2 rounded-lg transition-colors text-sm"
                style={{ 
                  borderWidth: '1px',
                  borderColor: '#E5E7EB',
                  backgroundColor: isDarkMode ? '#2E2E2E' : '#FFFFFF'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImage}
                className="px-4 py-2 text-white rounded-lg transition-colors text-sm"
                style={{ backgroundColor: '#E67012' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 