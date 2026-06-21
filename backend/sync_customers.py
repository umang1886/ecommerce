import os
from dotenv import load_dotenv
load_dotenv()

from supabase import create_client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
sb = create_client(url, key)

users = sb.auth.admin.list_users()
for u in users:
    try:
        sb.table("customers").insert({
            "id": u.id,
            "email": u.email,
            "full_name": u.email.split("@")[0],
            "account_type": "retail"
        }).execute()
        print(f"Created customer record for {u.email}")
    except Exception as e:
        # Ignore if it already exists
        pass
print("Done syncing customers")
