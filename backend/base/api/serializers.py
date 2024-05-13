from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from django.contrib.auth.password_validation import validate_password
from base.models import Category, Author, Book, Rating, Review, Profile, User, Update


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'username', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})
        return attrs


class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class AuthorSerializer(ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'


class BookSerializer(ModelSerializer):
    authors = AuthorSerializer(many=True)
    categories = CategorySerializer(many=True)

    class Meta:
        model = Book
        fields = '__all__'


# Used on Home and Profile page
class ShelfBookSerializer(ModelSerializer):
    authors = AuthorSerializer(many=True)
    mainCategory = CategorySerializer(many=False)
    shelf = serializers.SerializerMethodField('get_shelf')
    rating = serializers.SerializerMethodField('get_rating')

    class Meta:
        model = Book
        fields = '__all__'

    def get_shelf(self, book):
        return 0
    
    def get_rating(self, book):
        return 0


# Contains more info about the book
# Used on MyBooks and Discover page
class MyBookSerializer(ModelSerializer):
    authors = AuthorSerializer(many=True)
    mainCategory = CategorySerializer(many=False)
    shelf = serializers.SerializerMethodField('get_shelf')
    rating = serializers.SerializerMethodField('get_rating')
    ratingsCount = serializers.SerializerMethodField('get_ratings')
    year = serializers.SerializerMethodField('get_year')

    class Meta:
        model = Book
        fields = '__all__'

    def get_shelf(self, book):
        return 0
    
    def get_rating(self, book):
        ratings = book.get_ratings.all()

        if ratings.count() > 0:
            sum = 0
            for rating in ratings:
                sum = sum + rating.rating
            return sum/ratings.count()
        else:
            return 0
    
    def get_ratings(self, book):
        return book.get_ratings.all().count()
    
    def get_year(self, book):
        date = str(book.publish_date)
        return date[0:4]


class RatingSerializer(ModelSerializer):

    class Meta:
        model = Rating
        fields = '__all__'


# Used on user's profile page
class UserRatingSerializer(ModelSerializer):
    book = BookSerializer(many=False)

    class Meta:
        model = Rating
        fields = '__all__'


class ReviewSerializer(ModelSerializer):
    user = UserSerializer(many=False)

    class Meta:
        model = Review
        fields = '__all__'


# Review object serializer with more data about the reviewed book
# Used on user's profile
class UserReviewSerializer(ModelSerializer):
    book = BookSerializer(many=False)

    class Meta:
        model = Review
        fields = '__all__'


class UpdateSerializer(ModelSerializer):
    book = ShelfBookSerializer(many=False)

    class Meta:
        model = Update
        fields = '__all__'


class ProfileSerializer(ModelSerializer):
    user = UserSerializer(many=False)
    reading = ShelfBookSerializer(many=True)
    want_read = ShelfBookSerializer(many=True)
    read = ShelfBookSerializer(many=True)
    allBooks = serializers.SerializerMethodField('get_books')

    class Meta:
        model = Profile
        fields = '__all__'

    def get_books(self, profile):
        return profile.want_read.count() + profile.read.count() + profile.reading.count()


# Used on MyBooks and Discover page
class MyBooksProfileSerializer(ModelSerializer):
    user = UserSerializer(many=False)
    reading = MyBookSerializer(many=True)
    want_read = MyBookSerializer(many=True)
    read = MyBookSerializer(many=True)

    class Meta:
        model = Profile
        fields = '__all__'
