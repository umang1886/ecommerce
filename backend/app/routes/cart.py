from flask import Blueprint, jsonify, request, g
from ..supabase_client import get_supabase
from .auth import require_auth

cart_bp = Blueprint("cart", __name__)


@cart_bp.get("/cart")
@require_auth
def get_cart():
    sb = get_supabase()
    result = (
        sb.table("cart_items")
        .select("*, products(id, name, slug, retail_price, wholesale_price, image_url, unit, moq, in_stock)")
        .eq("customer_id", g.user_id)
        .execute()
    )
    return jsonify(result.data)


@cart_bp.post("/cart")
@require_auth
def upsert_cart_item():
    sb = get_supabase()
    body = request.get_json()
    product_id = body.get("product_id")
    quantity = body.get("quantity", 1)
    if not product_id or quantity < 1:
        return jsonify({"error": "product_id and quantity >= 1 required"}), 400

    result = (
        sb.table("cart_items")
        .upsert(
            {"customer_id": g.user_id, "product_id": product_id, "quantity": quantity},
            on_conflict="customer_id,product_id",
        )
        .execute()
    )
    return jsonify(result.data[0] if result.data else {}), 201


@cart_bp.delete("/cart/<product_id>")
@require_auth
def remove_cart_item(product_id: str):
    sb = get_supabase()
    sb.table("cart_items").delete().eq("customer_id", g.user_id).eq("product_id", product_id).execute()
    return jsonify({"ok": True})


@cart_bp.delete("/cart")
@require_auth
def clear_cart():
    sb = get_supabase()
    sb.table("cart_items").delete().eq("customer_id", g.user_id).execute()
    return jsonify({"ok": True})
