import sys
import uuid
from badminton import app
from models import db, User
from utils import SendGrid


def main():
    with app.app_context():
        users = User.query.order_by(User.firstname.asc()).all()

        for user in users:
            forgot_password_token = uuid.uuid1()
            user.forgotPasswordToken = str(forgot_password_token)
            db.session.commit()

            subject = "Badminton: set password to access your account"
            message = 'Hi ' + user.firstname + ",\r\n\n" + \
                      'In order to access your account on new Badminton website you need to click the below link' + \
                      ' to set your password.\r\n\n' + \
                      'http://' + app.config['HOST_NAME'] + "/resetPassword?token=" + user.forgotPasswordToken + \
                      '\r\n\nPlease bookmark following URL for easy access to the website in future.\r\n\n' + \
                      'http://' + app.config['HOST_NAME'] + \
                      '\r\n\nThanks\r\n Maddy'
            SendGrid.send_email(user.email, "no-reply@sendgrid.me", subject, message)
            print 'Sent an email to: ' + user.firstname

if __name__ == '__main__':
    sys.exit(main())