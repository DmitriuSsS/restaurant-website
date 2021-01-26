import smtplib
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class Message:
    def __init__(self, recipient_mail, letter_text):
        self.title = 'Бронирование столика'
        self.recipient = recipient_mail
        self.text = letter_text


class Client:
    def __init__(self, login_client, password_client):
        self.login = login_client
        self._password = password_client

    def send_letter(self, message: Message):
        letter = MIMEMultipart()
        letter['Subject'] = message.title
        letter['From'] = self.login
        letter.attach(MIMEText(message.text))

        server = smtplib.SMTP('smtp.mail.ru:587')
        server.ehlo()
        server.starttls()
        server.login(self.login, self._password)
        server.sendmail(self.login, message.recipient, letter.as_string())


if __name__ == '__main__':
    args = sys.argv
    letter = args[1]
    recipient = args[2]
    login = args[3]
    password = args[4]

    print(args)

    client = Client(login, password)
    client.send_letter(Message(recipient, letter))
