# PasteCrop - Image & Collage Studio

A fast, matte charcoal aesthetic image editor and collage studio designed for clipboard workflows. Paste or drop photos, crop, rotate, flip, filter, annotate, merge multiple pictures into clean collages, and export or copy back directly to your clipboard.

**Created & Owned by:** **Ishtiaq Islam Himel**

---

## 🚀 How to Host on Vercel

You have two simple ways to host this app on Vercel:

### Method 1: Deploy with GitHub (Recommended & Free)

1. **Push this code to GitHub:**
   - Create a new repository on [GitHub](https://github.com) (e.g. `pastecrop`).
   - Push your project files:
     ```bash
     git init
     git add .
     git commit -m "Initial commit - PasteCrop Studio"
     git branch -M main
     git remote add origin https://github.com/<your-username>/pastecrop.git
     git push -u origin main
     ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in or sign up (using your GitHub account).
   - Click **"Add New..."** → **"Project"**.
   - Select your `pastecrop` repository from the list and click **"Import"**.

3. **Configure & Deploy:**
   - Vercel automatically detects **Vite** using the included `vercel.json`.
   - Settings (default values are already pre-filled):
     - **Framework Preset:** `Vite`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`
   - Click **"Deploy"**.
   - In ~30 seconds, Vercel will give you a live production URL (e.g. `https://pastecrop.vercel.app`) with free global CDN and SSL.

---

### Method 2: Deploy directly via Vercel CLI (Instant from Terminal)

1. Open your terminal in the project directory:
   ```bash
   npm i -g vercel
   ```
2. Log in and deploy:
   ```bash
   vercel
   ```
3. Follow the quick prompts in your terminal:
   - *Set up and deploy?* **Y**
   - *Which scope?* Select your account
   - *Link to existing project?* **N**
   - *Project name?* `pastecrop` (or press Enter)
   - *Directory located?* `./` (press Enter)
4. For production release:
   ```bash
   vercel --prod
   ```

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Production build
npm run build
```
