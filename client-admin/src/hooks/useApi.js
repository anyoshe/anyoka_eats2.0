import { useState, useEffect } from 'react';

// Custom hook for API calls with loading and error states
export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// Hook for paginated data
export function usePaginatedApi(apiCall, pageSize = 10, dependencies = []) {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useApi(
    () => apiCall({ page, limit: pageSize }),
    [page, pageSize, ...dependencies]
  );

  const pageCount = data ? Math.ceil((data.total || data.length) / pageSize) : 0;

  return {
    data: data?.items || data || [],
    total: data?.total || data?.length || 0,
    page,
    pageCount,
    loading,
    error,
    setPage,
    refetch
  };
}

