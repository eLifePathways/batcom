import React, { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';

// This component handles direct hits to admin URLs
export default function AdminRouter() {
  const [location, navigate] = useLocation();
  const [isAdminRoute] = useRoute('/admin/*');
  const [isExactAdminRoute] = useRoute('/admin');
  
  useEffect(() => {
    if (isAdminRoute || isExactAdminRoute) {
      console.log('Admin router handling admin route:', location);
      
      // For admin routes, we want to ensure the admin layout is applied
      // and the correct component is rendered
      
      // This is a no-op navigation that forces a re-render while keeping the URL the same
      // It helps ensure the router picks up the route correctly after a direct page load
      const currentPath = location;
      window.setTimeout(() => {
        navigate(currentPath, { replace: true });
        console.log('Admin router navigation complete');
      }, 0);
    }
  }, [isAdminRoute, isExactAdminRoute]);
  
  return null;
}