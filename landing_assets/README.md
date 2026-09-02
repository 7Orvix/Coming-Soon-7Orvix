# 7ORVIX Landing Page & Fluid Physics Asset Bundle

This directory (`landing_assets/`) contains all the extracted, modular assets used in the 7ORVIX realistic fluid floating logo landing experience (`landing_sample.html`).

---

## 📁 Included Assets

1. **`7ORVIX_glyph_favicon.svg`**
   - Standalone SVG of the brand gradient **'7'** glyph icon.
   - Ideal for website favicons, mobile app icons, or small brand marks.

2. **`7ORVIX_wordmark.svg`**
   - Full 372x46 vector SVG of the complete 7ORVIX logo wordmark (orange/red gradient '7' + clean light 'ORVIX').

3. **`styles.css`**
   - Complete CSS design system with CSS custom properties (`--canvas`, `--brand`, `--ink`, etc.), typography tokens, status pill animations, and layout classes.

4. **`fluid_physics.js`**
   - Standalone, zero-dependency Vanilla JS module for the realistic fluid floating physics simulation loop (`requestAnimationFrame`, soft boundary springs, heavy drag, and ambient drifting particle physics).

5. **`WaterFloatingLogo.jsx`**
   - Production-ready React component (compatible with React 18+, Next.js, and Vite) that integrates the CSS stylesheet and fluid physics engine with lifecycle cleanup (`useEffect` & `useRef`).

---

## 🚀 Usage Guide

### Option 1: Vanilla HTML / JS Project
1. Link `styles.css` in your HTML `<head>`:
   ```html
   <link rel="stylesheet" href="./landing_assets/styles.css">
   ```
2. Import and initialize `fluid_physics.js`:
   ```javascript
   import { initFluidPhysics } from './landing_assets/fluid_physics.js';

   // Initialize physics engine
   const destroy = initFluidPhysics();
   ```

### Option 2: React / Next.js / Vite Project
1. Copy the `landing_assets/` folder into your React `src/components/` directory.
2. Import and render the component in any page:
   ```jsx
   import WaterFloatingLogo from './landing_assets/WaterFloatingLogo';

   export default function Page() {
     return <WaterFloatingLogo />;
   }
   ```
