from flask import Blueprint, render_template, request, jsonify, redirect, url_for
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
import requests

comment_bp = Blueprint('comment', __name__, url_prefix='/comment')

# Load environment variables
load_dotenv()

RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")
RECAPTCHA_SITE_KEY = os.getenv("RECAPTCHA_SITE_KEY")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.ox.ac.uk")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_TO = os.getenv("EMAIL_TO")
EMAIL_TO_PASS = os.getenv("EMAIL_TO_PASS")
SEND_A_COPY = os.getenv("SEND_A_COPY")

@comment_bp.route('/index')
def index():
    return render_template('comment.jinja2', title="Comment" , recaptcha_site_key=RECAPTCHA_SITE_KEY, send_copy=SEND_A_COPY.lower())


@comment_bp.route('/send', methods=['POST'])
def send_comment():
    """
    Handles comment form submission via AJAX, returns JSON response.
    """
    id = request.form.get("id", "").strip()
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip()
    comment = request.form.get("comment", "").strip()
    object_type = request.form.get("type", "").strip()
    g_recaptcha_response = request.form.get("g-recaptcha-response", "").strip()
    send_copy = request.form.get("send_copy") 


    # Step 1: Validate inputs
    error = ""
    if not name:
        error = "Please enter your name."
    elif not email or "@" not in email or "." not in email:
        error = "Please enter a valid email address."
    elif not comment:
        error = "Please enter a comment."

    if error:
        return jsonify(success=False, message=error), 400
    
    # Step 2: Validate captcha
    captcha_url = "https://www.google.com/recaptcha/api/siteverify"
    captcha_data = {
        "secret": RECAPTCHA_SECRET_KEY,
        "response": g_recaptcha_response,
        "remoteip": request.remote_addr
    }

    try:
        captcha_res = requests.post(captcha_url, data=captcha_data)
        captcha_result = captcha_res.json()
    except Exception as e:
        return jsonify(success=False, message="Captcha verification failed, because of an error."), 500

    if not captcha_result.get("success"):
        return jsonify(success=False, message="Captcha validation failed, please try again."), 400

    type = object_type
    if object_type == "institution":
        type = "repository"

    # Step 3: Construct email body
    email_body = (
        "Email via EMLO website\n"
        "======================\n\n"
        f"Comment on record: http://emlo.bodleian.ox.ac.uk/profile/{type}/{id}\n\n"
        f"From: {name}\n"
        f"Email: {email}\n\n"
        f"Message:\n{comment}\n"
    )

    # Step 4: Send email
    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(EMAIL_TO, EMAIL_TO_PASS)

            msg = MIMEText(email_body)
            msg["Subject"] = "A comment from EMLO record"
            msg["From"] = email
            msg["To"] = EMAIL_TO
            server.send_message(msg)

            if send_copy: 
                print(f"Sending email")
                copy_msg = MIMEText(email_body)
                copy_msg["Subject"] = "Your comment on EMLO record"
                copy_msg["From"] = EMAIL_TO   # better to send from system email
                copy_msg["To"] = email
                server.send_message(copy_msg)

    except Exception as e:
        return jsonify(success=False, message=f"Error sending email: {e}"), 500

    return jsonify(success=True, message="Your comment has been sent successfully!" , object_type=object_type , uuid=id)

@comment_bp.route('/thanks')
def thanks():
    print(f"Got control")
    object_type = request.args.get("object_type")
    uuid = request.args.get("uuid")
    return render_template(
        "thanks.jinja2",
        title="thanks",
        object_type=object_type,
        uuid=uuid
    )