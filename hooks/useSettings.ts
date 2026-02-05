import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface UserProfile {
  id: string;
  userIdCode: string;
  name: string;
  profileImage?: string;
  location?: string;
  bio?: string;
  website?: string;
  phoneNumber?: string;
  publicProfile: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalRestaurantsVisited: number;
    totalReviews: number;
    totalLists: number;
    totalRestaurantsAdded: number;
    joinedDate: string;
  };
  recentReviews: any[];
  recentLists: any[];
  isOwnProfile: boolean;
}

interface UseSettingsResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  saveProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  uploadImage: (file: File) => Promise<string>;
  refreshProfile: () => Promise<void>;
}

// Transform form data from camelCase to snake_case for API
const transformFormData = (formData: Partial<UserProfile>): any => {
  return {
    display_name: formData.name,
    avatar_url: formData.profileImage,
    location: formData.location,
    bio: formData.bio,
    website: formData.website,
    phone_number: formData.phoneNumber,
    public_profile: formData.publicProfile
  };
};

export const useSettings = (): UseSettingsResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users/me');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const apiData = await response.json();
      
      // API already returns data in camelCase format, no transformation needed
      setProfile(apiData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!data.name || data.name.trim() === '') {
        throw new Error('Display name is required');
      }

      // Validate website format if provided
      if (data.website && data.website.trim() !== '') {
        try {
          new URL(data.website);
        } catch {
          throw new Error('Invalid website URL format');
        }
      }

      // Transform form data to API format
      const apiData = transformFormData(data);

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      
      // API already returns data in camelCase format, no transformation needed
      setProfile(result.profile);
      toast.success('Profile updated successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      // Import the upload function dynamically to avoid SSR issues
      const { uploadToCloudinary } = await import('@/utils/cloudinaryConverter');
      const imageUrl = await uploadToCloudinary(file);
      
      toast.success('Image uploaded successfully!');
      return imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error uploading image';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    saveProfile,
    uploadImage,
    refreshProfile,
  };
};
