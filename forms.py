from flask_wtf import Form
from wtforms import PasswordField, HiddenField
from wtforms.validators import DataRequired


class ResetPasswordForm(Form):
    password = PasswordField('Password', validators=[DataRequired()])
    retype_password = PasswordField('Retype Password', validators=[DataRequired()])
    email = HiddenField()
