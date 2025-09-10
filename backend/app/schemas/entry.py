from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EntryBase(BaseModel):
    date: str
    time: str
    method: str
    amount: Optional[str] = None
    puffs: Optional[str] = None
    thc_percent: Optional[float] = None
    strain: Optional[str] = None
    mood: int
    energy: int
    focus: int
    creativity: int
    anxiety: int
    activities: List[str] = []
    notes: Optional[str] = None

class EntryCreate(EntryBase):
    pass

class Entry(EntryBase):
    id: int
    user_id: int
    thc_mg: float
    timestamp: datetime
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class EntryUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    method: Optional[str] = None
    amount: Optional[str] = None
    puffs: Optional[str] = None
    thc_percent: Optional[float] = None
    strain: Optional[str] = None
    mood: Optional[int] = None
    energy: Optional[int] = None
    focus: Optional[int] = None
    creativity: Optional[int] = None
    anxiety: Optional[int] = None
    activities: Optional[List[str]] = None
    notes: Optional[str] = None

class EntryStats(BaseModel):
    weekly_total: float
    daily_avg: float
    avg_mood: float
    total_sessions: int
