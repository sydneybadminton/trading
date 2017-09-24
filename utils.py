import sendgrid
import os


class SendGrid:
    @staticmethod
    def send_email(to, from_address, subject, text):
        client = sendgrid.SendGridClient(os.environ.get('SEND_GRID_API_KEY'))
        message = sendgrid.Mail()

        message.add_to(to)
        message.set_from(from_address)
        message.set_subject(subject)
        message.set_text(text)

        client.send(message)
