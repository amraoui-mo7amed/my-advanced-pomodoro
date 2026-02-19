import sys
import os
import shutil
import logging
from pathlib import Path
from PySide6.QtGui import QGuiApplication
from PySide6.QtQml import QQmlApplicationEngine
from PySide6.QtCore import QObject, Signal, Property, Slot
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import models
from models.profile import Base, ProfileModel

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class UserProfile(QObject):
    """Handles user profile data persistence via SQLite and QML integration."""

    profileChanged = Signal()

    def __init__(self):
        super().__init__()
        # Ensure database is in the same folder as main.py
        self.base_path = Path(__file__).resolve().parent
        self.db_path = self.base_path / "database.db"

        # SQLite Setup
        self.engine = create_engine(f"sqlite:///{self.db_path}")
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)

        self.avatar_dir = self.base_path / "data" / "avatars"
        self.avatar_dir.mkdir(parents=True, exist_ok=True)

        self._ensure_profile_exists()

    def _ensure_profile_exists(self):
        with self.Session() as session:
            profile = session.query(ProfileModel).first()
            if not profile:
                logger.info("Creating initial profile in database")
                new_profile = ProfileModel()
                session.add(new_profile)
                session.commit()

    def _get_profile(self, session):
        return session.query(ProfileModel).first()

    @Property(str, notify=profileChanged)
    def fullName(self):
        with self.Session() as session:
            profile = self._get_profile(session)
            return str(profile.full_name) if profile else "Guest User"

    @fullName.setter
    def fullName(self, value):
        with self.Session() as session:
            profile = self._get_profile(session)
            if profile and profile.full_name != value:
                profile.full_name = str(value)
                session.commit()
                self.profileChanged.emit()

    @Property(str, notify=profileChanged)
    def headline(self):
        with self.Session() as session:
            profile = self._get_profile(session)
            return str(profile.headline) if profile else "Staying Focused"

    @headline.setter
    def headline(self, value):
        with self.Session() as session:
            profile = self._get_profile(session)
            if profile and profile.headline != value:
                profile.headline = str(value)
                session.commit()
                self.profileChanged.emit()

    @Property(str, notify=profileChanged)
    def avatarPath(self):
        with self.Session() as session:
            profile = self._get_profile(session)
            path = profile.avatar_path if profile else ""
            if path and os.path.exists(path):
                return Path(path).as_uri()
            return ""

    @Slot(str)
    def updateAvatar(self, file_url):
        # Convert QML file URL to local path
        if file_url.startswith("file://"):
            file_path = file_url[7:]
        else:
            file_path = file_url

        if os.path.exists(file_path):
            try:
                ext = Path(file_path).suffix
                dest_path = self.avatar_dir / f"user_avatar{ext}"
                shutil.copy2(file_path, dest_path)

                with self.Session() as session:
                    profile = self._get_profile(session)
                    if profile:
                        profile.avatar_path = str(dest_path)
                        session.commit()
                        self.profileChanged.emit()
                logger.info(f"Avatar updated successfully: {dest_path}")
            except Exception as e:
                logger.error(f"Failed to update avatar: {e}")


def main():
    """Main entry point for the Antigravity Pomodoro Manager."""
    app = QGuiApplication(sys.argv)
    app.setApplicationName("Antigravity Pomodoro")
    app.setOrganizationName("Antigravity")

    # Create engine
    engine = QQmlApplicationEngine()

    # Add custom widgets directory to import path
    current_dir = Path(__file__).resolve().parent
    engine.addImportPath(os.fspath(current_dir / "assets" / "widgets"))

    # Create profile singleton instance
    user_profile = UserProfile()

    # Expose profile to QML BEFORE loading
    engine.rootContext().setContextProperty("userProfile", user_profile)

    # Get absolute path to QML file
    current_dir = Path(__file__).resolve().parent
    qml_file = current_dir / "assets" / "qml" / "main.qml"

    # Load QML
    engine.load(os.fspath(qml_file))

    if not engine.rootObjects():
        sys.exit(-1)

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
