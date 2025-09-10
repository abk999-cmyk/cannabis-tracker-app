from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List
from app import models
from app.schemas import entry as entry_schema

def calculate_thc_mg(data: entry_schema.EntryCreate) -> float:
    """Calculate THC mg based on method"""
    if data.method in ['vape', 'smoke']:
        # Assuming 0.3g per session, each puff ~2.5mg at 75% THC
        mg_per_puff = (data.thc_percent or 75) / 100 * 2.5
        return float(data.puffs or 0) * mg_per_puff
    elif data.method in ['edible', 'tincture']:
        return float(data.amount or 0)
    return 0.0

def create_entry(db: Session, entry: entry_schema.EntryCreate, user_id: int):
    """Create a new entry"""
    timestamp = datetime.fromisoformat(f"{entry.date} {entry.time}")
    thc_mg = calculate_thc_mg(entry)

    db_entry = models.Entry(
        user_id=user_id,
        thc_mg=thc_mg,
        timestamp=timestamp,
        date=entry.date,
        time=entry.time,
        method=entry.method,
        amount=entry.amount,
        puffs=entry.puffs,
        thc_percent=entry.thc_percent,
        strain=entry.strain,
        mood=entry.mood,
        energy=entry.energy,
        focus=entry.focus,
        creativity=entry.creativity,
        anxiety=entry.anxiety,
        activities=entry.activities,
        notes=entry.notes
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_entries(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get entries for a user"""
    return db.query(models.Entry).filter(models.Entry.user_id == user_id)\
        .order_by(desc(models.Entry.timestamp)).offset(skip).limit(limit).all()

def get_entry(db: Session, entry_id: int, user_id: int):
    """Get a specific entry"""
    return db.query(models.Entry).filter(
        models.Entry.id == entry_id,
        models.Entry.user_id == user_id
    ).first()

def update_entry(db: Session, entry_id: int, entry_update: entry_schema.EntryUpdate, user_id: int):
    """Update an entry"""
    db_entry = db.query(models.Entry).filter(
        models.Entry.id == entry_id,
        models.Entry.user_id == user_id
    ).first()

    if not db_entry:
        return None

    # Update timestamp if date/time changed
    if entry_update.date or entry_update.time:
        new_date = entry_update.date or db_entry.date
        new_time = entry_update.time or db_entry.time
        db_entry.timestamp = datetime.fromisoformat(f"{new_date} {new_time}")

    # Recalculate THC mg if relevant fields changed
    if (entry_update.method or entry_update.amount or entry_update.puffs or entry_update.thc_percent):
        temp_entry = entry_schema.EntryCreate(
            date=db_entry.date,
            time=db_entry.time,
            method=entry_update.method or db_entry.method,
            amount=entry_update.amount or db_entry.amount,
            puffs=entry_update.puffs or db_entry.puffs,
            thc_percent=entry_update.thc_percent if entry_update.thc_percent is not None else db_entry.thc_percent,
            strain=db_entry.strain,
            mood=db_entry.mood,
            energy=db_entry.energy,
            focus=db_entry.focus,
            creativity=db_entry.creativity,
            anxiety=db_entry.anxiety,
            activities=db_entry.activities or [],
            notes=db_entry.notes
        )
        db_entry.thc_mg = calculate_thc_mg(temp_entry)

    # Update other fields
    for key, value in entry_update.dict(exclude_unset=True).items():
        if key not in ['date', 'time', 'method', 'amount', 'puffs', 'thc_percent']:
            setattr(db_entry, key, value)

    db.commit()
    db.refresh(db_entry)
    return db_entry

def delete_entry(db: Session, entry_id: int, user_id: int):
    """Delete an entry"""
    db_entry = db.query(models.Entry).filter(
        models.Entry.id == entry_id,
        models.Entry.user_id == user_id
    ).first()

    if db_entry:
        db.delete(db_entry)
        db.commit()
        return True
    return False

def get_entry_stats(db: Session, user_id: int):
    """Get entry statistics for the last 7 days"""
    week_ago = datetime.utcnow() - timedelta(days=7)

    # Get entries from last 7 days
    recent_entries = db.query(models.Entry).filter(
        models.Entry.user_id == user_id,
        models.Entry.timestamp >= week_ago
    ).all()

    if not recent_entries:
        return {
            "weekly_total": 0.0,
            "daily_avg": 0.0,
            "avg_mood": 0.0,
            "total_sessions": 0
        }

    total_thc = sum(entry.thc_mg for entry in recent_entries)
    avg_daily = total_thc / 7
    avg_mood = sum(entry.mood for entry in recent_entries) / len(recent_entries)

    return {
        "weekly_total": round(total_thc, 1),
        "daily_avg": round(avg_daily, 1),
        "avg_mood": round(avg_mood, 1),
        "total_sessions": len(recent_entries)
    }
