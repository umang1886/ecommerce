import os
import sys
from dotenv import load_dotenv

# Load .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from supabase import create_client

def create_admin(email, password):
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
        sys.exit(1)

    sb = create_client(url, key)

    print(f"Creating admin user: {email}...")
    try:
        # Create user via Admin API
        user = sb.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
        user_id = user.user.id
        print(f"User created with ID: {user_id}")

        # Insert into admin_roles
        sb.table("admin_roles").upsert({"user_id": user_id}).execute()
        print("Granted admin privileges successfully!")
    except Exception as e:
        print(f"Error creating admin: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    create_admin(email, password)
