import os
from dotenv import load_dotenv
load_dotenv()

from supabase import create_client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
sb = create_client(url, key)

email = "jaygeliambemaa3576@gmail.com"
password = "jaygeliambemaa3576"

user_id = None
try:
    print("Attempting to create user...")
    res = sb.auth.admin.create_user({"email": email, "password": password, "email_confirm": True})
    user_id = res.user.id
    print(f"Created new user with ID: {user_id}")
except Exception as e:
    print(f"Exception during create_user: {e}")
    print("Looking for existing user...")
    res = sb.auth.admin.list_users()
    for u in res:
        if u.email == email:
            user_id = u.id
            print(f"Found existing user with ID: {user_id}")
            break

if user_id:
    print("Upserting into admin_roles...")
    res2 = sb.table("admin_roles").upsert({"user_id": user_id}).execute()
    print(res2)
else:
    print("Could not resolve user ID.")
