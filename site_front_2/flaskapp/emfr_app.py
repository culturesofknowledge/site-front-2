from flask import Flask, render_template

from site_front_2 import settings

app = Flask(__name__)


@app.route("/")
def root():
    return render_template('home.html')


@app.context_processor
def inject_global_template_vars():
    return dict(
        COLLECTIONS_URL=settings.COLLECTIONS_URL,
        CONTRIBUTE_URL=settings.CONTRIBUTE_URL,
        ABOUT_URL=settings.ABOUT_URL,
    )


def main():
    app.run(debug=True, port=9020)


if __name__ == '__main__':
    main()
