"use client"

import { useTheme } from 'next-themes';
import { Monitor, Smartphone } from 'lucide-react';

export function DesktopOnlyNotice() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 400,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Icon */}
        <div
          style={{
            position: 'relative',
            width: 120,
            height: 120,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 80,
              height: 80,
              borderRadius: 16,
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Monitor size={40} color="#3b82f6" strokeWidth={1.5} />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 60,
              height: 60,
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${isDark ? '#0a0a0a' : '#ffffff'}`,
            }}
          >
            <Smartphone size={28} color="#ef4444" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.87)',
              marginBottom: 8,
              letterSpacing: '-0.02em',
            }}
          >
            Desktop or Tablet Required
          </h1>
          <p
            style={{
              fontSize: 15,
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Nexboard requires a larger screen for the best experience. Please visit on a desktop, laptop, or tablet device.
          </p>
        </div>

        {/* Features List */}
        <div
          style={{
            width: '100%',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: 12,
            padding: 16,
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Desktop Features
          </p>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {['Infinite Canvas', 'Advanced Tools', 'Keyboard Shortcuts', 'Multi-window Support'].map((feature) => (
              <li
                key={feature}
                style={{
                  fontSize: 13,
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                  }}
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p
          style={{
            fontSize: 12,
            color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            margin: 0,
          }}
        >
          Mobile support coming soon
        </p>
      </div>
    </div>
  );
}
