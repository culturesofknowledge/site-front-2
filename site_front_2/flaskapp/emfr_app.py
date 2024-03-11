import logging

from flask import Flask, redirect, render_template

app = Flask(__name__)


# app.register_blueprint(api_views.bp, url_prefix='/api')


@app.route("/")
def root():
    return render_template('index.html')


def main():
    app.run(debug=True, port=9020)


if __name__ == '__main__':
    main()
