from django.utils import timezone
from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Category(models.Model):
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class Author(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"\"{self.name}\""

class Book(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    mainCategory = models.ForeignKey(Category, null=True, blank=True, on_delete=models.PROTECT, related_name='get_by_main_category')
    categories = models.ManyToManyField(Category, default=None, blank=True, related_name="books_in_category")
    authors = models.ManyToManyField(Author, related_name="books_written")
    image = models.URLField(blank=True, null=True)
    publisher = models.CharField(max_length=255)
    publish_date = models.DateField()
    pageCount = models.IntegerField()
    language = models.CharField(max_length=255)

    def __str__(self):
        return f"\"{self.title}\" by {self.authors.all()}"


class Rating(models.Model):
    rating = models.IntegerField(default=0)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="get_ratings")
    date_published = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"\"{self.user.username}\" rated \"{self.book.title}\" with {self.rating} stars"


class Review(models.Model):
    review = models.TextField()
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="get_reviews")
    date_published = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"\"{self.user.username}\" reviewed {self.book.title}"


class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    want_read = models.ManyToManyField(Book, blank=True, related_name="want_read")
    reading = models.ManyToManyField(Book, blank=True, related_name="reading")
    read = models.ManyToManyField(Book, blank=True, related_name="read")

    def __str__(self):
        return f"\"{self.user.username}\""


class Update(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    date_published = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"\"{self.user.username}\" {self.content} \"{self.book.title}\""
