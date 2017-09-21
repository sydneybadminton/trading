import sys
import json
from dateutil import parser

from badminton import app
from models import db, User, CourtsCost, Expense, Transaction, Log


def main():
    with app.app_context():
        db.metadata.create_all(db.engine)
        """User table"""
        with open('_User.json') as user_data_file:
            user_data = json.load(user_data_file)
        users = user_data["results"]
        for user in users:
            print 'Firstname = ' + user["firstname"]
            print 'Lastname = ' + user["lastname"]
            user_row = User(user["firstname"], user["lastname"], user["username"],
                            user["bcryptPassword"], user["balance"], user["group"],
                            bool(user["isGroupOwner"]), bool(user["isAdmin"]),
                            user["saturdayAbsentWeeks"], user["futureSaturdayAbsentWeeks"],
                            user["sundayAbsentWeeks"], user["futureSundayAbsentWeeks"],
                            parser.parse(user["createdAt"]), parser.parse(user["updatedAt"]))
            db.session.add(user_row)
            db.session.commit()

        """CourtsCost table"""
        with open('CourtsCost.json') as courts_cost_data_file:
            courts_cost_data = json.load(courts_cost_data_file)
        courts_costs = courts_cost_data["results"]
        for courts_cost in courts_costs:
            courts_cost_row = CourtsCost(courts_cost["cost"], courts_cost["day"],
                                         parser.parse(courts_cost["createdAt"]),
                                         parser.parse(courts_cost["updatedAt"]))
            db.session.add(courts_cost_row)
            db.session.commit()

        """Expenses table"""
        with open("Expenses.json") as expenses_data_file:
            expenses_data = json.load(expenses_data_file)
        expenses = expenses_data["results"]
        for expense in expenses:
            expense_row = Expense(expense["cost"], expense["costPerPerson"],
                                  expense["description"], expense["numberOfPlayers"],
                                  parser.parse(expense["createdAt"]),
                                  parser.parse(expense["updatedAt"]))
            db.session.add(expense_row)
            db.session.commit()

        """Transactions table"""
        with open("Transactions_Table.json") as transactions_data_file:
            transactions_data = json.load(transactions_data_file)
        transactions = transactions_data["results"]
        for transaction in transactions:
            transaction_row = Transaction(transaction["username"], transaction["Amount"],
                                          transaction["Total_Amount"], transaction["Transaction_Type"],
                                          parser.parse(transaction["Date"]["iso"]),
                                          parser.parse(transaction["createdAt"]),
                                          parser.parse(transaction["updatedAt"]))
            db.session.add(transaction_row)
            db.session.commit()

        """Logs table"""
        with open('Logs.json') as data_file:
            data = json.load(data_file)
        logs = data['results']
        for log in logs:
            log_row = Log(log["username"], log["description"], parser.parse(log["createdAt"]),
                          parser.parse(log["updatedAt"]))
            db.session.add(log_row)
            db.session.commit()


if __name__ == '__main__':
    sys.exit(main())
