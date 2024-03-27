from flask import Flask, render_template

from site_front_2 import settings
from site_front_2.flaskapp.filters import emfr_filters
from site_front_2.flaskapp.views import browse

app = Flask(__name__)


@app.route("/")
def home():
    return render_template('home.jinja2')


@app.context_processor
def inject_global_template_vars():
    return dict(
        COLLECTIONS_URL=settings.COLLECTIONS_URL,
        CONTRIBUTE_URL=settings.CONTRIBUTE_URL,
        ABOUT_URL=settings.ABOUT_URL,
    )


# Register blueprints
app.register_blueprint(browse.bp, url_prefix='/browse')

# Register filters
app.template_filter('hide_zero')(emfr_filters.hide_zero)


def main():
    app.run(debug=True, port=9020)


if __name__ == '__main__':
    main()
