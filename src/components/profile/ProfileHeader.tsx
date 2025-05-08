'use client';

import { useState } from 'react';
import { Edit2, Share2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import EditProfileModal from './EditProfileModal';
import { Toast } from '@/components/ui/toast';

interface Profile {
  first_name: string;
  last_name: string;
  created_at: string;
}

interface ProfileHeaderProps {
  profile: Profile | null;
  onUpdate?: () => void;
}

export default function ProfileHeader({ profile, onUpdate }: ProfileHeaderProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!profile) return null;

  const formatDate = (timestamptz: string | undefined) => {
    if (!timestamptz) return 'Recently joined';
    
    try {
      // Parse the timestamptz string
      const date = new Date(timestamptz);
      
      if (isNaN(date.getTime())) {
        return 'Recently joined';
      }

      // Format using UTC to avoid timezone issues
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const month = monthNames[date.getUTCMonth()];
      const year = date.getUTCFullYear();
      
      return `${month} ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently joined';
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Profile Avatar */}
          <div className="w-24 h-24 rounded-full bg-[#0D4E4A]/10 flex items-center justify-center">
            <span className="text-3xl font-bold text-[#0D4E4A]">
              {profile.first_name[0]}{profile.last_name[0]}
            </span>
          </div>

          {/* Name */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0D4E4A]">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-sm text-[#0D4E4A]/70 mt-1">
              Member since {formatDate(profile.created_at)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-2">
            {user && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-[#0D4E4A] text-white rounded-full hover:bg-[#0D4E4A]/90 transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-[#0D4E4A]/10 text-[#0D4E4A] rounded-full hover:bg-[#0D4E4A]/20 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </button>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
        onUpdate={onUpdate || (() => {})}
      />

      {showToast && (
        <Toast
          message="Copied!"
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
} 