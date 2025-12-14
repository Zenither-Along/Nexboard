"use client"

import { useIsMobile } from '@/lib/useIsMobile';
import { DesktopOnlyNotice } from '@/components/ui/DesktopOnlyNotice';

export function MobileDetector({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DesktopOnlyNotice />;
  }

  return <>{children}</>;
}
