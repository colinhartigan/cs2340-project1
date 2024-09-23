from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Favorite(models.Model):
    placeid = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=None)
    def __str__(self):
        return f"{self.placeid} {self.user}"
        