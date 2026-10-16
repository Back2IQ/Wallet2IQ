// DAIO Commander - Branding Configuration
import type { BrandMode } from '@/types';

export interface BrandConfig {
  name: string;
  tagline: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    success: string;
    warning: string;
    danger: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
}

export const brandConfigs: Record<BrandMode, BrandConfig> = {
  back2iq: {
    name: 'Back2IQ',
    tagline: 'Ahead by Design',
    logo: '/logo-back2iq.svg',
    colors: {
      primary: '#0f172a',    // Slate 900
      secondary: '#06b6d4',  // Cyan 500
      accent: '#22d3ee',     // Cyan 400
      background: '#020617', // Slate 950
      surface: '#1e293b',    // Slate 800
      text: '#f8fafc',       // Slate 50
      textMuted: '#94a3b8',  // Slate 400
      success: '#22c55e',    // Green 500
      warning: '#f59e0b',    // Amber 500
      danger: '#ef4444',     // Red 500
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
  },
  fp: {
    name: 'F&P Kapitalstrukturen',
    tagline: 'Ihre digitale Erbfolge',
    logo: '/logo-fp.svg',
    colors: {
      primary: '#1e3a5f',    // F&P Dunkelblau
      secondary: '#d4af37',  // F&P Gold
      accent: '#c9a227',     // Gold dunkler
      background: '#0f172a', // Dunkelblau
      surface: '#1e293b',    // Slate 800
      text: '#f8fafc',       // Weiß
      textMuted: '#94a3b8',  // Grau
      success: '#22c55e',    // Grün
      warning: '#f59e0b',    // Amber
      danger: '#ef4444',     // Rot
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
  },
};

// Helper to get CSS variables for current brand
export const getBrandCSSVariables = (mode: BrandMode): Record<string, string> => {
  const config = brandConfigs[mode];
  return {
    '--brand-primary': config.colors.primary,
    '--brand-secondary': config.colors.secondary,
    '--brand-accent': config.colors.accent,
    '--brand-background': config.colors.background,
    '--brand-surface': config.colors.surface,
    '--brand-text': config.colors.text,
    '--brand-text-muted': config.colors.textMuted,
    '--brand-success': config.colors.success,
    '--brand-warning': config.colors.warning,
    '--brand-danger': config.colors.danger,
    '--font-heading': config.fonts.heading,
    '--font-body': config.fonts.body,
    '--font-mono': config.fonts.mono,
  };
};

// Apply brand styles to document
export const applyBrandStyles = (mode: BrandMode) => {
  const variables = getBrandCSSVariables(mode);
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', brandConfigs[mode].colors.primary);
  }
};
