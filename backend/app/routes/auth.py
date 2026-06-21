from functools import wraps
from flask import request, jsonify, g
import jwt
import os
from ..supabase_client import get_supabase
from flask import Blueprint

auth_bp = Blueprint("auth", __name__)


def verify_token(token: str) -> dict | None:
    """Decode and verify a Supabase JWT using the Supabase API."""
    try:
        sb = get_supabase()
        user_resp = sb.auth.get_user(token)
        if user_resp and user_resp.user:
            return {"sub": user_resp.user.id, "role": user_resp.user.role or "authenticated"}
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None


def require_auth(f):
    """Decorator: require a valid Supabase JWT in Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header[7:]
        payload = verify_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
        g.user_id = payload.get("sub")
        g.user_role = payload.get("role", "authenticated")
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    """Decorator: require authenticated user with admin_roles row."""
    @wraps(f)
    @require_auth
    def decorated(*args, **kwargs):
        sb = get_supabase()
        result = sb.table("admin_roles").select("user_id").eq("user_id", g.user_id).maybe_single().execute()
        if not result.data:
            return jsonify({"error": "Forbidden: admin only"}), 403
        return f(*args, **kwargs)
    return decorated
