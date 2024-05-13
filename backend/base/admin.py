from django.contrib import admin
from base.models import Category, Author, Book, Rating, Review, Profile, Update

# Register your models here.
admin.site.register(Category)
admin.site.register(Author)
admin.site.register(Book)
admin.site.register(Rating)
admin.site.register(Profile)
admin.site.register(Review)
admin.site.register(Update)