from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Favorite(models.Model):
    placeid = models.BigIntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=None)
        