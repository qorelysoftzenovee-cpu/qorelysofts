/**
 * Social OG Image Generator - Theme Definitions
 * 
 * Provides color palettes, typography colors, and gradient configurations
 * for social cards across dark, light, blue, and purple design systems.
 * 
 * @author QorelySofts
 * @license MIT
 */

/**
 * @typedef {Object} ThemeDefinition
 * @property {string} name - Friendly display name.
 * @property {string} bgGradientStart - Start color for linear gradient (hex or rgba).
 * @property {string} bgGradientEnd - End color for linear gradient (hex or rgba).
 * @property {string} titleColor - Primary text color for heading.
 * @property {string} subtextColor - Secondary text color for author and metadata.
 * @property {string} accentColor - Vibrant accent color for borders and highlights.
 * @property {string} badgeBg - Pill badge background color.
 * @property {string} badgeText - Pill badge text color.
 * @property {string} cardBorder - Outer frame or card border color.
 * @property {string} decorColor - Decorative vector shapes / geometry color.
 */

/**
 * Available theme presets.
 * @type {Record<string, ThemeDefinition>}
 */
const themes = {
  dark: {
    name: 'Dark Slate',
    bgGradientStart: '#0f172a',
    bgGradientEnd: '#1e293b',
    titleColor: '#ffffff',
    subtextColor: '#94a3b8',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    badgeText: '#38bdf8',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    decorColor: 'rgba(56, 189, 248, 0.08)'
  },
  light: {
    name: 'Clean Light',
    bgGradientStart: '#ffffff',
    bgGradientEnd: '#f1f5f9',
    titleColor: '#0f172a',
    subtextColor: '#64748b',
    accentColor: '#2563eb',
    badgeBg: 'rgba(37, 99, 235, 0.1)',
    badgeText: '#2563eb',
    cardBorder: 'rgba(0, 0, 0, 0.08)',
    decorColor: 'rgba(37, 99, 235, 0.06)'
  },
  blue: {
    name: 'Ocean Indigo',
    bgGradientStart: '#0b1329',
    bgGradientEnd: '#1e1b4b',
    titleColor: '#ffffff',
    subtextColor: '#a5b4fc',
    accentColor: '#6366f1',
    badgeBg: 'rgba(99, 102, 241, 0.2)',
    badgeText: '#818cf8',
    cardBorder: 'rgba(99, 102, 241, 0.25)',
    decorColor: 'rgba(99, 102, 241, 0.1)'
  },
  purple: {
    name: 'Neon Cyberpunk',
    bgGradientStart: '#180728',
    bgGradientEnd: '#3b0764',
    titleColor: '#ffffff',
    subtextColor: '#f0abfc',
    accentColor: '#d946ef',
    badgeBg: 'rgba(217, 70, 239, 0.2)',
    badgeText: '#e879f9',
    cardBorder: 'rgba(217, 70, 239, 0.25)',
    decorColor: 'rgba(217, 70, 239, 0.1)'
  }
};

/**
 * Resolves a theme name to its definition, falling back to 'dark' if unrecognized.
 * @param {string} [themeName]
 * @returns {ThemeDefinition}
 */
function getTheme(themeName) {
  if (!themeName) return themes.dark;
  const key = themeName.toLowerCase().trim();
  return themes[key] || themes.dark;
}

module.exports = {
  themes,
  getTheme
};
