# Employee Payroll System

Full-stack payroll app with:
- register and login
- dashboard
- employee CRUD
- attendance
- leave management
- reports
- payslip generation

## Local Run

### Frontend
1. Open a terminal in `client`
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://127.0.0.1:5173/`

### Backend
1. Open a terminal in `server`
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Run `npm start`
5. Backend health URL: `http://127.0.0.1:5000/api/health`

The backend supports local file-backed storage if MongoDB is not available.

## GitHub Push

Run these commands from the project root:

```powershell
git init
git add .
git commit -m "Initial payroll app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## Hosting

### Frontend on Vercel
1. Push this repo to GitHub
2. Import the repo into Vercel
3. Set the root directory to `client`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add env var:

`VITE_API_BASE_URL=https://YOUR-BACKEND-URL/api`

### Backend on Render
1. Push this repo to GitHub
2. Create a new Web Service on Render
3. Connect the GitHub repo
4. Set root directory to `server`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables from `server/.env.example`

## Notes

- GitHub Pages is not suitable for the backend
- Best setup is:
  - GitHub for source code
  - Vercel for frontend
  - Render for backend
