from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable


def generate_invoice_pdf(order: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=15 * mm, bottomMargin=15 * mm)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle("Title", parent=styles["Heading1"], fontSize=22, textColor=colors.HexColor("#1e40af"), spaceAfter=4)
    sub_style = ParagraphStyle("Sub", parent=styles["Normal"], fontSize=9, textColor=colors.grey)
    label_style = ParagraphStyle("Label", parent=styles["Normal"], fontSize=9, textColor=colors.grey)
    value_style = ParagraphStyle("Value", parent=styles["Normal"], fontSize=10, fontName="Helvetica-Bold")

    elements = []

    # Header
    elements.append(Paragraph("VeloxMart", title_style))
    elements.append(Paragraph("Wholesale & Retail Supplier | disposables · cleaning · paper", sub_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1e40af"), spaceAfter=8))
    elements.append(Spacer(1, 4))

    # Invoice meta
    customer = order.get("customers") or {}
    address = order.get("addresses") or {}
    created = order.get("created_at", "")[:10]

    meta_data = [
        [Paragraph("INVOICE", ParagraphStyle("inv", parent=styles["Heading2"], fontSize=14)),
         Paragraph(f"<b>Order #:</b> {order.get('order_number','')}", styles["Normal"])],
        ["", Paragraph(f"<b>Date:</b> {created}", styles["Normal"])],
        ["", Paragraph(f"<b>Status:</b> {order.get('status','').upper()}", styles["Normal"])],
    ]
    meta_table = Table(meta_data, colWidths=[80 * mm, 100 * mm])
    meta_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    elements.append(meta_table)
    elements.append(Spacer(1, 8))

    # Bill To
    bill_data = [
        [Paragraph("<b>Bill To:</b>", styles["Normal"]), Paragraph("<b>Delivery Address:</b>", styles["Normal"])],
        [
            Paragraph(f"{customer.get('full_name','')}<br/>{customer.get('email','')}<br/>{customer.get('phone','')}", styles["Normal"]),
            Paragraph(
                f"{address.get('full_name','')}<br/>{address.get('line1','')}, {address.get('line2',''  )}<br/>{address.get('city','')}, {address.get('state','')} - {address.get('pincode','')}",
                styles["Normal"],
            ),
        ],
    ]
    if customer.get("gst_number"):
        bill_data.append([Paragraph(f"GST: {customer['gst_number']}", label_style), ""])

    bill_table = Table(bill_data, colWidths=[90 * mm, 90 * mm])
    bill_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("GRID", (0, 0), (-1, -1), 0, colors.white)]))
    elements.append(bill_table)
    elements.append(Spacer(1, 10))

    # Line items
    item_header = ["#", "Product", "Qty", "Unit Price (₹)", "Subtotal (₹)"]
    item_rows = [item_header]
    for i, item in enumerate(order.get("order_items", []), 1):
        item_rows.append([
            str(i),
            item.get("product_name", ""),
            str(item.get("quantity", 0)),
            f"₹{float(item.get('unit_price', 0)):,.2f}",
            f"₹{float(item.get('subtotal', 0)):,.2f}",
        ])

    items_table = Table(item_rows, colWidths=[10 * mm, 90 * mm, 20 * mm, 35 * mm, 35 * mm])
    items_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f4ff")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 8))

    # Totals
    subtotal = float(order.get("subtotal", 0))
    delivery = float(order.get("delivery_charge", 0))
    total = float(order.get("total", 0))

    totals_data = [
        ["", "", "Subtotal:", f"₹{subtotal:,.2f}"],
        ["", "", "Delivery:", f"₹{delivery:,.2f}" if delivery else "FREE"],
        ["", "", Paragraph("<b>TOTAL</b>", styles["Normal"]), Paragraph(f"<b>₹{total:,.2f}</b>", styles["Normal"])],
    ]
    totals_table = Table(totals_data, colWidths=[10 * mm, 90 * mm, 55 * mm, 35 * mm])
    totals_table.setStyle(TableStyle([
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("LINEABOVE", (2, 2), (-1, 2), 1, colors.HexColor("#1e40af")),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 12))

    # Footer
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
    elements.append(Paragraph("Thank you for shopping with VeloxMart! For queries, WhatsApp us.", sub_style))

    doc.build(elements)
    return buffer.getvalue()
