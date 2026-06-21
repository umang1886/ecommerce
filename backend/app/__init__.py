from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()


def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000", "https://veloxmart.com"])

    # Register blueprints
    from .routes.departments import departments_bp
    from .routes.products import products_bp
    from .routes.cart import cart_bp
    from .routes.orders import orders_bp
    from .routes.admin import admin_bp
    from .routes.auth import auth_bp

    app.register_blueprint(departments_bp, url_prefix="/api")
    app.register_blueprint(products_bp, url_prefix="/api")
    app.register_blueprint(cart_bp, url_prefix="/api")
    app.register_blueprint(orders_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "VeloxMart API"}

    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        traceback.print_exc()
        return {"error": str(e)}, 500

    return app
