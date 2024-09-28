from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.site_login, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("details/<str:placeid>/", views.rdetails, name="place"),
    path("password-reset", views.password_reset, name="password_reset"),
    path("submit-review/<str:placeid>/", views.submit_review, name="submit_review")
]
