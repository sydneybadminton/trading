from flask.ext.login import AnonymousUserMixin
from flask.ext.login import LoginManager
from flask import Flask
from controllers import api
from models import db, User

app = Flask(__name__)
app.config.from_pyfile('badminton.cfg')
app.register_blueprint(api)

"""Initialize db"""
db.init_app(app)

class Anonymous(AnonymousUserMixin):
  def __init__(self):
    self.isAuthenticated = False

login_manager = LoginManager()
login_manager.anonymous_user = Anonymous
login_manager.init_app(app)

@login_manager.user_loader
def user_loader(user_id):
    return User.query.get(user_id)

if __name__ == '__main__':
    app.run()
