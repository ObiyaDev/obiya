'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { trackTwitterEvent } from './tracking';
import { useEffect } from 'react';

export function RouteTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        trackTwitterEvent('pageview', { pathname });
    }, [pathname, searchParams]);
  
  return null;
} 