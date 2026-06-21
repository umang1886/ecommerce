from flask import Blueprint, jsonify
from ..supabase_client import get_supabase

departments_bp = Blueprint("departments", __name__)


@departments_bp.get("/departments")
def list_departments():
    sb = get_supabase()
    result = (
        sb.table("departments")
        .select("*, categories(id, name, slug, display_order)")
        .order("display_order")
        .execute()
    )
    return jsonify(result.data)


@departments_bp.get("/departments/<slug>")
def get_department(slug: str):
    sb = get_supabase()
    result = (
        sb.table("departments")
        .select("*, categories(id, name, slug, display_order)")
        .eq("slug", slug)
        .maybe_single()
        .execute()
    )
    if result is None or not getattr(result, "data", None):
        return jsonify({"error": "Department not found"}), 404
    return jsonify(result.data)


@departments_bp.get("/categories/<slug>")
def get_category(slug: str):
    sb = get_supabase()
    result = (
        sb.table("categories")
        .select("*, departments(name, slug)")
        .eq("slug", slug)
        .maybe_single()
        .execute()
    )
    if result is None or not getattr(result, "data", None):
        return jsonify({"error": "Category not found"}), 404
    return jsonify(result.data)
