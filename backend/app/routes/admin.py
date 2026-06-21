import os
import uuid
from flask import Blueprint, jsonify, request, g
from werkzeug.utils import secure_filename
from ..supabase_client import get_supabase
from .auth import require_admin

admin_bp = Blueprint("admin", __name__)

PAGE_SIZE = 25
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}


def _allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@admin_bp.get("/check")
@require_admin
def admin_check_role():
    """Returns 200 OK if the user is an admin, otherwise 403 Forbidden via decorator."""
    return jsonify({"ok": True})


# ─── Image Upload ─────────────────────────────────────────────────────────────

@admin_bp.post("/upload-image")
@require_admin
def admin_upload_image():
    """Upload a product image to Supabase Storage and return the public URL."""
    sb = get_supabase()
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    if not file.filename or not _allowed(file.filename):
        return jsonify({"error": "Invalid file type. Use PNG, JPG, JPEG, or WebP"}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    path = f"products/{uuid.uuid4().hex}.{ext}"

    try:
        data = file.read()
        sb.storage.from_("products").upload(
            path, data, file_options={"content-type": file.content_type}
        )
        public_url = sb.storage.from_("products").get_public_url(path)
        return jsonify({"url": public_url, "path": path}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Restore (un-archive) product ────────────────────────────────────────────

@admin_bp.patch("/products/<product_id>/restore")
@require_admin
def admin_restore_product(product_id: str):
    sb = get_supabase()
    result = sb.table("products").update({"is_active": True}).eq("id", product_id).execute()
    return jsonify(result.data[0] if result.data else None)

# ─── Categories ──────────────────────────────────────────────────────────────

@admin_bp.post("/categories")
@require_admin
def admin_create_category():
    sb = get_supabase()
    body = request.get_json()
    result = sb.table("categories").insert(body).execute()
    return jsonify(result.data[0] if result.data else None), 201


# ─── Products ────────────────────────────────────────────────────────────────

@admin_bp.get("/products")
@require_admin
def admin_list_products():
    sb = get_supabase()
    page = max(1, request.args.get("page", 1, type=int))
    offset = (page - 1) * PAGE_SIZE
    q = request.args.get("q", "")

    query = sb.table("products").select("*, categories(name, departments(name))", count="exact")
    if q:
        query = query.ilike("name", f"%{q}%")
    result = query.order("created_at", desc=True).range(offset, offset + PAGE_SIZE - 1).execute()
    return jsonify({"data": result.data, "total": result.count})


@admin_bp.post("/products")
@require_admin
def admin_create_product():
    sb = get_supabase()
    body = request.get_json()
    result = sb.table("products").insert(body).execute()
    return jsonify(result.data[0] if result.data else None), 201


@admin_bp.patch("/products/<product_id>")
@require_admin
def admin_update_product(product_id: str):
    sb = get_supabase()
    body = request.get_json()
    body.pop("id", None)
    result = sb.table("products").update(body).eq("id", product_id).execute()
    return jsonify(result.data[0] if result.data else None)


@admin_bp.delete("/products/<product_id>")
@require_admin
def admin_delete_product(product_id: str):
    sb = get_supabase()
    sb.table("products").update({"is_active": False}).eq("id", product_id).execute()
    return jsonify({"ok": True})


# ─── Orders ──────────────────────────────────────────────────────────────────

@admin_bp.get("/orders")
@require_admin
def admin_list_orders():
    sb = get_supabase()
    page = max(1, request.args.get("page", 1, type=int))
    status = request.args.get("status", "")
    offset = (page - 1) * PAGE_SIZE

    query = sb.table("orders").select(
        "*, customers(full_name, email, phone), order_items(*, products(name, image_url)), addresses(*)", count="exact"
    )
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).range(offset, offset + PAGE_SIZE - 1).execute()
    return jsonify({"data": result.data, "total": result.count})


@admin_bp.patch("/orders/<order_id>/status")
@require_admin
def admin_update_order_status(order_id: str):
    sb = get_supabase()
    body = request.get_json()
    status = body.get("status")
    allowed = {"placed", "confirmed", "dispatched", "delivered", "cancelled"}
    if status not in allowed:
        return jsonify({"error": f"status must be one of {allowed}"}), 400
    result = sb.table("orders").update({"status": status}).eq("id", order_id).execute()
    return jsonify(result.data[0] if result.data else None)


# ─── Customers ───────────────────────────────────────────────────────────────

@admin_bp.get("/customers")
@require_admin
def admin_list_customers():
    sb = get_supabase()
    page = max(1, request.args.get("page", 1, type=int))
    account_type = request.args.get("type", "")
    offset = (page - 1) * PAGE_SIZE

    query = sb.table("customers").select("*", count="exact")
    if account_type:
        query = query.eq("account_type", account_type)
    result = query.order("created_at", desc=True).range(offset, offset + PAGE_SIZE - 1).execute()
    return jsonify({"data": result.data, "total": result.count})


@admin_bp.patch("/customers/<customer_id>/approve")
@require_admin
def admin_approve_customer(customer_id: str):
    sb = get_supabase()
    body = request.get_json()
    is_approved = body.get("is_approved", True)
    result = sb.table("customers").update({"is_approved": is_approved}).eq("id", customer_id).execute()
    return jsonify(result.data[0] if result.data else None)


# ─── Dashboard Stats ─────────────────────────────────────────────────────────

@admin_bp.get("/stats")
@require_admin
def admin_stats():
    sb = get_supabase()

    orders_resp = sb.table("orders").select("status, total", count="exact").execute()
    orders = orders_resp.data or []

    total_orders = orders_resp.count or 0
    total_revenue = sum(float(o.get("total") or 0) for o in orders)
    pending = sum(1 for o in orders if o["status"] == "placed")
    delivered = sum(1 for o in orders if o["status"] == "delivered")

    products_resp = sb.table("products").select("id", count="exact").eq("in_stock", False).execute()
    out_of_stock = products_resp.count or 0

    customers_resp = sb.table("customers").select("id", count="exact").execute()

    return jsonify(
        {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "pending_orders": pending,
            "delivered_orders": delivered,
            "out_of_stock_products": out_of_stock,
            "total_customers": customers_resp.count or 0,
        }
    )
