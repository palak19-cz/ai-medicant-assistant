# 🩺 MediPredict — AI Health Assistant

> Upload prescriptions · Check symptoms · Set medicine reminders · Secure health records · Track doctor visits
> Built with React + FastAPI + Claude AI · Hindi & English

---

## 📁 VS Code Folder Structure

```
medipredict/                          ← Open THIS folder in VS Code
│
├── .gitignore                        ← Git ignore rules
├── README.md                         ← This file
│
├── frontend/                         ← React App (run separately)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vercel.json                   ← Vercel SPA routing config
│   ├── .env.example                  ← Copy to .env.local
│   └── src/
│       ├── main.jsx                  ← React entry point
│       ├── App.jsx                   ← All routes defined here
│       ├── index.css                 ← Tailwind + custom styles
│       ├── context/
│       │   ├── AuthContext.jsx       ← Login/logout/JWT state
│       │   └── LanguageContext.jsx   ← Hindi/English translations
│       ├── components/
│       │   ├── Navbar.jsx            ← Top navigation bar
│       │   └── ProtectedRoute.jsx    ← Auth guard for dashboard
│       └── pages/
│           ├── LandingPage.jsx       ← Public homepage
│           ├── LoginPage.jsx         ← Login form
│           ├── RegisterPage.jsx      ← Registration form
│           ├── Dashboard.jsx         ← Main dashboard
│           ├── PrescriptionPage.jsx  ← Upload & AI read prescriptions
│           ├── SymptomPage.jsx       ← Symptom checker
│           ├── AlarmPage.jsx         ← Medicine reminders
│           ├── RecordsPage.jsx       ← Health records vault
│           └── DoctorVisitPage.jsx   ← Doctor visit tracker
│
└── backend/                          ← FastAPI App (run separately)
    ├── Procfile                      ← For Railway/Render deploy
    ├── runtime.txt                   ← Python version
    ├── requirements.txt              ← Python packages
    ├── .env.example                  ← Copy to .env
    └── app/
        ├── main.py                   ← FastAPI app + CORS + routes
        ├── __init__.py
        ├── core/
        │   ├── config.py             ← Reads .env settings
        │   ├── database.py           ← MongoDB connection
        │   ├── security.py           ← JWT + bcrypt
        │   └── deps.py               ← Auth dependency
        ├── models/
        │   ├── user.py
        │   ├── prescription.py
        │   ├── symptom.py
        │   ├── alarm.py
        │   ├── record.py
        │   └── doctor_visit.py
        ├── routers/
        │   ├── auth.py               ← /api/auth/*
        │   ├── prescriptions.py      ← /api/prescriptions/*
        │   ├── symptoms.py           ← /api/symptoms/*
        │   ├── alarms.py             ← /api/alarms/*
        │   ├── records.py            ← /api/records/*
        │   └── doctor_visits.py      ← /api/visits/*
        └── services/
            ├── claude_service.py     ← Claude AI calls
            └── alarm_service.py      ← Smart time suggestions
```

---

## ⚙️ ONE-TIME SETUP (Do this first, only once)

### Step 1 — Install required software

| Software | Download link | Why needed |
|----------|--------------|------------|
| Node.js 18+ | https://nodejs.org | Run React frontend |
| Python 3.11+ | https://python.org | Run FastAPI backend |
| Git | https://git-scm.com | Version control |
| VS Code | https://code.visualstudio.com | Code editor |

### Step 2 — Get your free accounts & API keys

**A. MongoDB Atlas (free database)**
1. Go to https://mongodb.com/atlas
2. Sign up → Create free cluster (M0 — always free)
3. Click "Connect" → "Connect your application"
4. Copy the connection string — looks like:
   `mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/medipredict`

**B. Anthropic API Key (for AI features)**
1. Go to https://console.anthropic.com
2. Sign up → Go to "API Keys"
3. Click "Create Key" → Copy it (starts with `sk-ant-`)

### Step 3 — Clone and open in VS Code

```bash
# In your terminal / command prompt:
git clone https://github.com/YOUR_USERNAME/medipredict.git
cd medipredict

# Open in VS Code
code .
```

---

## 🔑 Environment Setup

### Backend .env file
```bash
# In terminal, go to backend folder:
cd backend
cp .env.example .env
```

Now open `backend/.env` in VS Code and fill in:
```env
MONGODB_URL=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/medipredict
SECRET_KEY=any-long-random-string-minimum-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ANTHROPIC_API_KEY=sk-ant-your-key-here
FRONTEND_URL=http://localhost:5173
```

> 💡 To generate a strong SECRET_KEY, run in terminal:
> `python -c "import secrets; print(secrets.token_hex(32))"`

### Frontend .env.local file
```bash
cd frontend
cp .env.example .env.local
```

For local development, `frontend/.env.local` should contain:
```env
VITE_API_URL=http://localhost:8000
```

---

## ▶️ RUNNING LOCALLY (Every time you want to work)

You need **2 terminals open** in VS Code (use `Ctrl+`` ` to open terminal):

### Terminal 1 — Backend
```bash
cd backend

# First time only — create virtual environment:
python -m venv venv

# Activate virtual environment:
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# First time only — install packages:
pip install -r requirements.txt

# Run the server:
uvicorn app.main:app --reload
```
✅ Backend running at: **http://localhost:8000**
✅ API docs at: **http://localhost:8000/docs**

### Terminal 2 — Frontend
```bash
cd frontend

# First time only:
npm install

# Run the app:
npm run dev
```
✅ Website running at: **http://localhost:5173**

> Open http://localhost:5173 in your browser — your app is live! 🎉

---

## 🐙 PUSH TO GITHUB

```bash
# 1. Create new repo on github.com (click + → New repository)
#    Name it: medipredict
#    Set to Public or Private
#    Do NOT add README/gitignore (we have our own)

# 2. In your terminal (from the medipredict root folder):
git init
git add .
git commit -m "Initial commit — MediPredict complete"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/medipredict.git
git push -u origin main
```

---

## 🚀 DEPLOY TO INTERNET (Free hosting)

### Deploy Backend → Railway (Free)

1. Go to **https://railway.app** → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `medipredict` repo
4. Set **Root Directory** to `backend`
5. Railway auto-detects Python + Procfile
6. Click **"Variables"** tab → Add these:
   ```
   MONGODB_URL        = your mongodb connection string
   SECRET_KEY         = your secret key
   ALGORITHM          = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 10080
   ANTHROPIC_API_KEY  = sk-ant-your-key
   FRONTEND_URL       = https://your-app.vercel.app
   ```
7. Click **Deploy** → Wait 2-3 minutes
8. Copy your Railway URL → looks like `https://medipredict-backend.railway.app`

### Deploy Frontend → Vercel (Free)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New Project"** → Import your `medipredict` repo
3. Set **Root Directory** to `frontend`
4. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://medipredict-backend.railway.app
   ```
   (Replace with your actual Railway URL from above)
5. Click **Deploy** → Wait 1-2 minutes
6. ✅ Your app is live at `https://medipredict.vercel.app`!

### Final step — update backend FRONTEND_URL
Go back to Railway → Variables → Update:
```
FRONTEND_URL = https://medipredict.vercel.app
```
Redeploy → Done! 🎉

---

## 🔄 Updating your code after changes

```bash
# After making any changes in VS Code:
git add .
git commit -m "describe what you changed"
git push

# Vercel and Railway auto-redeploy on every push ✅
```

---

## 🧪 Test the API (optional)

Once backend is running, open http://localhost:8000/docs
You'll see all API endpoints with a built-in test UI — no Postman needed!

---

## ❓ Common Problems & Fixes

| Problem | Fix |
|---------|-----|
| `venv\Scripts\activate` not working on Windows | Run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| `npm install` fails | Make sure Node.js 18+ is installed: `node --version` |
| MongoDB connection error | Check your MONGODB_URL in .env, whitelist your IP in Atlas |
| CORS error in browser | Make sure FRONTEND_URL in backend .env matches your frontend URL exactly |
| `uvicorn: command not found` | Make sure venv is activated (you should see `(venv)` in terminal) |
| Vercel shows blank page | Check vercel.json is in frontend/ folder |
| API calls fail in production | Check VITE_API_URL is set correctly in Vercel env variables |

---

## 🛠 VS Code Extensions (install these for best experience)

Open VS Code → Extensions (`Ctrl+Shift+X`) → Search and install:

- **ES7+ React/Redux/React-Native snippets** — React shortcuts
- **Tailwind CSS IntelliSense** — CSS autocomplete
- **Python** (Microsoft) — Python support
- **Pylance** — Python type checking
- **GitLens** — Git history in editor
- **Prettier** — Code formatting
- **Auto Rename Tag** — HTML/JSX tag renaming

---

## 📱 Tech Stack Summary

| Part | Technology | Free? |
|------|-----------|-------|
| Frontend | React 18 + Vite + Tailwind CSS | ✅ |
| Backend | FastAPI (Python) | ✅ |
| Database | MongoDB Atlas | ✅ (512MB free) |
| AI | Claude API (Anthropic) | Pay per use |
| Frontend hosting | Vercel | ✅ |
| Backend hosting | Railway | ✅ ($5 free credit/month) |

---

Built with ❤️ — MediPredict AI Health Assistant
