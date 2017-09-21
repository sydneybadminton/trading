import sys

from badminton import app
from models import db, CourtsCost

def main():
    with app.app_context():
        db.metadata.create_all(db.engine)

        createMore = 'y'
        while (createMore == 'y'):
            print 'Enter cost: ',
            cost = raw_input()

            print 'Enter day: ',
            day = raw_input()

            courtsCost = CourtsCost(cost, day)
            db.session.add(courtsCost)
            db.session.commit()

            print 'Do you want to create more users (y/n): ',
            createMore = raw_input()

if __name__ == '__main__':
    sys.exit(main())