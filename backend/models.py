import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

def generate_id(prefix: str = "farmer") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: generate_id("usr"))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("FarmerProfileModel", back_populates="user", uselist=False, cascade="all, delete-orphan")

class FarmerProfileModel(Base):
    __tablename__ = "farmer_profiles"

    id = Column(String, primary_key=True, default=lambda: generate_id("farmer"))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    state = Column(String, default="Karnataka")
    district = Column(String, default="Mandya")
    taluk = Column(String, nullable=True)
    village = Column(String, default="Gejjalagere")
    pincode = Column(String, nullable=True)
    farm_type = Column(String, default="mixed")
    land_area_acres = Column(Float, default=0.0)
    cattle_count = Column(Integer, default=0)
    language = Column(String, default="en")
    onboarded = Column(Boolean, default=False)
    ecosystem_data = Column(Text, nullable=True)  # JSON-encoded state of plots, crops, livestock, finance, tasks

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")
