/**
 * NutriSakti v4 — Warm Family-Friendly Theme
 *
 * Design principles:
 *  - Warm, nurturing colors (not cold tech blues)
 *  - High contrast for readability
 *  - Larger base font sizes throughout
 *  - Soft rounded feel, not clinical
 *
 * Light: Warm cream/peach background, deep teal accents, coral highlights
 * Dark:  Deep warm navy, soft teal accents, warm amber highlights
 */

export const themes = {
  light: {
    // Backgrounds
    bg:          '#fdf6f0',   // warm cream — like a cozy home
    surface:     '#ffffff',   // pure white cards
    surfaceAlt:  '#fff8f3',   // slightly warm card variant

    // Borders
    border:      '#f0d9c8',   // warm peach border

    // Text
    text:        '#2d1f14',   // deep warm brown — very readable
    textMuted:   '#7a5c44',   // medium warm brown
    textFaint:   '#b08060',   // light warm brown

    // Accent — deep teal, trustworthy and calm
    accent:      '#0d7377',   // deep teal
    accentLight: '#14a085',   // lighter teal for hover
    accentBg:    '#e8f7f5',   // very light teal background

    // Warm highlight — coral/orange for CTAs
    warm:        '#e8622a',   // warm coral-orange
    warmLight:   '#ff8c5a',   // lighter coral
    warmBg:      '#fff0e8',   // very light coral background

    // Status colors
    success:     '#2d7a4f',   // forest green
    successBg:   '#e8f5ee',
    warning:     '#c47c00',   // amber
    warningBg:   '#fff8e1',
    danger:      '#c0392b',   // warm red
    dangerBg:    '#fdecea',

    // Table
    rowAlt:      '#fff8f3',
    rowOverdue:  '#fdecea',

    // Input
    inputBg:     '#fff8f3',

    // Stat number color
    statColor:   '#0d7377',

    // Progress bar background
    barBg:       '#f0d9c8',

    // Sidebar gradient
    sidebarGradient: 'linear-gradient(180deg, #0d7377 0%, #0a5c60 100%)',
    sidebarText:     '#e8f7f5',
    sidebarMuted:    '#a8d8d8',
    sidebarActive:   'rgba(255,255,255,0.15)',
    sidebarBorder:   'rgba(255,255,255,0.1)',
  },

  dark: {
    // Backgrounds
    bg:          '#1a1208',   // very deep warm brown-black
    surface:     '#261a0e',   // warm dark brown surface
    surfaceAlt:  '#2e2010',   // slightly lighter

    // Borders
    border:      '#3d2c1a',   // warm dark border

    // Text
    text:        '#f5e6d3',   // warm cream text
    textMuted:   '#c4956a',   // warm tan
    textFaint:   '#8a6040',   // muted warm brown

    // Accent — warm teal
    accent:      '#2ec4b6',   // bright warm teal
    accentLight: '#3dd9ca',
    accentBg:    '#0d2e2c',

    // Warm highlight
    warm:        '#ff8c5a',   // warm coral
    warmLight:   '#ffaa7a',
    warmBg:      '#2e1a0e',

    // Status
    success:     '#4caf7d',
    successBg:   '#0d2e1a',
    warning:     '#ffb74d',
    warningBg:   '#2e2000',
    danger:      '#ef5350',
    dangerBg:    '#2e0d0d',

    // Table
    rowAlt:      '#1a1208',
    rowOverdue:  '#2e0d0d',

    // Input
    inputBg:     '#1a1208',

    // Stat
    statColor:   '#2ec4b6',

    // Progress bar
    barBg:       '#3d2c1a',

    // Sidebar
    sidebarGradient: 'linear-gradient(180deg, #0d2e2c 0%, #0a2220 100%)',
    sidebarText:     '#e8f7f5',
    sidebarMuted:    '#6ab8b0',
    sidebarActive:   'rgba(46,196,182,0.15)',
    sidebarBorder:   'rgba(46,196,182,0.1)',
  },
};
