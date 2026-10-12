# Abdul Kareem — Portfolio

Personal portfolio site for Abdul Kareem, Backend Engineer.

## Run locally

No build step required. Serve with any static file server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

Open `http://localhost:8080` in your browser.

> **Note:** The site uses ES modules (`type="module"`), so it must be served over HTTP — opening `index.html` directly as a `file://` URL will not work.

## Edit content

| What to change | Where |
|---|---|
| Personal info, bio, stats | `index.html` — relevant section |
| Colours, fonts, spacing | `css/style.css` — `:root` variables |
| Hero 3D scene | `js/three-scene.js` |
| Skills 3D tiles | `js/skills-3d.js` + `SKILLS` array in `js/main.js` |
| Skill icons | `assets/icons/` — SVG files named `<icon>.svg` |
| Profile photo | Replace `img/MyPassportSizePic-removebg-preview.png` |

## File structure

```
/
├── index.html
├── css/style.css
├── js/
│   ├── main.js          # UI, counters, modal, form
│   ├── three-scene.js   # Hero 3D particle field
│   └── skills-3d.js     # Skills 3D floating tiles
├── assets/
│   └── icons/           # SVG skill icons (Simple Icons)
├── img/                 # Profile photo
├── cv/                  # CV PDF
├── favicon_package_v0.16/
├── sitemap.xml
└── robots.txt
```

## Deploy to GitHub Pages

1. Push to `main` branch of `KareemBaloch1.github.io` repository.
2. Go to **Settings → Pages → Source → Deploy from branch → main / root**.
3. Site will be live at `https://kareembaloch1.github.io/`.

## Deploy to AWS S3 + CloudFront

```bash
# 1. Create S3 bucket (same name as domain, e.g. kareem.dev)
aws s3 mb s3://kareem.dev --region us-east-1

# 2. Enable static website hosting
aws s3 website s3://kareem.dev --index-document index.html --error-document index.html

# 3. Sync files (exclude build scripts)
aws s3 sync . s3://kareem.dev \
  --exclude "*.ps1" \
  --exclude ".git/*" \
  --cache-control "max-age=86400"

# 4. Create CloudFront distribution pointing to the S3 bucket origin.
#    Enable HTTPS, set default root object to index.html.
#    Add a custom error page: 404 → /index.html (200).

# 5. Point your domain's CNAME to the CloudFront distribution domain.
```

## Deploy to Netlify

```bash
# Drag-and-drop the project folder at app.netlify.com/drop
# OR connect the GitHub repo and set:
#   Build command: (leave empty)
#   Publish directory: .
```

## Placeholders to fill in

Search the project for `[ADD` to find all placeholders:

- `assets/img/og-preview.png` — Create a 1200×630 px Open Graph preview image.
- `sitemap.xml` — Update `<lastmod>` date after each content update.
- Canonical URL in `index.html` — Replace `kareembaloch1.github.io` with your actual domain if different.

## Testing checklist

- [ ] Open in Chrome, Firefox, Safari, and mobile browser
- [ ] Resize to 360px, 768px, 1024px, 1440px — no overflow or broken layout
- [ ] Toggle light/dark mode — persists on reload
- [ ] Click every nav link — smooth scroll to correct section
- [ ] Click every project card — modal opens and closes (Esc key, click outside, ✕ button)
- [ ] Submit contact form — mailto opens with pre-filled subject and body
- [ ] Check browser console — zero errors
- [ ] Verify 3D hero and skills scenes render (Chrome DevTools → Console for WebGL errors)
- [ ] Test on a device without WebGL — skills fallback grid should appear
- [ ] Run Lighthouse audit (DevTools → Lighthouse) — target 90+ on all four categories
