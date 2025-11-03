# 🎨 AudibleClone Design System

Apple Podcasts-inspired design system built for React Native / Expo.

## 📦 What's Included

### Design Tokens
Located in `/tokens/`:
- **Colors** - Light/dark mode color palettes
- **Typography** - SF Pro-inspired type scale
- **Spacing** - 8pt grid system
- **Shadows** - Elevation levels
- **Animations** - Spring configs and timing

### Components
Coming soon in `/components/`:
- Primitive UI components
- Composite components
- Layout utilities

## 🚀 Usage

### Import Tokens
```typescript
import { colors, typography, spacing, shadows } from '@/design-system/tokens';
```

### Using Colors
```typescript
import { getColors } from '@/design-system/tokens';

const colors = getColors('dark'); // or 'light'
const primaryColor = colors.primary; // '#A855F7'
```

### Using Typography
```typescript
import { getTextStyle } from '@/design-system/tokens';

<Text style={getTextStyle('headline')}>Hello World</Text>
```

### Using Spacing
```typescript
import { spacing, semanticSpacing } from '@/design-system/tokens';

<View style={{ padding: spacing.lg }}>  // 16px
<View style={{ margin: semanticSpacing.sectionSpacing }}>  // 24px
```

### Using Shadows
```typescript
import { getShadowStyle } from '@/design-system/tokens';

<View style={[styles.card, getShadowStyle('medium', 'dark')]}>
```

### Using Animations
```typescript
import { springs, durations } from '@/design-system/tokens';

// With react-native-reanimated
withSpring(value, springs.bouncy);
withTiming(value, { duration: durations.normal });
```

## 📐 Design Principles

### 1. Consistency
All design decisions should reference tokens, not hardcoded values.

❌ Bad:
```typescript
<View style={{ padding: 16, borderRadius: 12 }}>
```

✅ Good:
```typescript
<View style={{
  padding: spacing.lg,
  borderRadius: radius.lg
}}>
```

### 2. Semantic Naming
Use semantic names over raw values when possible.

❌ Bad:
```typescript
<View style={getShadowStyle('medium', mode)}>
```

✅ Good:
```typescript
<View style={getSemanticShadow('card', mode)}>
```

### 3. Responsive to Theme
All components should adapt to light/dark mode.

```typescript
const colors = getColors(colorMode);
const shadows = getShadows(colorMode);
```

## 🎨 Color System

### Light Mode
- Primary: `#8E4EC6` (Purple)
- Background: `#FFFFFF`
- Foreground: `#1D1D1F`

### Dark Mode
- Primary: `#A855F7` (Brighter Purple)
- Background: `#000000`
- Foreground: `#FFFFFF`

## 📏 Typography Scale

Based on iOS Human Interface Guidelines:

| Style | Size | Weight | Use Case |
|-------|------|--------|----------|
| Large Title | 34pt | Bold | Screen titles |
| Title 1 | 28pt | Bold | Section headers |
| Title 2 | 22pt | Bold | Card titles |
| Title 3 | 20pt | Semibold | List headers |
| Headline | 17pt | Semibold | Emphasized text |
| Body | 17pt | Regular | Body text |
| Callout | 16pt | Regular | Secondary text |
| Subheadline | 15pt | Regular | Supporting text |
| Footnote | 13pt | Regular | Metadata |
| Caption 1 | 12pt | Regular | Small labels |
| Caption 2 | 11pt | Regular | Smallest text |

## 📐 Spacing Scale

8-point grid system:

| Token | Value | Use Case |
|-------|-------|----------|
| xs | 4px | Tiny gaps |
| sm | 8px | Small gaps |
| md | 12px | Medium gaps |
| lg | 16px | Standard gaps |
| xl | 20px | Large gaps |
| 2xl | 24px | Section spacing |
| 3xl | 32px | Large sections |
| 4xl | 40px | Hero spacing |
| 5xl | 48px | Extra large |
| 6xl | 64px | Maximum |

## 🌑 Shadow Levels

| Level | Use Case |
|-------|----------|
| none | Flat elements |
| subtle | Default cards |
| small | Buttons, inputs |
| medium | Modals, popovers |
| large | Sheets, dialogs |
| floating | FABs, floating player |

## ⏱️ Animation Timing

| Duration | ms | Use Case |
|----------|-----|----------|
| instant | 0 | No animation |
| fastest | 100 | Button press |
| faster | 150 | Hover states |
| fast | 200 | Quick transitions |
| normal | 300 | Standard transitions |
| slow | 400 | Deliberate animations |
| slower | 500 | Large movements |
| slowest | 600 | Dramatic effects |

## 🔄 Migration Guide

### From Old System
If you have existing components using hardcoded values:

1. **Replace hardcoded colors**
   ```typescript
   // Before
   color: '#a855f7'

   // After
   color: colors.primary
   ```

2. **Replace hardcoded spacing**
   ```typescript
   // Before
   padding: 16

   // After
   padding: spacing.lg
   ```

3. **Replace hardcoded fonts**
   ```typescript
   // Before
   fontSize: 17, fontWeight: '600'

   // After
   ...getTextStyle('headline')
   ```

## 📚 Further Reading

- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)
- [React Native Styling](https://reactnative.dev/docs/style)
- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)

---

**Last Updated:** October 17, 2025
**Version:** 1.0.0
