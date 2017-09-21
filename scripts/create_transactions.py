import sys

from badminton import app
from models import db, Transaction

def main():
    with app.app_context():
        db.metadata.create_all(db.engine)

        createMore = 'y'
        while (createMore == 'y'):
            print 'Enter email: ',
            email = raw_input()

            print 'Enter amount: ',
            amount = raw_input()

            print 'Enter balance: ',
            balance = raw_input()

            print 'Enter type: ',
            type = raw_input()

            transaction = Transaction(email, amount, balance, type)
            db.session.add(transaction)
            db.session.commit()

            print 'Do you want to create more users (y/n): ',
            createMore = raw_input()

if __name__ == '__main__':
    sys.exit(main())