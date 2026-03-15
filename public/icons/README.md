# App Icons for Barcode PWA

This folder should contain the following icon files:

## Required Icons

### Primary Icons (required)
- **icon-192x192.png** - 192x192px (Chrome Android, app install)
- **icon-512x512.png** - 512x512px (Chrome desktop, splash screens, Android)
- **icon-180x180.png** - 180x180px (Apple/Safari on Mac/iOS)
- **favicon-32x32.png** - 32x32px (Browser tab fallback)

### Optional Screenshots (for app stores)
- **screenshot-540x720.png** - Mobile portrait screenshot
- **screenshot-1280x720.png** - Desktop/wide screenshot

## How to Generate Icons

### Option 1: Online Icon Generator (Free, Easiest)
1. Visit https://www.favicon-generator.org/
2. Upload a 512x512px logo or design
3. The site will generate all required sizes automatically
4. Download the ZIP and extract into this folder

**Logo Design Tips for Barcode:**
- Use the wabi-sabi aesthetic (earth tones, organic shapes)
- Include the 🌿 leaf element or shopping 🛒 element
- Keep it simple - looks good at 192x192px
- Use solid colors, avoid gradients (hard to see at small sizes)

### Option 2: Using ImageMagick (Command Line)
```bash
# If you have a 512x512 source image called logo.png:
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 180x180 icon-180x180.png
convert logo.png -resize 32x32 favicon-32x32.png
```

### Option 3: AI Image Generator
1. Use Midjourney, DALL-E, or similar
2. Prompt: "Minimalist organic grocery planner app icon, wabi-sabi aesthetic, earth tones, simple design"
3. Generate a 512x512px square image
4. Use an online icon generator to create all sizes

## Testing Icons

After adding icons:
```bash
npm run build
npm run preview
```

Then check DevTools:
- **Chrome/Edge:** Press F12 → Application → Manifest → check icons display
- **Safari:** Right-click → Add to Dock → should show icon

## Placeholder Workflow

Until you create proper icons:
1. The app will build and work fine (icons are optional for PWA installation)
2. Install prompt will appear but without a custom icon
3. Once icons are added, rebuild and redeploy
4. Users who install will get updated icons on next visit

## Icon Purpose Reference

| Size | Purpose | Where Shown |
|------|---------|------------|
| 192x192 | App install prompt | Chrome install dialog |
| 512x512 | App splash screen, Android home screen | Splash screen on startup, app drawer |
| 180x180 | Apple devices | Safari Add to Home Screen (Mac/iPhone) |
| 32x32 | Browser favicon | Browser tab, bookmarks, address bar |

---

**Note:** Sizes can vary slightly (±5px) without issues. The service worker will still function perfectly without icons - they just won't display until added.
