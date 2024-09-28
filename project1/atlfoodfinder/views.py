from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.models import User
from django.shortcuts import redirect, render

from .models import Favorite
import json

from .models import Review

from django.contrib import messages 

# Create your views here.


def index(request):
    if request.user.is_authenticated:
        return render(
            request,
            "index.html",
            {
                "user": request.user, "favorites": json.dumps(get_favorite_set(request.user))
            },
        )
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
    if request.method == "POST":
        submitted = True

        # get email, password, and whether it is a register or sign in
        username = request.POST.get("email-input")
        password = request.POST.get("password-input")

        action = request.POST.get("action")

        # make sure they actually submitted something
        if username is not None and password is not None:
            # if it is a sign in, authenticate
            if action == "sign-in":
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
    return render(
        request, "auth.html", {"submitted": submitted, "user_taken": user_taken}
    )


def rdetails(request, placeid):
    if request.user.is_authenticated:
        print(f"Displaying page with place {placeid}")
        is_favorite = False
        for f in request.user.favorite_set.all():
            if f.placeid == placeid:
                is_favorite = True

        if request.method == "POST":
            if is_favorite:
                is_favorite = False
                delete_favorite(request.user, placeid)
            else:
                is_favorite = True
                add_favorite(request.user, placeid)

        return render(
            request, "detail.html", {"placeid": placeid, "favorite": is_favorite}
        )
    else:
        return redirect(f"{settings.LOGIN_URL}?next={request.path}")


# loops through saved users to see if a username is already taken
def check_user_exists(username):
    Usermodel = get_user_model()
    users = Usermodel.objects.all()
    for one_user in users:
        if one_user.email == username:
            return True
    return False


# allows user to reset their password
def password_reset(request):
    submitted = False
    email_invalid = False
    same_as_old_password = False

    if request.method == "POST":
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

    return render(
        request,
        "password_reset.html",
        {
            "submitted": submitted,
            "email_invalid": email_invalid,
            "same_as_old_password": same_as_old_password,
        },
    )


def add_favorite(user: User, place_id):
    user.favorite_set.create(placeid=place_id)


def clear_favorites(user):
    user.favorite_set.all().delete()


def get_favorite_set(user):
    output = [f.placeid for f in user.favorite_set.all()]
    return output


def delete_favorite(user, placeid):
    user.favorite_set.filter(placeid=placeid).delete()

def submit_review(request, placeid):
    if request.method == "POST" and request.user.is_authenticated:
        rating = int(request.POST.get("rating"))
        comment = request.POST.get("comment")

        # Save the review
        review = Review.objects.create(
            user=request.user,
            placeid=placeid,
            rating=rating,
            comment=comment
        )
        review.save()
        
        return redirect(f"/details/{placeid}")

    return redirect(f"{settings.LOGIN_URL}?next={request.path}")

def rdetails(request, placeid):
    if request.user.is_authenticated:
        is_favorite = request.user.favorite_set.filter(placeid=placeid).exists()
        reviews = Review.objects.filter(placeid=placeid)

        if request.method == "POST":
            if is_favorite:
                delete_favorite(request.user, placeid)
            else:
                add_favorite(request.user, placeid)
            is_favorite = not is_favorite

        return render(
            request, 
            "detail.html", 
            {"placeid": placeid, "favorite": is_favorite, "reviews": reviews}
        )
    else:
        return redirect(f"{settings.LOGIN_URL}?next={request.path}")
