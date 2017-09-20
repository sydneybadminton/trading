import sendgrid

class SendGrid:
    @staticmethod
    def send_email(to, from_address, subject, text):
        client = sendgrid.SendGridClient("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")
        message = sendgrid.Mail()

        message.add_to("malli.arjun@gmail.com")
        message.set_from(from_address)
        message.set_subject(subject)
        message.set_html(text)

        client.send(message)
