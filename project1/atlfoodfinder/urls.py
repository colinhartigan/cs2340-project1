from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.site_login, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("details/<int:placeid>/", views.PlaceView.as_view(), name="place")
]
