import { useState, useEffect, useCallback } from 'react';
import { formatAddress, parseAddress } from '../../utils/stringUtils';
import { fetchUserProfile, updateUserProfile } from '../../services/profile/userService';
import { useProfileContext } from '../../context/ProfileContext';
import { useToast } from '../../context/ToastContext';

export const useAccountInformation = (router) => {
  const [loading, setLoading] = useState(true);
  const { refreshProfile } = useProfileContext();
  const { showToast } = useToast();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(''); 


  const fetchProfile = useCallback(async () => {
    try {
      const user = await fetchUserProfile();
      if (user) {
        setFirstName(user.first_name || '');
        setLastName(user.last_name || '');
        setBirthDate(user.birth_date || '');
        setEmail(user.email || '');
        setAddress(formatAddress(user.country, user.province, user.city));


      } else {
        showToast('Failed to load profile.', 'error', 'Error');
      }
    } catch (error) {
      console.error('Fetch Profile Error:', error);
      showToast('Could not connect to the server.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const [country, province, city] = parseAddress(address);

      const success = await updateUserProfile({
        firstName,
        lastName,
        birthDate,
        country,
        province,
        city,
      });

      if (success) {
        refreshProfile();
        showToast('Information updated successfully!', 'success', 'Saved');
        router.back();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      showToast(error.message, 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };



  return {
    loading,
    firstName, setFirstName,
    lastName, setLastName,
    birthDate, setBirthDate,
    email,
    address, setAddress,
    handleSave
  };
};
