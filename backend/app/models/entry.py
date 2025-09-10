from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Consumption data
    thc_mg = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD format
    time = Column(String, nullable=False)  # HH:MM format

    # Method and details
    method = Column(String, nullable=False)  # vape, smoke, edible, tincture
    amount = Column(String, nullable=True)  # for edibles/tinctures
    puffs = Column(String, nullable=True)   # for vape/smoke
    thc_percent = Column(Float, nullable=True)  # for vape/smoke
    strain = Column(String, nullable=True)

    # Effects (0-10 scale)
    mood = Column(Integer, nullable=False, default=5)
    energy = Column(Integer, nullable=False, default=5)
    focus = Column(Integer, nullable=False, default=5)
    creativity = Column(Integer, nullable=False, default=5)
    anxiety = Column(Integer, nullable=False, default=0)

    # Activities and notes
    activities = Column(ARRAY(String), nullable=True)
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    user = relationship("User")
