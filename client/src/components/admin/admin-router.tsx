import React, { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';

// This component handles direct hits to admin URLs
export default function AdminRouter() {
  const [location, navigate] = useLocation();
  const [match] = useRoute('/admin/*');
  
  useEffect(() => {
    if (match) {
      console.log('Admin router handling admin route:', location);
      
      // Keep the user on the same URL but ensure our routing system picks it up
      // This allows direct visits to admin URLs to work properly
      navigate(location);
    }
  }, [location, match, navigate]);
  
  return null;
}