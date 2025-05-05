'use client';

interface Profile {
  first_name: string;
  last_name: string;
}

interface ProfileHeaderProps {
  profile: Profile | null;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  if (!profile) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 text-lg text-gray-900">{profile.first_name} {profile.last_name}</p>
        </div>
      </div>
    </div>
  );
} 