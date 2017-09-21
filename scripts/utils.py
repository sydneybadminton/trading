import sendgrid
from mailin import Mailin

class SendMail:
    @staticmethod
    def sendgrid_email(to, from_address, subject, text):
        client = sendgrid.SendGridClient("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")
        message = sendgrid.Mail()

        message.add_to("malli.arjun@gmail.com")
        message.set_from(from_address)
        message.set_subject(subject)
        message.set_html(text)

        client.send(message)

    @staticmethod
    def sendinblue_email(to, from_address, subject, text):
        m = Mailin("https://api.sendinblue.com/v2.0", "fTUanjNP10bYs2yV")
        data = {"to": {to: "to maddy!"},
                "from": [from_address, "from email!"],
                "subject": subject,
                "html": text
                }

        result = m.send_email(data)
        print(result)
        return result
