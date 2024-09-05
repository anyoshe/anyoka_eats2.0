import { useState, useEffect } from 'react';
import axios from 'axios';

export const useFetchConferences = (partnerId) => {
  const [conferences, setConferences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchConferences = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${config.backendUrl}/api/conferences/${partnerId}`);
        if (isMounted) {
          setConferences(response.data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching conferences:', err);
          setIsLoading(false);
          setError(err.message);
        }
      }
    };

    fetchConferences();

    return () => {
      isMounted = false;
    };
  }, [partnerId]);

  return { conferences, isLoading, error };
};
