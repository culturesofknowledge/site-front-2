from flask import Blueprint, render_template, request, jsonify, redirect, url_for
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
import requests
import ssl

comment_bp = Blueprint('comment', __name__, url_prefix='/comment')

# Load environment variables
load_dotenv()

RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")
RECAPTCHA_SITE_KEY = os.getenv("RECAPTCHA_SITE_KEY")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.ox.ac.uk")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_LOGIN = os.getenv("SMTP_LOGIN")
SMTP_PASS = os.getenv("SMTP_PASS")
EMAIL_TO = os.getenv("EMAIL_TO")
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

    def send_message(server, subject, sender, recipient, body):
        """Helper function to create and send an email message."""
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = recipient
        server.send_message(msg)

    # Step 4: Send email
    try:
        if SMTP_PORT == 465:
            # SSL connection
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                if SMTP_PASS:
                    server.login(SMTP_LOGIN, SMTP_PASS)

                send_message(server, "A comment from EMLO record", EMAIL_TO, EMAIL_TO, email_body)

                if send_copy:
                    send_message(server, "Your comment on EMLO record", EMAIL_TO, email, email_body)

        elif SMTP_PORT in [587, 25]:
            # Plain or STARTTLS
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=20) as server:
                print(f"Connecting via port {SMTP_PORT}")

                # Use STARTTLS only for 587, or if you know port 25 supports it
                if SMTP_PORT == 587:
                    context = ssl.create_default_context()
                    server.starttls(context=context)

                # Optional login if password exists
                if SMTP_PASS:
                    server.login(SMTP_LOGIN, SMTP_PASS)
                else:
                    print("No password provided — skipping SMTP login")

                # Send main email
                send_message(server, "A comment from EMLO record", EMAIL_TO, EMAIL_TO, email_body)

                # Optional copy
                if send_copy:
                    send_message(server, "Your comment on EMLO record", EMAIL_TO, email, email_body)

        else:
            print(f"Unsupported port: {SMTP_PORT}")

    except smtplib.SMTPException as e:
        print(f"SMTP error occurred: {e}")

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