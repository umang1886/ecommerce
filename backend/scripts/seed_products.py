"""
VeloxMart — Full Product Catalog Seed Script
Inserts all 200+ products from the master catalog into Supabase.

Usage:
  pip install supabase python-dotenv
  python scripts/seed_products.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).parent.parent / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ── Image URL helper ─────────────────────────────────────────────────────────
# These images are served from the frontend's /public/images/products directory
# Update BASE_URL to your deployed URL when in production
BASE_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


def img(filename: str) -> str:
    return f"{BASE_URL}/images/products/{filename}"


# ── Full catalog ──────────────────────────────────────────────────────────────

CATALOG = [
    # ── DISPOSABLE PRODUCTS ──────────────────────────────────────────────────
    {
        "department": "disposable-products",
        "categories": [
            {
                "slug": "paper-cups",
                "products": [
                    dict(name="100ml Paper Cup", slug="100ml-paper-cup", retail_price=45, wholesale_price=38, moq=50, unit="pack", image_url=img("paper-cups.png"), brand="Velox", size_variant="100ml", is_featured=True),
                    dict(name="150ml Paper Cup", slug="150ml-paper-cup", retail_price=55, wholesale_price=46, moq=50, unit="pack", image_url=img("paper-cups.png"), brand="Velox", size_variant="150ml", is_featured=True),
                    dict(name="200ml Paper Cup", slug="200ml-paper-cup", retail_price=65, wholesale_price=54, moq=50, unit="pack", image_url=img("paper-cups.png"), brand="Velox", size_variant="200ml", is_featured=True),
                    dict(name="200ml Plain Paper Cup", slug="200ml-plain-paper-cup", retail_price=60, wholesale_price=50, moq=50, unit="pack", image_url=img("paper-cups.png"), brand="Velox", size_variant="200ml Plain"),
                    dict(name="250ml Paper Cup", slug="250ml-paper-cup", retail_price=72, wholesale_price=60, moq=50, unit="pack", image_url=img("paper-cups.png"), brand="Velox", size_variant="250ml"),
                    dict(name="300ml Paper Cup", slug="300ml-paper-cup", retail_price=85, wholesale_price=70, moq=50, unit="pack", image_url=img("paper-cups.png"), brand="Velox", size_variant="300ml"),
                ],
            },
            {
                "slug": "paper-plates",
                "products": [
                    dict(name="7 Inch Paper Plate", slug="7-inch-paper-plate", retail_price=55, wholesale_price=45, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='7"'),
                    dict(name="8 Inch Paper Plate", slug="8-inch-paper-plate", retail_price=65, wholesale_price=54, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='8"'),
                    dict(name="9 Inch Paper Plate", slug="9-inch-paper-plate", retail_price=75, wholesale_price=62, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='9"'),
                    dict(name="10 Inch Paper Plate", slug="10-inch-paper-plate", retail_price=90, wholesale_price=74, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='10"'),
                ],
            },
            {
                "slug": "silver-plates",
                "products": [
                    dict(name='7" Silver Plate', slug="7-inch-silver-plate", retail_price=80, wholesale_price=66, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='7"'),
                    dict(name='8" Silver Plate', slug="8-inch-silver-plate", retail_price=95, wholesale_price=78, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='8"'),
                    dict(name='9" Silver Plate', slug="9-inch-silver-plate", retail_price=110, wholesale_price=90, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='9"'),
                    dict(name='10" Silver Plate', slug="10-inch-silver-plate", retail_price=125, wholesale_price=103, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='10"'),
                    dict(name='12" Thali Silver Plate', slug="12-inch-thali-silver-plate", retail_price=150, wholesale_price=123, moq=10, unit="pack", image_url=img("paper-cups.png"), size_variant='12" Thali'),
                ],
            },
            {
                "slug": "biodegradable-products",
                "products": [
                    dict(name='7" Biodegradable Plate', slug="7-inch-biodegradable-plate", retail_price=120, wholesale_price=99, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='7"'),
                    dict(name='9" Biodegradable Plate', slug="9-inch-biodegradable-plate", retail_price=145, wholesale_price=119, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='9"'),
                    dict(name='12" Biodegradable Plate', slug="12-inch-biodegradable-plate", retail_price=175, wholesale_price=144, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant='12"'),
                    dict(name="60ml Biodegradable Bowl", slug="60ml-biodegradable-bowl", retail_price=85, wholesale_price=70, moq=50, unit="pack", image_url=img("paper-cups.png"), size_variant="60ml"),
                    dict(name="150ml Biodegradable Bowl", slug="150ml-biodegradable-bowl", retail_price=110, wholesale_price=90, moq=50, unit="pack", image_url=img("paper-cups.png"), size_variant="150ml"),
                    dict(name="360ml Biodegradable Bowl", slug="360ml-biodegradable-bowl", retail_price=145, wholesale_price=119, moq=25, unit="pack", image_url=img("paper-cups.png"), size_variant="360ml"),
                ],
            },
            {
                "slug": "spoons",
                "products": [
                    dict(name="140mm Disposable Spoon", slug="140mm-disposable-spoon", retail_price=35, wholesale_price=28, moq=100, unit="pack", image_url=img("paper-cups.png"), size_variant="140mm"),
                    dict(name="160mm Disposable Spoon", slug="160mm-disposable-spoon", retail_price=42, wholesale_price=34, moq=100, unit="pack", image_url=img("paper-cups.png"), size_variant="160mm"),
                    dict(name="140mm Biodegradable Spoon", slug="140mm-biodegradable-spoon", retail_price=55, wholesale_price=45, moq=100, unit="pack", image_url=img("paper-cups.png"), size_variant="140mm Bio"),
                ],
            },
            {
                "slug": "silver-foils",
                "products": [
                    dict(name="Silver Foil 9 Mtr Roll", slug="silver-foil-9mtr", retail_price=55, wholesale_price=45, moq=12, unit="roll", image_url=img("paper-cups.png"), size_variant="9 Mtr"),
                    dict(name="Silver Foil 18 Mtr Roll", slug="silver-foil-18mtr", retail_price=99, wholesale_price=82, moq=12, unit="roll", image_url=img("paper-cups.png"), size_variant="18 Mtr"),
                    dict(name="Silver Foil 36 Mtr Roll", slug="silver-foil-36mtr", retail_price=185, wholesale_price=152, moq=6, unit="roll", image_url=img("paper-cups.png"), size_variant="36 Mtr"),
                    dict(name="Silver Foil 72 Mtr Roll", slug="silver-foil-72mtr", retail_price=350, wholesale_price=289, moq=6, unit="roll", image_url=img("paper-cups.png"), size_variant="72 Mtr"),
                    dict(name="Silver Foil 1 Kg", slug="silver-foil-1kg", retail_price=420, wholesale_price=345, moq=6, unit="kg", image_url=img("paper-cups.png"), size_variant="1 Kg"),
                    dict(name="Butter Paper Roll", slug="butter-paper-roll", retail_price=75, wholesale_price=62, moq=12, unit="roll", image_url=img("paper-cups.png")),
                    dict(name="Cling Film Roll", slug="cling-film-roll", retail_price=90, wholesale_price=74, moq=6, unit="roll", image_url=img("paper-cups.png")),
                ],
            },
            {
                "slug": "zip-pouches",
                "products": [
                    dict(name="Zip Pouch 8x8", slug="zip-pouch-8x8", retail_price=65, wholesale_price=54, moq=10, unit="pack", image_url=img("paper-cups.png"), size_variant="8×8"),
                    dict(name="Zip Pouch 10x10", slug="zip-pouch-10x10", retail_price=80, wholesale_price=66, moq=10, unit="pack", image_url=img("paper-cups.png"), size_variant="10×10"),
                    dict(name="Zip Pouch 12x14", slug="zip-pouch-12x14", retail_price=110, wholesale_price=90, moq=10, unit="pack", image_url=img("paper-cups.png"), size_variant="12×14"),
                ],
            },
            {
                "slug": "zip-locks",
                "products": [
                    dict(name="Zip Lock 2x3", slug="zip-lock-2x3", retail_price=40, wholesale_price=33, moq=10, unit="pack", image_url=img("paper-cups.png"), size_variant="2×3"),
                    dict(name="Zip Lock 4x6", slug="zip-lock-4x6", retail_price=55, wholesale_price=45, moq=10, unit="pack", image_url=img("paper-cups.png"), size_variant="4×6"),
                    dict(name="Zip Lock 6x9", slug="zip-lock-6x9", retail_price=70, wholesale_price=58, moq=10, unit="pack", image_url=img("paper-cups.png"), size_variant="6×9"),
                    dict(name="Zip Lock 10x13", slug="zip-lock-10x13", retail_price=95, wholesale_price=78, moq=10, unit="pack", image_url=img("paper-cups.png"), size_variant="10×13"),
                ],
            },
        ],
    },

    # ── CLEANING PRODUCTS ────────────────────────────────────────────────────
    {
        "department": "cleaning-products",
        "categories": [
            {
                "slug": "garbage-bags",
                "products": [
                    dict(name="Small Garbage Bag (17x19)", slug="small-garbage-bag", retail_price=35, wholesale_price=28, moq=10, unit="pack", image_url=img("garbage-bags.png"), size_variant="17×19", is_featured=True),
                    dict(name="Medium Garbage Bag (19x21)", slug="medium-garbage-bag", retail_price=45, wholesale_price=37, moq=10, unit="pack", image_url=img("garbage-bags.png"), size_variant="19×21", is_featured=True),
                    dict(name="Large Garbage Bag (24x32)", slug="large-garbage-bag", retail_price=65, wholesale_price=53, moq=10, unit="pack", image_url=img("garbage-bags.png"), size_variant="24×32"),
                    dict(name="Ex-Large Garbage Bag (30x37)", slug="xlarge-garbage-bag", retail_price=85, wholesale_price=70, moq=10, unit="pack", image_url=img("garbage-bags.png"), size_variant="30×37"),
                    dict(name="Jumbo Garbage Bag (30x50)", slug="jumbo-garbage-bag", retail_price=110, wholesale_price=90, moq=10, unit="pack", image_url=img("garbage-bags.png"), size_variant="30×50"),
                    dict(name="Ex-Jumbo Garbage Bag (40x50)", slug="exjumbo-garbage-bag", retail_price=145, wholesale_price=119, moq=10, unit="pack", image_url=img("garbage-bags.png"), size_variant="40×50"),
                    dict(name="40x50 Kg Pack Garbage Bag", slug="40x50-kg-garbage-bag", retail_price=160, wholesale_price=132, moq=10, unit="pack", image_url=img("garbage-bags.png"), size_variant="40×50 Kg"),
                ],
            },
            {
                "slug": "toilet-brush",
                "products": [
                    dict(name="Single Hockey Toilet Brush", slug="single-hockey-toilet-brush", retail_price=55, wholesale_price=45, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Single Hockey"),
                    dict(name="Double Hockey Toilet Brush", slug="double-hockey-toilet-brush", retail_price=75, wholesale_price=62, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Double Hockey"),
                    dict(name="Heavy Duty Toilet Brush", slug="heavy-duty-toilet-brush", retail_price=95, wholesale_price=78, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Heavy"),
                ],
            },
            {
                "slug": "floor-wipers",
                "products": [
                    dict(name="Small Floor Wiper", slug="small-floor-wiper", retail_price=45, wholesale_price=37, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Small"),
                    dict(name="Medium Floor Wiper", slug="medium-floor-wiper", retail_price=60, wholesale_price=49, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Medium"),
                    dict(name="Large Floor Wiper", slug="large-floor-wiper", retail_price=75, wholesale_price=62, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Large"),
                    dict(name="Jumbo Floor Wiper", slug="jumbo-floor-wiper", retail_price=95, wholesale_price=78, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Jumbo"),
                    dict(name="Rubber Floor Wiper", slug="rubber-floor-wiper", retail_price=85, wholesale_price=70, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Rubber"),
                ],
            },
            {
                "slug": "wet-dry-mops",
                "products": [
                    dict(name="Easy Mop Set", slug="easy-mop-set", retail_price=220, wholesale_price=181, moq=1, unit="set", image_url=img("cleaning-products.png"), brand="Easy", is_featured=True),
                    dict(name="Varni Mop Set", slug="varni-mop-set", retail_price=280, wholesale_price=230, moq=1, unit="set", image_url=img("cleaning-products.png"), brand="Varni"),
                    dict(name="Nath Mop Set", slug="nath-mop-set", retail_price=310, wholesale_price=255, moq=1, unit="set", image_url=img("cleaning-products.png"), brand="Nath"),
                    dict(name="Easy Mop Refill", slug="easy-mop-refill", retail_price=85, wholesale_price=70, moq=3, unit="piece", image_url=img("cleaning-products.png"), brand="Easy"),
                    dict(name="Varni Mop Refill", slug="varni-mop-refill", retail_price=105, wholesale_price=86, moq=3, unit="piece", image_url=img("cleaning-products.png"), brand="Varni"),
                ],
            },
            {
                "slug": "microfiber-cloths",
                "products": [
                    dict(name="Microfiber Cloth 40x40", slug="microfiber-cloth-40x40", retail_price=45, wholesale_price=37, moq=5, unit="piece", image_url=img("cleaning-products.png"), size_variant="40×40 cm"),
                    dict(name="Microfiber Cloth 40x60", slug="microfiber-cloth-40x60", retail_price=65, wholesale_price=53, moq=5, unit="piece", image_url=img("cleaning-products.png"), size_variant="40×60 cm"),
                ],
            },
            {
                "slug": "scotch-brights",
                "products": [
                    dict(name="Scotch Brite 7x7.5cm", slug="scotch-brite-7x75", retail_price=25, wholesale_price=20, moq=12, unit="piece", image_url=img("cleaning-products.png"), size_variant="7×7.5 cm"),
                    dict(name="Scotch Brite 9.5x14cm", slug="scotch-brite-95x14", retail_price=35, wholesale_price=29, moq=12, unit="piece", image_url=img("cleaning-products.png"), size_variant="9.5×14 cm"),
                    dict(name="Sponge Scrubber", slug="sponge-scrubber", retail_price=20, wholesale_price=16, moq=12, unit="piece", image_url=img("cleaning-products.png")),
                ],
            },
            {
                "slug": "grass-broom",
                "products": [
                    dict(name="Soft Grass Broom - Small", slug="soft-grass-broom-small", retail_price=75, wholesale_price=62, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Small Soft"),
                    dict(name="Soft Grass Broom - Large", slug="soft-grass-broom-large", retail_price=95, wholesale_price=78, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Large Soft"),
                    dict(name="Hard Grass Broom - Big", slug="hard-grass-broom-big", retail_price=110, wholesale_price=90, moq=6, unit="piece", image_url=img("cleaning-products.png"), size_variant="Big Hard"),
                ],
            },
            {
                "slug": "dustpan",
                "products": [
                    dict(name="Samarthaya Dustpan", slug="samarthaya-dustpan", retail_price=65, wholesale_price=53, moq=6, unit="piece", image_url=img("cleaning-products.png"), brand="Samarthaya"),
                    dict(name="Mappy Dustpan", slug="mappy-dustpan", retail_price=75, wholesale_price=62, moq=6, unit="piece", image_url=img("cleaning-products.png"), brand="Mappy"),
                    dict(name="Safee Dustpan", slug="safee-dustpan", retail_price=85, wholesale_price=70, moq=6, unit="piece", image_url=img("cleaning-products.png"), brand="Safee"),
                ],
            },
        ],
    },

    # ── CLEANING CHEMICALS ───────────────────────────────────────────────────
    {
        "department": "cleaning-chemicals",
        "categories": [
            {
                "slug": "toilet-cleaner",
                "products": [
                    dict(name="Harpic Toilet Cleaner 500ml", slug="harpic-500ml", retail_price=85, wholesale_price=70, moq=12, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Harpic", size_variant="500ml", is_featured=True),
                    dict(name="Harpic Toilet Cleaner 1 Ltr", slug="harpic-1ltr", retail_price=145, wholesale_price=119, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Harpic", size_variant="1 Ltr"),
                    dict(name="Harpic Flushmatic", slug="harpic-flushmatic", retail_price=75, wholesale_price=62, moq=12, unit="piece", image_url=img("cleaning-chemicals.png"), brand="Harpic"),
                    dict(name="Bloom Toilet Cleaner", slug="bloom-toilet-cleaner", retail_price=55, wholesale_price=45, moq=12, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Bloom"),
                ],
            },
            {
                "slug": "glass-cleaner",
                "products": [
                    dict(name="Colin Glass Cleaner 500ml", slug="colin-500ml", retail_price=95, wholesale_price=78, moq=12, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Colin", size_variant="500ml", is_featured=True),
                    dict(name="Colin Glass Cleaner Pouch", slug="colin-pouch", retail_price=65, wholesale_price=53, moq=12, unit="pouch", image_url=img("cleaning-chemicals.png"), brand="Colin"),
                    dict(name="Pollie Glass Cleaner", slug="pollie-glass-cleaner", retail_price=45, wholesale_price=37, moq=12, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Pollie"),
                    dict(name="Glass Cleaner 5 Ltr", slug="glass-cleaner-5ltr", retail_price=280, wholesale_price=230, moq=4, unit="can", image_url=img("cleaning-chemicals.png"), size_variant="5 Ltr"),
                ],
            },
            {
                "slug": "floor-cleaner",
                "products": [
                    dict(name="Lizol Floor Cleaner", slug="lizol-floor-cleaner", retail_price=115, wholesale_price=94, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Lizol", is_featured=True),
                    dict(name="Walker Floor Cleaner", slug="walker-floor-cleaner", retail_price=85, wholesale_price=70, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Walker"),
                    dict(name="Sunny Floor Cleaner", slug="sunny-floor-cleaner", retail_price=75, wholesale_price=62, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Sunny"),
                    dict(name="Pollie Floor Cleaner", slug="pollie-floor-cleaner", retail_price=65, wholesale_price=53, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Pollie"),
                    dict(name="Surface Cleaner 5 Ltr", slug="surface-cleaner-5ltr", retail_price=320, wholesale_price=263, moq=4, unit="can", image_url=img("cleaning-chemicals.png"), size_variant="5 Ltr"),
                ],
            },
            {
                "slug": "dishwash-liquid",
                "products": [
                    dict(name="Vim Dishwash Liquid 250ml", slug="vim-250ml", retail_price=55, wholesale_price=45, moq=12, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Vim", size_variant="250ml", is_featured=True),
                    dict(name="Vim Dishwash Liquid 750ml", slug="vim-750ml", retail_price=125, wholesale_price=103, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Vim", size_variant="750ml"),
                    dict(name="Freshco Dishwash 5 Ltr", slug="freshco-5ltr", retail_price=285, wholesale_price=234, moq=4, unit="can", image_url=img("cleaning-chemicals.png"), brand="Freshco", size_variant="5 Ltr"),
                    dict(name="Prince Dishwash 5 Ltr", slug="prince-5ltr", retail_price=265, wholesale_price=218, moq=4, unit="can", image_url=img("cleaning-chemicals.png"), brand="Prince", size_variant="5 Ltr"),
                ],
            },
            {
                "slug": "handwash",
                "products": [
                    dict(name="Dettol Handwash Pouch 200ml", slug="dettol-pouch-200ml", retail_price=55, wholesale_price=45, moq=12, unit="pouch", image_url=img("cleaning-chemicals.png"), brand="Dettol", size_variant="200ml Pouch", is_featured=True),
                    dict(name="Dettol Handwash Pump 250ml", slug="dettol-pump-250ml", retail_price=95, wholesale_price=78, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Dettol", size_variant="250ml Pump"),
                    dict(name="Do Missile Handwash", slug="do-missile-handwash", retail_price=45, wholesale_price=37, moq=12, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Do Missile"),
                    dict(name="Handwash Bulk 5 Ltr", slug="handwash-5ltr", retail_price=310, wholesale_price=255, moq=4, unit="can", image_url=img("cleaning-chemicals.png"), size_variant="5 Ltr"),
                ],
            },
            {
                "slug": "air-freshener",
                "products": [
                    dict(name="Godrej Air Freshener", slug="godrej-air-freshener", retail_price=145, wholesale_price=119, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Godrej", is_featured=True),
                    dict(name="Odonil Air Freshener", slug="odonil-air-freshener", retail_price=85, wholesale_price=70, moq=6, unit="piece", image_url=img("cleaning-chemicals.png"), brand="Odonil"),
                    dict(name="Pour Home Air Freshener", slug="pour-home-air-freshener", retail_price=125, wholesale_price=103, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Pour Home"),
                ],
            },
            {
                "slug": "pest-control",
                "products": [
                    dict(name="Black Hit Cockroach Spray", slug="black-hit", retail_price=135, wholesale_price=111, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Hit", size_variant="Black"),
                    dict(name="Red Hit Mosquito Spray", slug="red-hit", retail_price=135, wholesale_price=111, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Hit", size_variant="Red"),
                    dict(name="Khatnil Pest Control Spray", slug="khatnil-spray", retail_price=95, wholesale_price=78, moq=6, unit="bottle", image_url=img("cleaning-chemicals.png"), brand="Khatnil"),
                ],
            },
        ],
    },

    # ── PAPER PRODUCTS ───────────────────────────────────────────────────────
    {
        "department": "paper-products",
        "categories": [
            {
                "slug": "paper-napkins",
                "products": [
                    dict(name="Velox Paper Napkin 22x22 (100pcs)", slug="velox-napkin-22x22", retail_price=45, wholesale_price=37, moq=10, unit="pack", image_url=img("paper-products.png"), brand="Velox", size_variant="22×22 cm", is_featured=True),
                    dict(name="Velox Paper Napkin 25x28 (100pcs)", slug="velox-napkin-25x28", retail_price=55, wholesale_price=45, moq=10, unit="pack", image_url=img("paper-products.png"), brand="Velox", size_variant="25×28 cm"),
                    dict(name="Velox Paper Napkin 28x30 (100pcs)", slug="velox-napkin-28x30", retail_price=65, wholesale_price=53, moq=10, unit="pack", image_url=img("paper-products.png"), brand="Velox", size_variant="28×30 cm"),
                    dict(name="Velox 2-Ply Napkin 30x30 (50pcs)", slug="velox-napkin-2ply-30x30", retail_price=85, wholesale_price=70, moq=10, unit="pack", image_url=img("paper-products.png"), brand="Velox", size_variant="30×30 cm 2-Ply"),
                ],
            },
            {
                "slug": "toilet-rolls",
                "products": [
                    dict(name="Double Diamond Toilet Roll (6 in 1)", slug="double-diamond-roll-6in1", retail_price=95, wholesale_price=78, moq=6, unit="pack", image_url=img("paper-products.png"), brand="Double Diamond", size_variant="6 in 1", is_featured=True),
                    dict(name="Double Diamond Toilet Roll (10 in 1)", slug="double-diamond-roll-10in1", retail_price=155, wholesale_price=127, moq=4, unit="pack", image_url=img("paper-products.png"), brand="Double Diamond", size_variant="10 in 1"),
                    dict(name="Century Toilet Roll (6 in 1)", slug="century-roll-6in1", retail_price=89, wholesale_price=73, moq=6, unit="pack", image_url=img("paper-products.png"), brand="Century", size_variant="6 in 1"),
                    dict(name="Century Toilet Roll (10 in 1)", slug="century-roll-10in1", retail_price=145, wholesale_price=119, moq=4, unit="pack", image_url=img("paper-products.png"), brand="Century", size_variant="10 in 1"),
                ],
            },
            {
                "slug": "hrt-rolls",
                "products": [
                    dict(name="HRT Roll 1 Kg", slug="hrt-roll-1kg", retail_price=110, wholesale_price=90, moq=6, unit="kg", image_url=img("paper-products.png"), size_variant="1 Kg"),
                ],
            },
            {
                "slug": "box-tissues",
                "products": [
                    dict(name="Premier Box Tissue 4 in 1", slug="premier-box-tissue-4in1", retail_price=145, wholesale_price=119, moq=4, unit="pack", image_url=img("paper-products.png"), brand="Premier", size_variant="4 in 1", is_featured=True),
                    dict(name="Double Diamond Box Tissue 4 in 1", slug="dd-box-tissue-4in1", retail_price=135, wholesale_price=111, moq=4, unit="pack", image_url=img("paper-products.png"), brand="Double Diamond", size_variant="4 in 1"),
                ],
            },
            {
                "slug": "kitchen-towel",
                "products": [
                    dict(name="Claret Kitchen Towel", slug="claret-kitchen-towel", retail_price=95, wholesale_price=78, moq=6, unit="roll", image_url=img("paper-products.png"), brand="Claret"),
                    dict(name="Century Kitchen Towel", slug="century-kitchen-towel", retail_price=89, wholesale_price=73, moq=6, unit="roll", image_url=img("paper-products.png"), brand="Century"),
                    dict(name="Velox Premium Kitchen Towel 2 in 1", slug="velox-kitchen-towel-2in1", retail_price=125, wholesale_price=103, moq=6, unit="pack", image_url=img("paper-products.png"), brand="Velox", size_variant="2 in 1"),
                ],
            },
        ],
    },

    # ── PLASTIC PRODUCTS & OTHERS ────────────────────────────────────────────
    {
        "department": "plastic-products",
        "categories": [
            {
                "slug": "dustbins",
                "products": [
                    dict(name="Small Paddle Bin", slug="small-paddle-bin", retail_price=145, wholesale_price=119, moq=3, unit="piece", image_url=img("plastic-products.png"), size_variant="Small Paddle", is_featured=True),
                    dict(name="Medium Paddle Bin", slug="medium-paddle-bin", retail_price=195, wholesale_price=160, moq=3, unit="piece", image_url=img("plastic-products.png"), size_variant="Medium Paddle"),
                    dict(name="20 Ltr Swing Bin", slug="20ltr-swing-bin", retail_price=225, wholesale_price=185, moq=2, unit="piece", image_url=img("plastic-products.png"), size_variant="20 Ltr Swing"),
                    dict(name="60 Ltr Swing Bin", slug="60ltr-swing-bin", retail_price=385, wholesale_price=316, moq=2, unit="piece", image_url=img("plastic-products.png"), size_variant="60 Ltr Swing"),
                    dict(name="80 Ltr Swing Bin", slug="80ltr-swing-bin", retail_price=450, wholesale_price=370, moq=2, unit="piece", image_url=img("plastic-products.png"), size_variant="80 Ltr Swing"),
                ],
            },
            {
                "slug": "buckets",
                "products": [
                    dict(name="Hariware Bucket 5 Ltr", slug="hariware-bucket-5ltr", retail_price=65, wholesale_price=53, moq=6, unit="piece", image_url=img("plastic-products.png"), brand="Hariware", size_variant="5 Ltr"),
                    dict(name="Hariware Bucket 10 Ltr", slug="hariware-bucket-10ltr", retail_price=95, wholesale_price=78, moq=6, unit="piece", image_url=img("plastic-products.png"), brand="Hariware", size_variant="10 Ltr"),
                    dict(name="Hariware Bucket 15 Ltr", slug="hariware-bucket-15ltr", retail_price=125, wholesale_price=103, moq=4, unit="piece", image_url=img("plastic-products.png"), brand="Hariware", size_variant="15 Ltr"),
                    dict(name="Hariware Bucket 20 Ltr", slug="hariware-bucket-20ltr", retail_price=155, wholesale_price=127, moq=4, unit="piece", image_url=img("plastic-products.png"), brand="Hariware", size_variant="20 Ltr"),
                    dict(name="Hariware Bucket 25 Ltr", slug="hariware-bucket-25ltr", retail_price=185, wholesale_price=152, moq=3, unit="piece", image_url=img("plastic-products.png"), brand="Hariware", size_variant="25 Ltr"),
                ],
            },
            {
                "slug": "tumblers",
                "products": [
                    dict(name="Plastic Tumbler 750ml", slug="tumbler-750ml", retail_price=35, wholesale_price=29, moq=6, unit="piece", image_url=img("plastic-products.png"), size_variant="750ml"),
                    dict(name="Plastic Tumbler 1 Ltr", slug="tumbler-1ltr", retail_price=45, wholesale_price=37, moq=6, unit="piece", image_url=img("plastic-products.png"), size_variant="1 Ltr"),
                ],
            },
            {
                "slug": "water-bottles",
                "products": [
                    dict(name="Plastic Water Bottle Single", slug="water-bottle-single", retail_price=55, wholesale_price=45, moq=6, unit="piece", image_url=img("plastic-products.png"), size_variant="Single"),
                    dict(name="Plastic Water Bottles 6 in 1", slug="water-bottle-6in1", retail_price=295, wholesale_price=242, moq=2, unit="set", image_url=img("plastic-products.png"), size_variant="6 in 1"),
                ],
            },
            {
                "slug": "batteries",
                "products": [
                    dict(name="Duracell AA Battery (Pack of 2)", slug="duracell-aa-2pack", retail_price=95, wholesale_price=78, moq=10, unit="pack", image_url=img("plastic-products.png"), brand="Duracell", size_variant="AA × 2"),
                    dict(name="Duracell AAA Battery (Pack of 2)", slug="duracell-aaa-2pack", retail_price=95, wholesale_price=78, moq=10, unit="pack", image_url=img("plastic-products.png"), brand="Duracell", size_variant="AAA × 2"),
                    dict(name="Duracell AA Battery (Pack of 4)", slug="duracell-aa-4pack", retail_price=175, wholesale_price=144, moq=6, unit="pack", image_url=img("plastic-products.png"), brand="Duracell", size_variant="AA × 4"),
                ],
            },
        ],
    },
]


def seed():
    total_products = 0
    total_errors = 0

    for dept_data in CATALOG:
        dept_slug = dept_data["department"]

        # Get department
        dept_resp = sb.table("departments").select("id").eq("slug", dept_slug).single().execute()
        if not dept_resp.data:
            print(f"Warning: Department '{dept_slug}' not found - run supabase_schema.sql first")
            continue
        dept_id = dept_resp.data["id"]
        print(f"\nDepartment: {dept_slug}")

        for cat_data in dept_data["categories"]:
            cat_slug = cat_data["slug"]

            # Get category
            cat_resp = sb.table("categories").select("id").eq("slug", cat_slug).single().execute()
            if not cat_resp.data:
                print(f"  Warning: Category '{cat_slug}' not found")
                continue
            cat_id = cat_resp.data["id"]

            # Prepare products
            products_to_insert = []
            for p in cat_data["products"]:
                product_row = {
                    "category_id": cat_id,
                    "name": p["name"],
                    "slug": p["slug"],
                    "description": p.get("description"),
                    "brand": p.get("brand"),
                    "size_variant": p.get("size_variant"),
                    "retail_price": p.get("retail_price"),
                    "wholesale_price": p.get("wholesale_price"),
                    "moq": p.get("moq", 1),
                    "unit": p.get("unit", "piece"),
                    "image_url": p.get("image_url"),
                    "in_stock": p.get("in_stock", True),
                    "is_active": p.get("is_active", True),
                    "is_featured": p.get("is_featured", False),
                }
                products_to_insert.append(product_row)

            try:
                # Upsert on slug to avoid duplicates on re-runs
                result = sb.table("products").upsert(
                    products_to_insert, on_conflict="slug"
                ).execute()
                count = len(result.data) if result.data else 0
                total_products += count
                print(f"  Success: {cat_slug}: {count} products")
            except Exception as e:
                total_errors += 1
                print(f"  Error: {cat_slug}: {e}")

    print(f"\n{'='*50}")
    print(f"Seed complete: {total_products} products inserted/updated")
    if total_errors:
        print(f"Error: {total_errors} errors - check output above")


if __name__ == "__main__":
    seed()
