from flask import Flask, render_template, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    UserMixin,
    login_manager,
    login_user,
    LoginManager,
    login_required,
    logout_user,
)
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import Length, ValidationError, DataRequired
from flask_bcrypt import Bcrypt

# app instance
app = Flask(__name__)

# link app to db file
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# secret key to secure session
app.config["SECRET_KEY"] = "thisisasecretkey"

# db instance
db = SQLAlchemy(app)

# init bcrypt
bcrypt = Bcrypt(app)

# handle flask log-in, load user, etc
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


# load user callback
# reload the user object from the user id stored in session
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# create a User table with three columns :
# the identity for the user
# the user's name with 20 chars max and non-empty field
# the password with 80 chars max once hashed and non-empty field
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)


# build our db with tables
with app.app_context():
    db.create_all()


# registration form
class RegisterForm(FlaskForm):
    # username -> show chars
    # required field
    # between 4 & 20 chars
    username = StringField(
        "USERNAME", validators=[DataRequired(), Length(min=4, max=20)]
    )
    # password -> hide chars
    # required field
    # between 8 & 20 chars
    password = PasswordField(
        "Password", validators=[DataRequired(), Length(min=8, max=20)]
    )
    # submit form btn
    submit = SubmitField("SUBMIT")

    # each user need to be different, as in our db
    def validate_username(self, username):
        # query our db table by the username
        existing_user_username = User.query.filter_by(username=username.data).first()
        # check for similar username
        # if one exist, raise error & suggestion
        if existing_user_username:
            raise ValidationError("User already exists! Log in ?")


# login form
# login using a username & password
class LoginForm(FlaskForm):
    username = StringField(
        "USERNAME", validators=[DataRequired(), Length(min=4, max=20)]
    )
    password = PasswordField(
        "Password", validators=[DataRequired(), Length(min=8, max=20)]
    )
    submit = SubmitField("SUBMIT")


# route to home page
@app.route("/")
def home():
    return render_template("home.html")


# route to login page
@app.route("/login", methods=["GET", "POST"])
def login():
    # create a LoginForm
    form = LoginForm()
    # on submit
    if form.validate_on_submit():
        # check if user exists in db
        user = User.query.filter_by(username=form.username.data).first()
        # if registered, check for password
        if user:
            # compare password in db to the one entered in form
            if bcrypt.check_password_hash(user.password, form.password.data):
                # if passwords then login and redirect
                login_user(user)
                return redirect(url_for("notes"))
    # pass form to html template
    return render_template("login.html", form=form)


# logout route
@app.route("/logout", methods=["GET", "POST"])
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))


# route to register page
@app.route("/register", methods=["GET", "POST"])
def register():
    # create a RegisterForm
    form = RegisterForm()
    # whenever we submit this form create a hashed version
    # of the password for a secure registration process
    if form.validate_on_submit():
        # hash the password
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        # create a new user with hashed password
        new_user = User(username=form.username.data, password=hashed_password)
        # add new user to db
        db.session.add(new_user)
        # commit changes
        db.session.commit()
        # redirect to login page
        return redirect(url_for("login"))
    # pass form to html template
    return render_template("register.html", form=form)


# route to notes page
# access only if logged in
@app.route("/notes", methods=["GET", "POST"])
@login_required
def notes():
    return render_template("notes.html")


# run the app
if __name__ == "__main__":
    app.run(debug=True)
