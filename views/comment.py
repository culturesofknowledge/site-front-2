from flask import Blueprint, render_template

comment_bp = Blueprint('comment', __name__, url_prefix='/comment')

@comment_bp.route('/index')
def index():
    return render_template('comment.jinja2', title="Comment")
