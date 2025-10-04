# Bucketlisted Mock Previews (GitHub Pages, no terminal)

This repo is ready to upload to GitHub and auto-deploy via **GitHub Actions** to **GitHub Pages**. No terminal or commands needed.

## How to publish (click-only)

1. Create a **Public** repo on GitHub (e.g., `bucketlisted-mocks`).
2. Click **Add file → Upload files** and upload **ALL files and folders** from this project (including `.github/workflows/pages.yml`).
3. Commit.
4. Go to **Settings → Pages** and set **Source: GitHub Actions**.
5. Go to **Actions** tab, open the latest **Deploy to GitHub Pages** run, and wait for it to finish green.
6. Your site will be live at:
   `https://<your-username>.github.io/<your-repo-name>/`

### Browse your mock views
Append `?view=` to `index.html`:
- `index.html?view=list-final`
- `index.html?view=list-houston`
- `index.html?view=fort`
- `index.html?view=tour`

There are navigation links at the top of the page too.

## Notes
- The build uses Vite + Tailwind and bundles `lucide-react`, so it works under GitHub Pages security (no Babel-in-browser).
- The workflow auto-sets the correct subpath for your repo (`GHPAGES_BASE`), so you don’t need to edit any files.
