"""
KshetraOne Administrator Database Inspector
-------------------------------------------
Run: python admin.py
"""

import sys
from database import SessionLocal
from models import User, FarmerProfileModel
from auth import hash_password

def list_all_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("\n" + "=" * 80)
        print(" " * 28 + "KSHETRAONE USERS DATABASE")
        print("=" * 80)
        print(f"Total Registered Users: {len(users)}\n")
        
        if not users:
            print("No users registered yet.")
            return

        for idx, u in enumerate(users, 1):
            profile = u.profile
            print(f"[{idx}] User ID: {u.id}")
            print(f"    Full Name : {u.full_name}")
            print(f"    Email     : {u.email}")
            print(f"    Pass Hash : {u.password_hash[:32]}... (Argon2id)")
            print(f"    Created At: {u.created_at}")
            if profile:
                print(f"    Farm Info : Village: {profile.village}, District: {profile.district}, State: {profile.state}")
                print(f"    Farm Type : {profile.farm_type} | Acres: {profile.land_area_acres} | Cattle: {profile.cattle_count} | Onboarded: {profile.onboarded}")
            else:
                print("    Farm Info : No profile record")
            print("-" * 80)
    finally:
        db.close()

def reset_user_password(email: str, new_pass: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if not user:
            print(f"User with email '{email}' not found.")
            return
        user.password_hash = hash_password(new_pass)
        db.commit()
        print(f"Successfully updated password for '{email}'.")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "reset":
        if len(sys.argv) != 4:
            print("Usage: python admin.py reset <email> <new_password>")
        else:
            reset_user_password(sys.argv[2], sys.argv[3])
    else:
        list_all_users()
