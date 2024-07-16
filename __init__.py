from flask import Flask
from views.home import home_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    app.register_blueprint(home_bp)

    return app
