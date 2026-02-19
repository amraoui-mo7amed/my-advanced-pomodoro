from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class ProfileModel(Base):
    """Database model for user profile."""

    __tablename__ = "profile"
    id = Column(Integer, primary_key=True)
    full_name = Column(String, default="Guest User")
    headline = Column(String, default="Staying Focused")
    avatar_path = Column(String, default="")
