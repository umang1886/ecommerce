from flask import Blueprint, jsonify, request
from ..supabase_client import get_supabase

products_bp = Blueprint("products", __name__)

PAGE_SIZE = 20


@products_bp.get("/products")
def list_products():
    sb = get_supabase()
    q = request.args.get("q", "").strip()
    category_slug = request.args.get("category", "")
    department_slug = request.args.get("department", "")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    featured = request.args.get("featured", "").lower() == "true"
    page = max(1, request.args.get("page", 1, type=int))
    offset = (page - 1) * PAGE_SIZE

    query = (
        sb.table("products")
        .select(
            "*, categories!inner(id, name, slug, departments!inner(id, name, slug))",
            count="exact",
        )
        .eq("is_active", True)
    )

    if q:
        query = query.ilike("name", f"%{q}%")
    if featured:
        query = query.eq("is_featured", True)
    if min_price is not None:
        query = query.gte("retail_price", min_price)
    if max_price is not None:
        query = query.lte("retail_price", max_price)
    if category_slug:
        # Filter via nested join
        query = query.eq("categories.slug", category_slug)
    if department_slug:
        query = query.eq("categories.departments.slug", department_slug)

    query = query.order("name").range(offset, offset + PAGE_SIZE - 1)
    result = query.execute()

    return jsonify(
        {
            "data": result.data,
            "total": result.count,
            "page": page,
            "page_size": PAGE_SIZE,
            "total_pages": -(-result.count // PAGE_SIZE) if result.count else 0,
        }
    )


@products_bp.get("/products/<slug>")
def get_product(slug: str):
    sb = get_supabase()
    result = (
        sb.table("products")
        .select("*, categories(id, name, slug, departments(id, name, slug))")
        .eq("slug", slug)
        .eq("is_active", True)
        .maybe_single()
        .execute()
    )
    if result is None or not getattr(result, "data", None):
        return jsonify({"error": "Product not found"}), 404

    # Related products (same category, excluding self)
    product = result.data
    related = (
        sb.table("products")
        .select("id, name, slug, retail_price, wholesale_price, image_url, unit")
        .eq("category_id", product["category_id"])
        .eq("is_active", True)
        .neq("id", product["id"])
        .limit(6)
        .execute()
    )
    product["related_products"] = related.data
    return jsonify(product)
