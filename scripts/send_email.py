from utils import SendGrid
import sys

def main():
    to = []
    to.append("malli.arjun@gmail")
    to.append("maddyd@yahoo-inc.com")
    to.append("malli_730@yahoo.com")
    to.append("subwayjordansprings@gmail.com")
    SendGrid.send_email(to, "no-reply@sendgrid.me", "Subject", "Body")

if __name__ == '__main__':
    sys.exit(main())
