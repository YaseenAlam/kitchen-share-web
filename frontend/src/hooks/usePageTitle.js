import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | Kitchen Share` : 'Kitchen Share | Homemade Food from Your Neighbors';
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}