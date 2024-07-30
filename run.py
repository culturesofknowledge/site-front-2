from flask import Flask
from views.home import home_bp
from views.browse import browse_bp
from views.advance import advance_bp
from views.collections import collections_bp
from views.contribute import contribute_bp
from views.about import about_bp
from views.forms import forms_bp
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.register_blueprint(home_bp)
    app.register_blueprint(browse_bp)
    app.register_blueprint(advance_bp)
    app.register_blueprint(collections_bp)
    app.register_blueprint(contribute_bp)
    app.register_blueprint(about_bp)
    app.register_blueprint(forms_bp)

    return app

app = create_app()

def main():
    app.run(host='0.0.0.0', port=int(app.config['PORT']))

if __name__ == '__main__':
    main()
