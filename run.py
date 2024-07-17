from flask import Flask
from views.home import home_bp
from views.browse import browse_bp
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.register_blueprint(home_bp)
    app.register_blueprint(browse_bp)

    return app

app = create_app()

def main():
    app.run(host='0.0.0.0', port=int(app.config['PORT']))

if __name__ == '__main__':
    main()
