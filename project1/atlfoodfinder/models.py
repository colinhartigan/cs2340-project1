from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Favorite(models.Model):
    placeid = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=None)
    def __str__(self):
        return f"{self.placeid} {self.user}"
        
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    placeid = models.CharField(max_length=100)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review by {self.user.username} for {self.placeid}"