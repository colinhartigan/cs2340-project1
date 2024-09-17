from django.shortcuts import render, redirect
from django.conf import settings


from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from .models import Favorite
from django.contrib.auth import authenticate, login, logout
from django.views import generic
from django.contrib.auth.hashers import make_password


# Create your views here.


def index(request):
    if request.user.is_authenticated:
        print(request.user.favorite_set.all())
        return render(request, "index.html", {"user": request.user})
    else:
        return redirect(f"{settings.LOGIN_URL}?next={request.path}")

def logout_view(request):
    logout(request)
    return redirect(f"{settings.LOGIN_URL}?next=/atlfoodfinder/")

def site_login(request):
    # variables that get passed to the html
    if request.user.is_authenticated:
        return redirect(f"/atlfoodfinder")
    submitted = False
    user_taken = False
    # it will only enter this if loop if the function is running on a form submit
    if request.method == 'POST':
        submitted = True
        
        # get email, password, and whether it is a register or sign in
        username = request.POST.get("email-input")
        password = request.POST.get("password-input")
        
        action = request.POST.get('action')
        
        # make sure they actually submitted something
        if username is not None and password is not None:
            # if it is a sign in, authenticate
            if action == 'sign-in':
                user = authenticate(request, username=username, password=password)
                if user is not None:
                    login(request, user)
                    return redirect("/atlfoodfinder")
            # this is if it is a register, I couldn't figure out how to maintain the order of the buttons
            # while making it so that hitting enter was a sign in and not a registration
            else:
                # makes sure that the user registering isn't a duplicate
                user_taken = check_user_exists(username)
                if not user_taken:
                # if user is not a duplicate, create a new user, log in, and redirect to the main page
                    newuser = User.objects.create_user(username, password)
                    newuser.save()
                    
                    user = authenticate(request, username=username, password=password)
                    if user is not None:
                        login(request, user)
                        return redirect("/atlfoodfinder")
    return render(request, "auth.html", {"submitted": submitted, "user_taken": user_taken})

def rdetails(request, placeid):
    print(f"Displaying page with place {placeid}")
    return render(request, "detail.html", {"placeid": placeid})

# loops through saved users to see if a username is already taken
def check_user_exists(username):
    Usermodel = get_user_model()
    users = Usermodel.objects.all()
    for one_user in users:
        if one_user.email == username:
            return True
    return False

#allows user to reset their password
def password_reset(request):
    submitted = False
    email_invalid = False
    same_as_old_password = False

    if request.method == 'POST':
        submitted = True
        email = request.POST.get("email-input")
        new_password = request.POST.get("password-input")

        # Checks if the email exists in the system
        user = User.objects.filter(email=email).first()
        if user:
            # Check if the new password matches the old one
            if user.check_password(new_password):
                same_as_old_password = True
            else:
                # Set the new password and save the user
                user.set_password(new_password)
                user.save()
                return redirect("/login")
        else:
            # If the email was never registered, show an error
            email_invalid = True

    return render(request, "password_reset.html", {
        "submitted": submitted, 
        "email_invalid": email_invalid, 
        "same_as_old_password": same_as_old_password
    })