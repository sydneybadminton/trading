import sys

from badminton import app
from models import db, User


def main():
    with app.app_context():
        db.metadata.create_all(db.engine)

        create_more = 'y'
        while create_more == 'y':
            print 'Enter firstname: ',
            firstname = raw_input()

            print 'Enter lastname: ',
            lastname = raw_input()

            print 'Enter email: ',
            email = raw_input()

            print 'Enter password',
            password = raw_input()

            print 'Enter balance: ',
            balance = raw_input()

            print 'Enter group: ',
            group = raw_input()

            print 'Enter isGroupOwner (y/n): ',
            is_group_owner = True if raw_input() == 'y' else False

            print 'Enter isAdmin (y/n): ',
            is_admin = True if raw_input() == 'y' else False

            print 'Enter Saturday absent weeks: ',
            saturday_absent_weeks = raw_input()

            future_saturday_absent_weeks = 0
            if int(saturday_absent_weeks) <= 0:
                print 'Enter future Saturday absent weeks: ',
                future_saturday_absent_weeks = raw_input()

            print 'Enter Sunday absent weeks: ',
            sunday_absent_weeks = raw_input()

            future_sunday_absent_weeks = 0
            if int(sunday_absent_weeks) <= 0:
                print 'Enter future Sunday absent weeks: ',
                future_sunday_absent_weeks = raw_input()

            user = User(firstname, lastname, email, password, balance, group, is_group_owner,
                        is_admin, saturday_absent_weeks, future_saturday_absent_weeks, sunday_absent_weeks,
                        future_sunday_absent_weeks)
            db.session.add(user)
            db.session.commit()

            print 'Do you want to create more users (y/n): ',
            create_more = raw_input()


if __name__ == '__main__':
    sys.exit(main())
