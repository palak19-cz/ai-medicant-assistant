from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config   import settings
from app.core.database import connect_db, close_db
from app.routers       import auth, prescriptions, symptoms, alarms, records, doctor_visits


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()      # startup
    yield
    await close_db()        # shutdown


app = FastAPI(
    title=f"{settings.APP_NAME} API",
    version="1.0.0",
    description="AI-powered personal health assistant backend",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────
app.include_router(auth.router,           prefix="/api")
app.include_router(prescriptions.router,  prefix="/api")
app.include_router(symptoms.router,       prefix="/api")
app.include_router(alarms.router,         prefix="/api")
app.include_router(records.router,        prefix="/api")
app.include_router(doctor_visits.router,  prefix="/api")

# ── Health check ───────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
