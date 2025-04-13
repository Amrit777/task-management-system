// client/src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import API from '../api';

const useAuth = () => {
  const [user, setUser] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile'); // Endpoint needs to be implemented on backend
      setUser(res.data);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { user, setUser, fetchProfile };
};

export default useAuth;
