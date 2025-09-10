from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import crud, models
from app.schemas import entry as entry_schema
from app.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=entry_schema.Entry)
async def create_entry(
    entry: entry_schema.EntryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new cannabis consumption entry"""
    return crud.create_entry(db=db, entry=entry, user_id=current_user.id)

@router.get("/", response_model=List[entry_schema.Entry])
async def read_entries(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all entries for the current user"""
    entries = crud.get_entries(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return entries

@router.get("/{entry_id}", response_model=entry_schema.Entry)
async def read_entry(
    entry_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific entry"""
    db_entry = crud.get_entry(db=db, entry_id=entry_id, user_id=current_user.id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return db_entry

@router.put("/{entry_id}", response_model=entry_schema.Entry)
async def update_entry(
    entry_id: int,
    entry_update: entry_schema.EntryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an entry"""
    db_entry = crud.update_entry(db=db, entry_id=entry_id, entry_update=entry_update, user_id=current_user.id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return db_entry

@router.delete("/{entry_id}")
async def delete_entry(
    entry_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an entry"""
    success = crud.delete_entry(db=db, entry_id=entry_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Entry deleted successfully"}

@router.get("/stats/", response_model=entry_schema.EntryStats)
async def get_entry_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics for user's entries"""
    return crud.get_entry_stats(db=db, user_id=current_user.id)
