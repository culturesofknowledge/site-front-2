from flask import Flask
from views.home import home_bp
from views.browse import browse_bp
from views.advance import advance_bp
from views.collections import collections_bp
from views.contribute import contribute_bp
from views.about import about_bp
from views.forms import forms_bp
from views.profile import profile_bp
from views.comment import comment_bp
from views.errors import errors_bp
from views.solr import solr_bp
from views.shortURL import shortURL_bp
from views.redirectUUID import redirect_uuid_bp
from views.test_runner import test_runner_bp
from config import Config
import os


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
    app.register_blueprint(profile_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(errors_bp)
    app.register_blueprint(solr_bp)
    app.register_blueprint(shortURL_bp)
    app.register_blueprint(redirect_uuid_bp)
    app.register_blueprint(test_runner_bp)

    return app


app = create_app()


def main():
    debug_mode = os.getenv('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=int(app.config['PORT']), debug=debug_mode)


if __name__ == '__main__':
    main()