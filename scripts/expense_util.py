from badminton import app
from models import db, CourtsCost, User, Expense, Transaction
from utils import SendGrid


def run_expense(day):
    with app.app_context():
        if day != "Saturday" and day != "Sunday":
            return

        courts_cost = CourtsCost.query.filter_by(day=day).first()

        if day == "Saturday":
            players = User.query.filter_by(isSaturdayAbsent=False).order_by(User.firstname.asc())
            absent_players = User.query.filter_by(isSaturdayAbsent=True).order_by(User.firstname.asc())
        elif day == "Sunday":
            players = User.query.filter_by(isSundayAbsent=False).order_by(User.firstname.asc())
            absent_players = User.query.filter_by(isSundayAbsent=True).order_by(User.firstname.asc())
        db.session.close()

        email_ids = []
        body_text = ""
        if players.count() > 0:
            cost_per_player = float("{0:.2f}".format(float(courts_cost.cost) / float(players.count())))

            """Add expense entry"""
            expence_description = ("Deduction_Sunday", "Deduction_Saturday")[day == "Saturday"]
            expenseEntry = Expense(courts_cost.cost, cost_per_player, expence_description, players.count())
            db.session.add(expenseEntry)
            db.session.commit()

            body_text += 'Hi everyone,\r\n\nA total of ' + str(players.count()) + ' players attended the play on ' \
                        + day + ' and courts booking cost = $' + str(courts_cost.cost) + '. So cost per player = $' + \
                        str(cost_per_player) + ".\r\n\nBalances of played players are as follows:\r\n\n"

            for player in players:
                player.balance = float("{0:.2f}".format(player.balance - cost_per_player))

                transaction = Transaction(player.email, cost_per_player, player.balance,
                                          ("Deduct_Sun", "Deduct_Sat")[day == "Saturday"])
                db.session.add(transaction)
                db.session.commit()

                email_ids.append(player.email);
                body_text += player.firstname + ' ' + player.lastname + ' : ' + '$' + str(player.balance) + '\r\n'

        body_text += '\nBalances of absent players are as follows\r\n\n'

        for absent_player in absent_players:
            if day == "Saturday":
                absent_player.saturdayAbsentWeeks -= 1
                if absent_player.saturdayAbsentWeeks <= 0:
                    absent_player.saturdayAbsentWeeks = 0
                    absent_player.isSaturdayAbsent = False
            elif day == "Sunday":
                absent_player.sundayAbsentWeeks -= 1
                if absent_player.sundayAbsentWeeks <= 0:
                    absent_player.sundayAbsentWeeks = 0
                    absent_player.isSundayAbsent = False
            db.session.commit()

            email_ids.append(absent_player.email)
            body_text += absent_player.firstname + ' ' + absent_player.lastname + ' : ' + '$' + str(absent_player.balance) + '\r\n'

        """Check if user is absent in future, if so set the absent weeks, absent flag
            and set future absent weeks to zero"""
        for player in players:
            future_absent_weeks = (player.futureSundayAbsentWeeks,
                                   player.futureSaturdayAbsentWeeks)[day == "Saturday"]
            if future_absent_weeks > 0:
                if day == "Saturday":
                    player.futureSaturdayAbsentWeeks = 0
                    player.isSaturdayAbsent = True
                    player.saturdayAbsentWeeks = future_absent_weeks
                elif day == "Sunday":
                    player.futureSundayAbsentWeeks = 0
                    player.isSundayAbsent = True
                    player.sundayAbsentWeeks = future_absent_weeks
            db.session.commit()

        body_text += '\nThanks\r\nSydney Badminton Group'
        # SendGrid.send_email(email_ids, "no-reply@sendgrid.me",
        #                     "Badminton: Balances after " + day + "'s play", body_text)

        return
