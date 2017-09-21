import sys

from badminton import app
from models import User
from utils import SendGrid


def main():
    with app.app_context():
        """Get all users whose balance is less than or equal $10"""
        users = User.query.filter(User.balance<=10)

        for user in users:
            subject = 'Badminton: Your balance is low please top up'
            message = 'Hi ' + user.firstname + \
                      ',\r\n\nYour balance is currently running low and it is ' + str(user.balance) + \
                      '$. Please top up your account.\r\n\nThanks\r\nSydney Badminton Group'
            SendGrid.send_email(user.email, "no-reply@sendgrid.me", subject, message)


if __name__ == "__main__":
    sys.exit(main())