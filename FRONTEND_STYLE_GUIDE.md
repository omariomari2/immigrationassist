# Quantro Dashboard - Frontend Style Guide

> **Purpose**: This document defines the visual language and component patterns for the Quantro Dashboard. All new frontend components MUST follow these guidelines to maintain design consistency.

---

## 📋 Structure

```
FRONTEND_STYLE_GUIDE.md
│
├── 🎨 Color Palette ─────────── Semantic color tokens & Tailwind classes
│
├── 🔤 Typography ────────────── Font family, text styles, key patterns
│
├── 📐 Spacing & Layout ──────── Container, padding, gaps, responsive breakpoints
│
├── 🃏 Card Styling ──────────── Standard cards, chart cards, key properties
│
├── 🔘 Buttons & Interactive ─── Icon buttons, tabs, action buttons
│
├── ✨ Animations ────────────── Framer Motion patterns (bars, tabs, tooltips)
│
├── 📊 Chart Patterns ────────── Bar styling, colors, tooltips
│
├── 🖼️ Icons ─────────────────── Lucide React usage, custom SVGs
│
├── 📝 Form Elements ─────────── Search input pattern
│
├── 👤 Avatar Patterns ───────── Single avatar, avatar stack
│
├── 🏗️ Component Template ────── Starter structure for new components
│
├── ✅ Checklist ─────────────── Quick validation for new components
│
└── 🚫 Don'ts ────────────────── Anti-patterns to avoid
```

---

## 🎨 Color Palette

### Semantic Colors (Use These)

| Token | Hex | Usage |
|-------|-----|-------|
| `bgPrimary` | `#EAEAEA` | Main page background |
| `bgCard` | `#FFFFFF` | Card/component backgrounds |
| `textPrimary` | `#111827` | Primary text (headings, important content) |
| `textSecondary` | `#6B7280` | Body text, descriptions |
| `textTertiary` | `#9CA3AF` | Muted text, labels |
| `accentGreen` | `#4ADE80` | Primary accent, highlights, success states |
| `accentGreenLight` | `#DCFCE7` | Light green backgrounds |
| `chartDark` | `#1F2937` | Dark chart elements, emphasis bars |
| `chartGray` | `#E5E7EB` | Light chart elements, backgrounds |

### Direct Tailwind Classes

```
bg-bgPrimary       // Page background
bg-bgCard / bg-white  // Cards
text-textPrimary   // Primary headings
text-textSecondary // Body text
text-textTertiary  // Labels, muted
bg-black           // Active states, CTA elements
text-white         // Text on dark backgrounds
bg-green-400       // Accent highlights
text-green-400/500 // Green text accents
bg-gray-300        // Neutral chart bars
bg-gray-100        // Hover states on white
```

---

## 🔤 Typography

### Font Family
- **Primary**: `Inter` (Google Fonts)
- **Fallback**: `sans-serif`
- All text uses Inter. Include via CDN in `index.html`.

### Text Styles

| Purpose | Classes |
|---------|---------|
| Page Title | `text-2xl font-medium text-textPrimary` |
| KPI Large Number | `text-6xl sm:text-7xl font-semibold tracking-tight text-gray-800` |
| Section Label | `text-[10px] font-bold text-gray-400 uppercase tracking-wider` |
| Card Header | `text-[10px] font-bold text-gray-400 uppercase tracking-wider` |
| Body Text | `text-sm text-gray-600` |
| Button Text | `text-xs font-medium` or `text-sm font-medium` |
| Small Labels | `text-[10px] text-gray-400 font-medium` |
| User Name | `text-xs font-semibold text-gray-900` |
| User Role | `text-xs text-gray-400` |

### Key Patterns
- Use `tracking-tight` for large numbers
- Use `tracking-wider` for uppercase labels
- Muted suffixes: `<span className="text-gray-400/80">` for secondary digits
- Leading none (`leading-none`) for large numbers to control line height

---

## 📐 Spacing & Layout

### Container
```jsx
<div className="max-w-[1280px] mx-auto pt-6 px-4 sm:px-8">
```

### Card Padding
- Standard cards: `p-6`
- Cards with charts: `p-6 pb-2` (less bottom for chart axis)

### Section Gaps
- Between major sections: `mb-6`, `mb-8`
- Grid gap: `gap-6`
- Element spacing within cards: `gap-2`, `gap-4`

### Responsive Breakpoints
- Mobile-first approach
- `sm:` - Small screens and up
- `md:` - Medium screens (tablet+) for grid layouts
- Common pattern: `flex-col md:flex-row`

---

## 🃏 Card Styling

### Standard Card
```jsx
<div className="bg-white p-6 rounded-3xl shadow-soft">
  {/* Content */}
</div>
```

### Key Properties
- **Border Radius**: `rounded-3xl` (24px) - THE signature look
- **Shadow**: `shadow-soft` (`0 4px 20px -2px rgba(0, 0, 0, 0.05)`)
- **Background**: Pure white `bg-white` or `bg-bgCard`
- **Padding**: `p-6` standard

### Chart Cards
```jsx
<div className="bg-white p-6 rounded-3xl shadow-soft h-[260px] flex flex-col justify-between">
```
- Fixed heights for consistency: `h-[260px]`
- `overflow-hidden` when content may clip

---

## 🔘 Buttons & Interactive Elements

### Icon Button (Standard)
```jsx
<button className="p-2 bg-white rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm">
  <Icon className="w-4 h-4" />
</button>
```

### Icon Button (Active State)
```jsx
<button className="w-9 h-9 flex items-center justify-center rounded-lg bg-black text-white">
  <Icon />
</button>
```

### Tab Button (Pill Style)
```jsx
<button className="relative px-5 py-1.5 text-sm font-medium rounded-lg">
  {isActive && (
    <motion.div
      layoutId="activeTab"
      className="absolute inset-0 bg-black rounded-lg"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
  )}
  <span className={isActive ? 'text-white' : 'text-gray-500'}>Label</span>
</button>
```

### Tab Container
```jsx
<div className="flex bg-white p-1 rounded-xl shadow-sm">
  {/* Tab buttons */}
</div>
```

### Action Button with Badge
```jsx
<div className="flex items-center bg-black text-white pl-3 pr-1 py-1 rounded-lg shadow-sm">
  <span className="text-xs font-semibold mr-2">+23</span>
  <div className="flex -space-x-2">
    {/* Avatar stack */}
  </div>
</div>
```

---

## ✨ Animations (Framer Motion)

### Import
```jsx
import { motion } from 'framer-motion';
```

### Bar Chart Animation
```jsx
<motion.div
  initial={{ height: 0 }}
  animate={{ height: `${percentage}%` }}
  transition={{ duration: 0.5, delay: index * 0.02, ease: "easeOut" }}
/>
```

### Tab Switch Animation
```jsx
<motion.div
  layoutId="activeTab"
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

### SVG Path Animation (Gauges)
```jsx
<motion.circle
  initial={{ strokeDashoffset: circumference }}
  animate={{ strokeDashoffset: targetOffset }}
  transition={{ duration: 1, ease: "easeOut" }}
/>
```

### Tooltip Fade In
```jsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.8 }}
/>
```

### Key Animation Principles
- Stagger delays for sequential elements: `delay: index * 0.02`
- Use spring physics for UI transitions: `type: "spring"`
- Use easeOut for data visualizations
- Keep durations short: 0.3s - 1s max

---

## 📊 Chart Patterns

### Bar Chart Bars
```jsx
<div className="w-[3px] rounded-t-full" style={{ backgroundColor: color }}>
```
- Thin bars: `w-[3px]` or responsive `w-full` in grid
- Rounded tops: `rounded-t-full` or `rounded-md`
- Gap between bars: `gap-[2px]` or `gap-[3px]`

### Chart Colors
| Type | Color |
|------|-------|
| Primary/Active | `#1F2937` (gray-800) or `#000000` |
| Accent/Highlight | `#4ADE80` (green-400) |
| Neutral/Inactive | `#D1D5DB` (gray-300) |

### Tooltips
```jsx
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
  bg-black text-white text-[10px] font-medium py-1 px-2 rounded-md 
  whitespace-nowrap shadow-lg">
  Content
  <div className="absolute top-full left-1/2 -translate-x-1/2 
    border-4 border-transparent border-t-black"></div>
</div>
```

---

## 🖼️ Icons

### Primary Icon Library
- **Lucide React**: `lucide-react`
- Icon size: `w-4 h-4` (16px) standard, `w-3 h-3` for compact

### Custom SVG Icons
- Use `stroke="currentColor"` for color inheritance
- `strokeWidth="2"` standard
- `strokeLinecap="round"` and `strokeLinejoin="round"` for smooth lines

### Import Pattern
```jsx
import { Search, Bell, ChevronDown, Plus, Calendar } from 'lucide-react';
```

---

## 📝 Form Elements

### Search Input
```jsx
<div className="relative group">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
  <input 
    type="text" 
    placeholder="Search Dashboard" 
    className="pl-9 pr-4 py-2 bg-white rounded-lg text-sm text-gray-700 w-64 
      shadow-sm border border-transparent focus:border-gray-200 
      focus:outline-none transition-all placeholder:text-gray-300"
  />
</div>
```

---

## 👤 Avatar Patterns

### Single Avatar with Status
```jsx
<div className="relative">
  <img src="..." className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
</div>
```

### Avatar Stack
```jsx
<div className="flex -space-x-2">
  {[1, 2, 3].map((i) => (
    <img key={i} src={`...`} className="w-6 h-6 rounded-full border border-black" />
  ))}
</div>
```

---

## 🏗️ Component Structure Template

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { IconName } from 'lucide-react';

interface ComponentProps {
  // Props
}

export const ComponentName: React.FC<ComponentProps> = ({ props }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-soft">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Title
        </h3>
        <div className="flex gap-2">
          {/* Action buttons */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Main content */}
      </div>

      {/* Footer/Legend (optional) */}
      <div className="flex justify-center gap-4 text-[10px] font-medium text-gray-500 mt-2">
        {/* Legend items */}
      </div>
    </div>
  );
};
```

---

## ✅ Checklist for New Components

- [ ] Uses `rounded-3xl` for main card containers
- [ ] Uses `shadow-soft` for card elevation
- [ ] Uses Inter font via Tailwind config
- [ ] Headers are `text-[10px] font-bold text-gray-400 uppercase tracking-wider`
- [ ] Animations use Framer Motion with appropriate easing
- [ ] Icon buttons follow the standard pattern
- [ ] Colors use semantic tokens from the palette
- [ ] Responsive: works on mobile and desktop
- [ ] Interactive elements have hover states
- [ ] Tooltips follow the black bubble pattern

---

## 🚫 Don'ts

- Don't use different border-radius values (stick to `rounded-3xl` for cards, `rounded-lg` for buttons)
- Don't use different shadow values than `shadow-soft` or `shadow-sm`
- Don't use colors outside the defined palette
- Don't skip animations for data visualizations
- Don't use different font families
- Don't use outline-based focus states (use border-color changes instead)
