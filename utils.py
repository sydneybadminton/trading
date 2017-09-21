import sendgrid

class SendGrid:
    @staticmethod
    def send_email(to, from_address, subject, text):
        client = sendgrid.SendGridClient("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")
        message = sendgrid.Mail()

        message.add_to(to)
        message.set_from(from_address)
        message.set_subject(subject)
        message.set_text(text)

        client.send(message)
