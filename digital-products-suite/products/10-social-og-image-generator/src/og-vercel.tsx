/**
 * Social OG Image Generator - Vercel Edge Runtime Handler
 * 
 * Generates dynamic 1200x630 Open Graph (OG) social card images at the edge
 * using `@vercel/og` (powered by Satori and Resvg).
 * 
 * @author QorelySofts
 * @license MIT
 */

import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

/**
 * Valid theme identifiers.
 */
export type ThemeKey = 'dark' | 'light' | 'blue' | 'purple';

/**
 * Theme color palette interface.
 */
export interface ThemePalette {
  name: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  titleColor: string;
  subtextColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  avatarBg: string;
  cardBorder: string;
}

/**
 * Theme dictionary mapping theme names to style configurations.
 */
export const THEMES: Record<ThemeKey, ThemePalette> = {
  dark: {
    name: 'Dark Slate',
    bgGradientStart: '#090d16',
    bgGradientEnd: '#1e293b',
    titleColor: '#f8fafc',
    subtextColor: '#94a3b8',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.12)',
    badgeText: '#38bdf8',
    badgeBorder: 'rgba(56, 189, 248, 0.3)',
    avatarBg: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
  },
  light: {
    name: 'Clean Light',
    bgGradientStart: '#ffffff',
    bgGradientEnd: '#f1f5f9',
    titleColor: '#0f172a',
    subtextColor: '#64748b',
    accentColor: '#2563eb',
    badgeBg: 'rgba(37, 99, 235, 0.08)',
    badgeText: '#2563eb',
    badgeBorder: 'rgba(37, 99, 235, 0.25)',
    avatarBg: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
    cardBorder: 'rgba(0, 0, 0, 0.08)',
  },
  blue: {
    name: 'Ocean Indigo',
    bgGradientStart: '#060d1f',
    bgGradientEnd: '#1e1b4b',
    titleColor: '#ffffff',
    subtextColor: '#a5b4fc',
    accentColor: '#6366f1',
    badgeBg: 'rgba(99, 102, 241, 0.15)',
    badgeText: '#818cf8',
    badgeBorder: 'rgba(99, 102, 241, 0.35)',
    avatarBg: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
    cardBorder: 'rgba(99, 102, 241, 0.2)',
  },
  purple: {
    name: 'Neon Cyberpunk',
    bgGradientStart: '#140321',
    bgGradientEnd: '#3b0764',
    titleColor: '#ffffff',
    subtextColor: '#f0abfc',
    accentColor: '#d946ef',
    badgeBg: 'rgba(217, 70, 239, 0.15)',
    badgeText: '#e879f9',
    badgeBorder: 'rgba(217, 70, 239, 0.35)',
    avatarBg: 'linear-gradient(135deg, #a21caf 0%, #f472b6 100%)',
    cardBorder: 'rgba(217, 70, 239, 0.2)',
  },
};

/**
 * Calculates optimal responsive font size based on title length.
 * @param length - String length of the title.
 * @returns CSS font size string in pixels.
 */
function calculateFontSize(length: number): string {
  if (length <= 35) return '62px';
  if (length <= 65) return '52px';
  if (length <= 95) return '44px';
  return '38px';
}

/**
 * Extracts author initials for the avatar placeholder.
 * @param author - Full author name.
 * @returns 1-2 character initials.
 */
function getAuthorInitials(author: string): string {
  if (!author) return 'QS';
  const parts = author.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Edge API route handler for Vercel.
 * @param request - Incoming HTTP Request.
 * @returns 1200x630 PNG ImageResponse.
 */
export default async function handler(request: Request): Promise<ImageResponse> {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters with production defaults
    const title = searchParams.get('title') || 'Architecting High-Scale Cloud Systems';
    const author = searchParams.get('author') || 'QorelySofts Engineering';
    const tag = searchParams.get('tag') || 'Architecture';
    const rawTheme = (searchParams.get('theme') || 'dark').toLowerCase() as ThemeKey;
    const site = searchParams.get('site') || 'qorelysofts.com';

    const theme = THEMES[rawTheme] || THEMES.dark;
    const fontSize = calculateFontSize(title.length);
    const initials = getAuthorInitials(author);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: `linear-gradient(145deg, ${theme.bgGradientStart} 0%, ${theme.bgGradientEnd} 100%)`,
            padding: '72px 80px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Decorative Background Glows */}
          <div
            style={{
              position: 'absolute',
              top: '-180px',
              right: '-180px',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.accentColor} 0%, transparent 70%)`,
              opacity: 0.16,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-220px',
              left: '-100px',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.accentColor} 0%, transparent 75%)`,
              opacity: 0.1,
            }}
          />

          {/* Decorative Geometric Vector Lines */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '80px',
              display: 'flex',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: theme.accentColor,
                opacity: 0.6,
              }}
            />
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: theme.subtextColor,
                opacity: 0.3,
              }}
            />
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: theme.subtextColor,
                opacity: 0.15,
              }}
            />
          </div>

          {/* Header Row: Category Badge & Site Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              zIndex: 10,
            }}
          >
            {/* Category Tag Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 24px',
                borderRadius: '9999px',
                backgroundColor: theme.badgeBg,
                border: `1.5px solid ${theme.badgeBorder}`,
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.badgeText,
                }}
              />
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: theme.badgeText,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {tag}
              </span>
            </div>

            {/* Site Branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: theme.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '20px',
                }}
              >
                Q
              </div>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: theme.subtextColor,
                  letterSpacing: '0.02em',
                }}
              >
                {site}
              </span>
            </div>
          </div>

          {/* Main Title Block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              margin: '32px 0',
              zIndex: 10,
              maxWidth: '1040px',
            }}
          >
            <h1
              style={{
                fontSize,
                fontWeight: 800,
                color: theme.titleColor,
                lineHeight: 1.18,
                letterSpacing: '-0.03em',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h1>
          </div>

          {/* Footer Row: Author Profile and Visual Accent */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '28px',
              borderTop: `1px solid ${theme.cardBorder}`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
              }}
            >
              {/* Author Initials Avatar */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: theme.avatarBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '22px',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
                }}
              >
                {initials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: theme.titleColor,
                  }}
                >
                  {author}
                </span>
                <span
                  style={{
                    fontSize: '17px',
                    color: theme.subtextColor,
                    fontWeight: 500,
                  }}
                >
                  Author &bull; Verified Publication
                </span>
              </div>
            </div>

            {/* Read Time / Accent Metric Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: theme.subtextColor,
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              <span>5 min read</span>
              <span style={{ color: theme.accentColor }}>&rarr;</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
        },
      }
    );
  } catch (error: any) {
    // Fallback safe rendering on unexpected edge error
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#090d16',
            color: '#ffffff',
            fontSize: '36px',
            fontFamily: 'sans-serif',
          }}
        >
          OG Generation Error: {error?.message || 'Unknown Error'}
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
