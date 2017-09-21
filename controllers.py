import uuid
import json
from flask import request, abort, render_template, flash, redirect, url_for
from flask.ext.login import current_user
from flask.ext.login import login_required
from flask.ext.login import login_user
from flask.ext.login import logout_user
from flask import Blueprint
from sqlalchemy import and_, or_
from models import db, User, UserSchema, UserShortSchema, \
    Transaction, TransactionSchema, CourtsCost, Expense, Log
from utils import SendGrid
from forms import ResetPasswordForm
from expense_util import run_expense


api = Blueprint('api', __name__)


@api.route('/')
def home():
    return render_template("index.html")


@api.route('/api/login', methods=['POST'])
def login():
    if not request.json or 'email' not in request.json or 'password' not in request.json:
        abort(400)

    email = request.json['email']
    password = request.json['password']
    user = User.query.get(email)

    if not user:
        abort(404)

    if user.verify_password(password):
        user.isAuthenticated = True
        db.session.add(user)
        db.session.commit()
        login_user(user, remember=True)
        schema = UserSchema()
        json_result = schema.dumps(user)
        return json_result.data
    else:
        abort(401)


@api.route('/api/getMembers')
@login_required
def get_members():
    members = User.query.filter(and_(User.email != current_user.email, User.group == current_user.group))\
        .order_by(User.firstname.asc())
    schema = UserSchema(many=True)
    json_result = schema.dumps(members)
    return json_result.data


@api.route('/api/getTransactions/<string:email>')
@login_required
def get_transactions(email):
    user = User.query.get(email)

    if not user:
        abort(404)

    if user.group is not current_user.group:
        abort(404)

    transactions = Transaction.query.filter_by(email=email).order_by(Transaction.date.desc()).limit(5)
    schema = TransactionSchema(many=True)
    json_result = schema.dumps(transactions)
    return json_result.data


@api.route('/api/absents')
@login_required
def absents():
    day = request.args.get('day')
    if day != "Saturday" and day != "Sunday":
        abort(400)

    if day == "Saturday":
        absents = User.query.filter_by(isSaturdayAbsent=True).order_by(User.firstname.asc())
    elif day == "Sunday":
        absents = User.query.filter_by(isSundayAbsent=True).order_by(User.firstname.asc())

    schema = UserShortSchema(many=True)
    json_result = schema.dumps(absents)
    return json_result.data


@api.route('/api/cantPlayOnSaturdays', methods=['POST'])
@login_required
def cant_play_on_saturdays():
    email = request.json['email']
    weeks = int(request.json['weeks'])
    future = bool(request.json['future'])

    if weeks <= 0 or weeks > 520:
        abort(400)

    user = User.query.get(email)
    if not user:
        abort(404)

    if user.group is not current_user.group:
        abort(404)

    if user.email is not email and not current_user.isGroupOwner:
        abort(401)

    if future:
        user.futureSaturdayAbsentWeeks = weeks
    else:
        user.isSaturdayAbsent = True
        user.saturdayAbsentWeeks = weeks
    db.session.commit()

    """"Insert a log"""
    description = 'Successfully registered Saturday absence for - ' + str(weeks) + ' weeks' + \
        ' for user - ' + user.firstname + ' ' + user.lastname
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    schema = UserSchema()
    json_result = schema.dumps(user)
    return json_result.data


@api.route('/api/wantToPlayOnSaturdays/<string:email>')
@login_required
def want_to_play_on_saturdays(email):
    user = User.query.get(email)

    if not user:
        abort(404)

    if user.group is not current_user.group:
        abort(404)

    if user.email is not email and not current_user.isGroupOwner:
        abort(401)

    user.isSaturdayAbsent = False
    user.saturdayAbsentWeeks = 0
    user.futureSaturdayAbsentWeeks = 0
    db.session.commit()

    """"Insert a log"""
    description = 'Successfully registered wantToPlayOnSaturdays for user' + user.firstname + ' ' + user.lastname
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    schema = UserSchema()
    json_result = schema.dumps(user)
    return json_result.data


@api.route('/api/cantPlayOnSundays', methods=['POST'])
@login_required
def cant_play_on_sundays():
    email = request.json['email']
    weeks = int(request.json['weeks'])
    future = bool(request.json['future'])

    if weeks <= 0 or weeks > 520:
        abort(400)

    user = User.query.get(email)
    if not user:
        abort(404)

    if user.group is not current_user.group:
        abort(404)

    if user.email is not email and not current_user.isGroupOwner:
        abort(401)

    if future:
        user.futureSundayAbsentWeeks = weeks
    else:
        user.isSundayAbsent = True
        user.sundayAbsentWeeks = weeks
    db.session.commit()

    """"Insert a log"""
    description = 'Successfully registered Sunday absence for - ' + str(weeks) + ' weeks' + \
        ' for user - ' + user.firstname + ' ' + user.lastname
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    schema = UserSchema()
    json_result = schema.dumps(user)
    return json_result.data


@api.route('/api/wantToPlayOnSundays/<string:email>')
@login_required
def want_to_play_on_sundays(email):
    user = User.query.get(email)

    if not user:
        abort(404)

    if user.group is not current_user.group:
        abort(404)

    if user.email is not email and not current_user.isGroupOwner:
        abort(401)

    user.isSundayAbsent = False
    user.sundayAbsentWeeks = 0
    user.futureSundayAbsentWeeks = 0
    db.session.commit()

    """"Insert a log"""
    description = 'Successfully registered wantToPlayOnSundays for user - ' + user.firstname + ' ' + user.lastname
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    schema = UserSchema()
    json_result = schema.dumps(user)
    return json_result.data


@api.route('/api/removeSaturdayAbsentee')
@login_required
def remove_saturday_absentee():
    if not current_user.isAdmin:
        abort(401)

    email = request.args.get('email')
    user = User.query.get(email)

    if not user:
        abort(404)

    user.isSaturdayAbsent = False
    user.saturdayAbsentWeeks = 0
    user.futureSaturdayAbsentWeeks = 0
    db.session.commit()

    """Insert a log"""
    description = 'Deleted Saturday absentee - ' + user.firstname + ' ' + user.lastname
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    super_user = User.query.filter_by(isSuperUser=True).first()

    """Send an email"""
    subject = 'Badminton: You are playing again on Saturdays!!!'
    message = 'Hi,\r\n\nYou are removed from Saturday absents list by ' + current_user.firstname + ' ' + \
              current_user.lastname + '. From this point onwards you are assumed to be playing on Saturdays ' + \
              'and you are charged for Saturday games. If you can\'t play in future please ' + \
              'register your absense using the badminton app.\r\n\n' + \
              'If you have any issues please contact ' + super_user.firstname + ' ' + \
              super_user.lastname + ' at: ' + super_user.email + '\r\n\nThanks\r\nSydney Badminton Group'
    SendGrid.send_email(user.email, "no-reply@sendgrid.me", subject, message)

    return "Success"


@api.route('/api/removeSundayAbsentee')
@login_required
def remove_sunday_absentee():
    if not current_user.isAdmin:
        abort(401)

    email = request.args.get('email')
    user = User.query.get(email)
    if not user:
        abort(404)

    user.isSundayAbsent = False
    user.sundayAbsentWeeks = 0
    user.futureSundayAbsentWeeks = 0
    db.session.commit()

    """Insert a log"""
    description = 'Deleted Sunday absentee - ' + user.firstname + ' ' + user.lastname
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    super_user = User.query.filter_by(isSuperUser=True).first()

    """Send an email"""
    subject = 'Badminton: You are playing again on Sunday!!!'
    message = 'Hi,\r\n\nYou are removed from Sunday absents list by ' + current_user.firstname + ' ' + \
              current_user.lastname + '. From this point onwards you are assumed to be playing on Sundays ' + \
              'and you are charged for Sunday games. If you can\'t play in future please ' + \
              'register your absense using the badminton app.\r\n\n' + 'If you have any issues please contact ' + \
              super_user.firstname + ' ' + super_user.lastname + ' at: ' + super_user.email + \
              '\r\n\nThanks\r\nSydney Badminton Group'
    SendGrid.send_email(user.email, "no-reply@sendgrid.me", subject, message)

    return "Success"


@api.route('/api/updateCourtsCost')
@login_required
def update_courts_cost():
    if not current_user.isSuperUser:
        abort(401)

    cost = request.args.get('cost')
    day = request.args.get('day')

    if (cost <= 0) or (day != "Saturday" and day != "Sunday"):
        abort(400)

    courts_cost = CourtsCost.query.filter_by(day=day).first()

    if not courts_cost:
        abort(404)

    courts_cost.cost = cost
    db.session.commit()

    """Insert a log"""
    description = 'Courts cost for ' + day + ' is updated to $' + str(cost)
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()
    return "Success"


@api.route('/api/runShuttlesExpense')
@login_required
def run_shuttle_expense():
    if not current_user.isSuperUser:
        abort(401)

    cost = float(request.args.get('cost'))

    if cost <= 0:
        abort(400)

    active_users = User.query.filter(or_(User.isSaturdayAbsent == False, User.isSundayAbsent == False))\
        .order_by(User.firstname.asc())

    if not active_users or active_users.count() < 1:
        abort(404)

    shuttle_cost_per_player = float("{0:.2f}".format(float(cost) / float(active_users.count())))

    """Add expense entry"""
    expenseEntry = Expense(cost, shuttle_cost_per_player, "Deduction_Shuttles", active_users.count())
    db.session.add(expenseEntry)
    db.session.commit()

    """Insert a log"""
    description = 'Shuttle expense for $' + str(cost) + ' is run'
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    bodyText = 'Hi everyone,\r\n\nA total of $' + str(cost) + ' is charged for shuttles and it is charged ' + \
               'equally among ' + str(active_users.count()) + ' active players.' + \
               '\r\n\nBalances of players are as follows after deduction:\r\n\n'

    email_ids = []
    for user in active_users:
        user.balance = float("{0:.2f}".format(user.balance - shuttle_cost_per_player))
        db.session.commit()

        transaction = Transaction(user.email, shuttle_cost_per_player, user.balance, "Deduct_Shuttle")
        db.session.add(transaction)
        db.session.commit()

        email_ids.append(user.email)
        bodyText += user.firstname + ' ' + user.lastname + ' : ' + '$' + str(user.balance) + '\r\n'

    bodyText += '\nThanks\r\nSydney Badminton Group'
    SendGrid.send_email(email_ids, "no-reply@sendgrid.me",
                        "Badminton: Balances after Shuttles expenses", bodyText)

    return "Success"

@api.route('/api/runSundayExpense')
@login_required
def run_sunday_expense():
    if not current_user.isSuperUser:
        abort(401)

    run_expense("Sunday")
    return "Success"

@api.route('/api/getGroupOwners')
@login_required
def get_group_owners():
    if not current_user.isSuperUser:
        abort(401)

    group_owners = User.query.filter_by(isGroupOwner=True).order_by(User.firstname.asc())
    schema = UserShortSchema(many=True)
    json_result = schema.dumps(group_owners)
    return json_result.data


@api.route('/api/getAllUsers')
@login_required
def get_all_users():
    if not current_user.isSuperUser:
        abort(401)

    users = User.query.filter(User.email != current_user.email).order_by(User.firstname.asc())
    schema = UserShortSchema(many=True)
    json_result = schema.dumps(users)
    return json_result.data


@api.route('/api/changeSuperUser')
@login_required
def change_super_user():
    if not current_user.isSuperUser:
        abort(401)

    email = request.args.get('email')
    user = User.query.get(email)
    if not user:
        abort(404)

    """Make the current user not a super user"""
    current_user.isSuperUser = False

    """Make the selected user as new super user"""
    user.isGroupOwner = True
    user.isAdmin = True
    user.isSuperUser = True
    db.session.commit()

    """Insert a log"""
    description = 'Super user is changed to: ' + user.firstname + ' ' + user.lastname
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    return "Success"


@api.route('/api/topupGroup', methods=['POST'])
@login_required
def topup_group():
    if not current_user.isSuperUser:
        abort(401)

    email = request.json['email']
    amount = float(request.json['amount'])

    if amount <= 0:
        abort(400)

    group_owner = User.query.get(email)

    if not group_owner:
        abort(404)

    users = User.query.filter_by(group=group_owner.group)
    if not users or users.count() < 1:
        abort(404)

    """Insert a log"""
    description = 'Topup for $' + str(amount) + ' is run for user group - ' + str(group_owner.group)
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    topupAmount = float("{0:.2f}".format(amount / float(users.count())))
    bodyText = 'Hi everyone,\r\n\nYour group is topped up with $' + str(topupAmount) + '.' +\
               '\r\n\nAfter this top up, balances of your group members are as follows :\r\n\n'
    email_ids = []
    email_ids.append(current_user.email)
    for user in users:
        user.balance = float("{0:.2f}".format(user.balance + topupAmount))
        db.session.commit()

        transaction = Transaction(user.email, topupAmount, user.balance, "Top_Up")
        db.session.add(transaction)
        db.session.commit()

        email_ids.append(user.email)
        bodyText += user.firstname + ' ' + user.lastname + ' : ' + '$' + str(user.balance) + '\r\n'

    bodyText += '\nThanks\r\nSydney Badminton Group'
    SendGrid.send_email(email_ids, "no-reply@sendgrid.me",
                        "Badminton: Balances after top up", bodyText)

    return "Success"

@api.route('/api/makeSomeoneSundayAbsent', methods=['POST'])
@login_required
def make_someone_sunday_absent():
    if not current_user.isSuperUser:
        abort(401)

    email = request.json['email']
    numberOfWeeks = int(request.json['numberOfWeeks'])

    if numberOfWeeks <= 0:
        abort(400)

    user = User.query.get(email)

    if not user:
        abort(404)

    """Insert a log"""
    description = 'User, ' + user.firstname + ' ' + user.lastname + ' (' + user.email + ') has been marked absent on Sundays by Admin for ' + str(numberOfWeeks) + ' weeks'
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()

    user.futureSundayAbsentWeeks = 0
    user.isSundayAbsent = True
    user.sundayAbsentWeeks = numberOfWeeks
    db.session.commit()

    return "Success"

@api.route('/api/sendPaymentNotificationToSuperUser')
@login_required
def send_payment_notification_to_super_user():
    amount = request.args.get('amount')

    if amount < 0:
        abort(400)

    super_user = User.query.filter_by(isSuperUser=True).first()

    if not super_user:
        abort(404)

    SendGrid.send_email(super_user.email, "no-reply@sendgrid.me",
                        current_user.firstname + " " + current_user.lastname + " has made $" + amount + " payment",
                        current_user.firstname + " " + current_user.lastname + " has made $" + amount + " payment")
    return "Success"


@api.route('/api/forgotpassword')
def forgot_password():
    email = request.args.get('email')

    user = User.query.get(email)

    if not user:
        abort(404)

    forgot_password_token = uuid.uuid1()
    user.forgotPasswordToken = str(forgot_password_token)
    db.session.commit()

    subject = "Badminton: password reset request"
    message = "You're receiving this email because you requested a password reset for the user " + user.firstname + \
              " " + user.lastname + ".\r\n\nPlease click the following link to reset the password,\r\n\n" + \
              str(request.url_root) + "resetPassword?token=" + user.forgotPasswordToken + \
              '\r\n\nThanks\r\nSydney Badminton Group'
    SendGrid.send_email(user.email, "no-reply@sendgrid.me", subject, message)
    return "Success"

@api.route('/resetPassword', methods = ['GET', 'POST'])
def reset_password():
    form = ResetPasswordForm()

    if request.method == 'GET':
        forgot_password_token = request.args.get('token')
        user = User.query.filter(User.forgotPasswordToken == forgot_password_token).first()
        if not user:
            abort(404)

        return render_template('reset_password.html', form=form, token=user.forgotPasswordToken)

    if request.method == 'POST':
        if form.validate_on_submit():
            if form.password.data != form.retype_password.data:
                flash("Entered passwords did not match")

            user = User.query.filter(User.forgotPasswordToken == request.form.get('token').strip()).first()
            if user:
                user.set_password(form.retype_password.data)
                user.forgotPasswordToken = ""
                db.session.commit()
                return redirect(url_for("api.home"))
            else:
                abort(404)

    abort(405)


@api.route('/api/createANewUser')
@login_required
def create_a_new_user():
    if not current_user.isSuperUser:
        abort(401)

    firstname = request.args.get('firstname')
    lastname = request.args.get('lastname')
    email = request.args.get('email')
    balance = request.args.get('balance')
    saturday_absent_weeks = request.args.get('saturdayAbsentWeeks')
    sunday_absent_weeks = request.args.get('sundayAbsentWeeks')
    is_admin = bool(json.loads(request.args.get('isAdmin')))

    user = User.query.get(email)
    if user:
        abort(409)

    users = User.query.order_by(User.group.desc()).all()
    group = users[0].group + 1

    user = User(firstname, lastname, email, email+str(balance), balance, group, True, is_admin,
                saturday_absent_weeks, 0, sunday_absent_weeks, 0)
    user.forgotPasswordToken = str(uuid.uuid1())
    db.session.add(user)
    db.session.commit()

    email_ids = [current_user.email, email]
    subject = 'Badminton: Your account is provisioned'
    message = 'Hi ' + firstname + ',\r\n\nGood news! Your account has been provisioned. Please click the below ' + \
              'link to set your password.\r\n\n' + str(request.url_root) + "resetPassword?token=" + \
              user.forgotPasswordToken + '\r\n\nAfter setting the password please click the below link to ' + \
              'access your account. Please bookmark this link.\r\n\n' + str(request.url_root) + \
              '\r\n\nThanks\r\nSydney Badminton Group'
    SendGrid.send_email(email_ids, "no-reply@sendgrid.me", subject, message)

    """Insert a log"""
    description = 'A new user account is created for ' + user.firstname + ' ' + user.lastname
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()
    return "Success"


@api.route('/api/deleteAUser')
@login_required
def delete_a_user():
    if not current_user.isSuperUser:
        abort(401)

    email = request.args.get('email')
    user = User.query.get(email)
    if not user:
        abort(404)

    db.session.delete(user)
    db.session.commit()

    email_ids = [current_user.email, email]
    subject = 'Badminton: Your account has been deleted'
    message = 'Hi ' + user.firstname + ',\r\n\nAs requested, your account has been deleted from badminton group.' + \
              '\r\n\nThanks\r\nSydney Badminton Group'
    SendGrid.send_email(email_ids, "no-reply@sendgrid.me", subject, message)

    """Insert a log"""
    description = 'User account for ' + user.firstname + ' ' + user.lastname + ' has been deleted.'
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()
    return "Success"


@api.route('/api/sendAnEmail', methods=['POST'])
@login_required
def send_an_email():
    if not current_user.isSuperUser:
        abort(401)

    subject = request.json['subject']
    message = request.json['message']

    users = User.query.order_by(User.firstname.asc()).all()

    email_ids = []
    for user in users:
        email_ids.append(user.email)

    SendGrid.send_email(email_ids, "no-reply@sendgrid.me", subject, message)

    """Insert a log"""
    description = 'An email is sent to everyone with subject: ' + subject
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()
    return "Success"


@api.route('/api/adhocCharge', methods=['POST'])
@login_required
def adhoc_charge():
    if not current_user.isSuperUser:
        abort(401)

    amount = request.json['amount']
    subject = request.json['subject']
    message = request.json['message']

    users = User.query.order_by(User.firstname.asc()).all()
    cost_per_player = float("{0:.2f}".format(float(amount) / float(len(users))))

    """Add expense entry"""
    expense_entry = Expense(amount, cost_per_player, "Deduction_AdHoc", len(users))
    db.session.add(expense_entry)
    db.session.commit()

    email_ids = []
    for user in users:
        email_ids.append(user.email)
        user.balance = float("{0:.2f}".format(user.balance - cost_per_player))

        transaction = Transaction(user.email, cost_per_player, user.balance, "Deduct_AdHoc")
        db.session.add(transaction)
        db.session.commit()

    SendGrid.send_email(email_ids, "no-reply@sendgrid.me", subject, message)

    """Insert a log"""
    description = 'An AdHoc amount of $' + str(amount) + ' is charged for reason: ' + subject
    log = Log(current_user.email, description)
    db.session.add(log)
    db.session.commit()
    return "Success"


@api.route('/api/logout')
@login_required
def logout():
    user = current_user
    user.isAuthenticated = False
    db.session.add(user)
    db.session.commit()
    logout_user()
    return "Success"
