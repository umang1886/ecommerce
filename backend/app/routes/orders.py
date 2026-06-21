import os
import uuid
from flask import Blueprint, jsonify, request, g
from ..supabase_client import get_supabase
from .auth import require_auth
from ..services.invoice_service import generate_invoice_pdf

orders_bp = Blueprint("orders", __name__)

FREE_DELIVERY_THRESHOLD = 500  # ₹500


def _calc_delivery(subtotal: float) -> float:
    return 0.0 if subtotal >= FREE_DELIVERY_THRESHOLD else 50.0


def _order_number() -> str:
    return f"VM-{uuid.uuid4().hex[:8].upper()}"


@orders_bp.post("/orders")
@require_auth
def create_order():
    sb = get_supabase()
    body = request.get_json()

    items: list[dict] = body.get("items", [])
    address_id: str = body.get("address_id", "")
    notes: str = body.get("notes", "")
    # Hardcode payment method as COD since Razorpay is removed
    payment_method = "cod"

    if not items or not address_id:
        return jsonify({"error": "items and address_id are required"}), 400

    # Resolve product prices
    product_ids = [i["product_id"] for i in items]
    prods_resp = (
        sb.table("products")
        .select("id, name, slug, retail_price, wholesale_price, moq, in_stock")
        .in_("id", product_ids)
        .execute()
    )
    product_map = {p["id"]: p for p in prods_resp.data}

    # Determine if customer is wholesale
    cust_resp = sb.table("customers").select("account_type").eq("id", g.user_id).maybe_single().execute()
    is_wholesale = cust_resp.data and cust_resp.data["account_type"] == "wholesale"

    order_items = []
    subtotal = 0.0
    for item in items:
        prod = product_map.get(item["product_id"])
        if not prod:
            return jsonify({"error": f"Product {item['product_id']} not found"}), 404
        if not prod["in_stock"]:
            return jsonify({"error": f"Product '{prod['name']}' is out of stock"}), 409
        qty = max(item.get("quantity", 1), prod["moq"])
        price = float(prod["wholesale_price"] or prod["retail_price"]) if is_wholesale else float(prod["retail_price"] or 0)
        line_total = price * qty
        subtotal += line_total
        order_items.append(
            {
                "product_id": prod["id"],
                "product_name": prod["name"],
                "product_slug": prod["slug"],
                "unit_price": price,
                "quantity": qty,
                "subtotal": line_total,
            }
        )

    delivery_charge = _calc_delivery(subtotal)
    total = subtotal + delivery_charge

    # Create order
    order_row = {
        "order_number": _order_number(),
        "customer_id": g.user_id,
        "address_id": address_id,
        "status": "placed",
        "payment_method": payment_method,
        "payment_status": "pending",
        "subtotal": subtotal,
        "delivery_charge": delivery_charge,
        "total": total,
        "notes": notes,
    }

    order_resp = sb.table("orders").insert(order_row).execute()
    order = order_resp.data[0] if order_resp.data else None
    if not order:
        return jsonify({"error": "Failed to create order"}), 500

    # Insert line items
    for oi in order_items:
        oi["order_id"] = order["id"]
    sb.table("order_items").insert(order_items).execute()

    # Clear cart
    sb.table("cart_items").delete().eq("customer_id", g.user_id).execute()

    return jsonify({"order": order}), 201


@orders_bp.get("/orders")
@require_auth
def list_orders():
    sb = get_supabase()
    result = (
        sb.table("orders")
        .select("*, order_items(*, products(name, image_url))")
        .eq("customer_id", g.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify(result.data)


@orders_bp.get("/orders/<order_id>")
@require_auth
def get_order(order_id: str):
    sb = get_supabase()
    result = (
        sb.table("orders")
        .select("*, order_items(*, products(name, slug, image_url)), addresses(*)")
        .eq("id", order_id)
        .eq("customer_id", g.user_id)
        .maybe_single()
        .execute()
    )
    print(f"Supabase get_order response: {result}")
    
    if result is None or not getattr(result, "data", None):
        return jsonify({"error": "Order not found"}), 404
    return jsonify(result.data)


@orders_bp.get("/orders/<order_id>/invoice")
@require_auth
def download_invoice(order_id: str):
    from flask import send_file
    import io

    sb = get_supabase()
    result = (
        sb.table("orders")
        .select("*, order_items(*), addresses(*), customers(full_name, email, phone, gst_number)")
        .eq("id", order_id)
        .eq("customer_id", g.user_id)
        .maybe_single()
        .execute()
    )
    print(f"Supabase download_invoice response: {result}")
    
    if result is None or not getattr(result, "data", None):
        return jsonify({"error": "Order not found"}), 404

    pdf_bytes = generate_invoice_pdf(result.data)
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"veloxmart-invoice-{result.data['order_number']}.pdf",
    )
