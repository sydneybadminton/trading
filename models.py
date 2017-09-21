from passlib.apps import custom_app_context as pwd_context
from marshmallow import Schema, fields
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    __public__ = ['rowid', 'firstname', 'lastname', 'email']
    firstname = db.Column(db.String(100))
    lastname = db.Column(db.String(100))
    email = db.Column(db.String(100), primary_key=True, unique=True)
    password = db.Column(db.String)
    isAuthenticated = db.Column(db.Boolean, default = False)
    balance = db.Column(db.Float, default=0.0)
    group = db.Column(db.Integer)
    isGroupOwner = db.Column(db.Boolean, default = False)
    isAdmin = db.Column(db.Boolean, default = False)
    isSuperUser = db.Column(db.Boolean, default = False)
    isSaturdayAbsent = db.Column(db.Boolean, default = False)
    saturdayAbsentWeeks = db.Column(db.Integer, default = 0)
    futureSaturdayAbsentWeeks = db.Column(db.Integer, default = 0)
    isSundayAbsent = db.Column(db.Boolean, default = False)
    sundayAbsentWeeks = db.Column(db.Integer, default = 0)
    futureSundayAbsentWeeks = db.Column(db.Integer, default = 0)
    forgotPasswordToken = db.Column(db.String)
    createdAt = db.Column(db.DateTime,  default=db.func.current_timestamp())
    updatedAt = db.Column(db.DateTime,  default=db.func.current_timestamp(),
                                           onupdate=db.func.current_timestamp())

    def __init__(self, firstname, lastname, email, password, balance, group, isGroupOwner, isAdmin,
                 saturdayAbsentWeeks, futureSaturdayAbsentWeeks,
                 sundayAbsentWeeks, futureSundayAbsentWeeks,
                 createdAt=db.func.current_timestamp(), updatedAt=db.func.current_timestamp()):
        self.firstname = str(firstname)
        self.lastname = str(lastname)
        self.email = str(email)
        self.password = pwd_context.encrypt(password)
        self.balance = float(balance)
        self.group = int(group)
        self.isGroupOwner = bool(isGroupOwner)
        self.isAdmin = bool(isAdmin)

        self.saturdayAbsentWeeks = (int(saturdayAbsentWeeks), int(0))[int(saturdayAbsentWeeks) <= int(0)]
        if int(self.saturdayAbsentWeeks) > int(0):
            self.isSaturdayAbsent = True
        else:
            self.isSaturdayAbsent = False
        if self.isSaturdayAbsent:
            self.futureSaturdayAbsentWeeks = int(0)
        else:
            self.futureSaturdayAbsentWeeks = (int(futureSaturdayAbsentWeeks), int(0))[int(futureSaturdayAbsentWeeks) <= int(0)]

        self.sundayAbsentWeeks = (int(sundayAbsentWeeks), int(0))[int(sundayAbsentWeeks) <= int(0)]
        if int(self.sundayAbsentWeeks) > int(0):
            self.isSundayAbsent = True
        else:
            self.isSundayAbsent = False
        if self.isSundayAbsent:
            self.futureSundayAbsentWeeks = int(0)
        else:
            self.futureSundayAbsentWeeks = (int(futureSundayAbsentWeeks), int(0))[int(futureSundayAbsentWeeks) <= int(0)]

        self.createdAt = createdAt
        self.updatedAt = updatedAt

    def verify_password(self, password):
        return pwd_context.verify(password, self.password)

    def is_active(self):
        return True

    def get_id(self):
        return self.email

    def is_authenticated(self):
        return self.isAuthenticated

    def set_password(self, password):
        self.password = pwd_context.encrypt(password)

class UserSchema(Schema):
    rowid = fields.Int()
    firstname = fields.Str()
    lastname = fields.Str()
    email = fields.Email()
    balance = fields.Float()
    group = fields.Int()
    isGroupOwner = fields.Boolean()
    isAdmin = fields.Boolean()
    isSuperUser = fields.Boolean()
    isSaturdayAbsent = fields.Boolean()
    saturdayAbsentWeeks = fields.Int()
    futureSaturdayAbsentWeeks = fields.Int()
    isSundayAbsent = fields.Boolean()
    sundayAbsentWeeks = fields.Int()
    futureSundayAbsentWeeks = fields.Int()
    created_at = fields.DateTime()
    updatedAt = fields.DateTime()

class UserShortSchema(Schema):
    rowid = fields.Int()
    firstname = fields.Str()
    lastname = fields.Str()
    email = fields.Email()
    created_at = fields.DateTime()

class Parent(db.Model):
    __abstract__  = True
    id         = db.Column(db.Integer, primary_key=True)
    createdAt  = db.Column(db.DateTime,  default=db.func.current_timestamp())
    updatedAt = db.Column(db.DateTime,  default=db.func.current_timestamp(),
                                           onupdate=db.func.current_timestamp())

class Transaction(Parent):
    __tablename__ = 'transaction'
    email = db.Column(db.String(100))
    amount = db.Column(db.Float)
    balance = db.Column(db.Float)
    type = db.Column(db.String)
    date = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __init__(self, email, amount, balance, type, date=db.func.current_timestamp(),
                 createdAt=db.func.current_timestamp(), updatedAt=db.func.current_timestamp()):
        self.email = email
        self.amount = amount
        self.balance = balance
        self.type = type
        self.date = date
        self.createdAt = createdAt
        self.updatedAt = updatedAt

class TransactionSchema(Schema):
    email = fields.Email()
    amount = fields.Float()
    balance = fields.Float()
    type = fields.Str()
    date = fields.DateTime()

class CourtsCost(Parent):
    __tablename__ = 'courtsCost'
    cost = db.Column(db.Float, unique=True)
    day = db.Column(db.String)

    def __init__(self, cost, day, createdAt=db.func.current_timestamp(), updatedAt=db.func.current_timestamp()):
        self.cost = cost
        self.day = day
        self.createdAt = createdAt
        self.updatedAt = updatedAt

class Expense(Parent):
    __tablename__ = 'expense'
    cost = db.Column(db.Float)
    costPerPerson = db.Column(db.Float)
    description = db.Column(db.String)
    numberOfPlayers = db.Column(db.Integer)

    def __init__(self, cost, costPerPerson, description, numberOfPlayers,
                 createdAt=db.func.current_timestamp(), updatedAt=db.func.current_timestamp()):
        self.cost = cost
        self.costPerPerson = costPerPerson
        self.description = description
        self.numberOfPlayers = numberOfPlayers
        self.createdAt = createdAt
        self.updatedAt = updatedAt

class Log(Parent):
    __tablename__ = 'log'
    email = db.Column(db.String(100))
    description = db.Column(db.String)

    def __init__(self, email, description, createdAt=db.func.current_timestamp(), updatedAt=db.func.current_timestamp()):
        self.email = email
        self.description = description
        self.createdAt = createdAt
        self.updatedAt = updatedAt
