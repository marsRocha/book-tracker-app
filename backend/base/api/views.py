from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import BookSerializer, ShelfBookSerializer, ProfileSerializer, UserRatingSerializer, CategorySerializer, ReviewSerializer, RatingSerializer, UserReviewSerializer, UpdateSerializer, MyBookSerializer, MyBooksProfileSerializer
from base.models import Book, Profile, User, Update, Category, Review, Rating

# My custom token view
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['id'] = user.id
        token['username'] = user.username
        token['firstname'] = user.first_name

        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['POST'])
def register(request):
    if request.method == "POST":
        firstname = request.data["firstname"]
        surname = request.data["surname"]
        email = request.data["email"]
        username = request.data["username"]

        # Ensure password matches confirmation
        password = request.data["password"]
        confirmation = request.data["password2"]
        if password != confirmation:
            return JsonResponse({'error': 'passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        # Attempt to create new user and their profile
        try:
            user = User.objects.create_user(username=username, email=email, password=password, first_name=firstname, last_name=surname)
            user.save()
            profile = Profile(user=user)
            profile.save()
            return JsonResponse({}, status=status.HTTP_200_OK)
        except:
            return JsonResponse({'error': 'error'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return JsonResponse({'error': 'error'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token',
        '/api/token/refresh',
    ]
    return Response(routes)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getProfile(request, username):
    user = User.objects.get(username=username)
    profile = Profile.objects.get(user=user)
    serializer = ProfileSerializer(profile, many=False)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyBooksProfile(request, username):
    user = User.objects.get(username=username)
    profile = Profile.objects.get(user=user)
    serializer = MyBooksProfileSerializer(profile, many=False)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserRatings(request, username):
    user = User.objects.get(username=username)
    ratings = list(reversed(Rating.objects.filter(user=user)))
    serializer = UserRatingSerializer(ratings, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getBooks(request):
    books = Book.objects.all()
    serializer = BookSerializer(books, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getBook(request, book_id):
    book = Book.objects.get(pk=book_id)
    serializer = BookSerializer(book, many=False)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCategories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def shelfBook(request, book_id):
    profile = Profile.objects.get(user=request.user)
    book = Book.objects.get(pk=book_id)
    shelf = int(request.data['shelf'])

    try:

        if book in profile.want_read.all(): profile.want_read.remove(book)
        if book in profile.reading.all(): profile.reading.remove(book)
        if book in profile.read.all(): profile.read.remove(book)

        # add book to corresponding shelf and create an update for it
        if shelf == 1:
            profile.want_read.add(book)
            update = Update(user=request.user, content='wants to read', book=book)
            update.save()
        elif shelf == 2:
            profile.reading.add(book)
            update = Update(user=request.user, content='is currently reading', book=book)
            update.save()
        elif shelf == 3:
            profile.read.add(book)
            update = Update(user=request.user, content='has read', book=book)
            update.save()

        profile.save()
        return JsonResponse({'shelf': shelf}, status=status.HTTP_200_OK)
    except:
        return JsonResponse({'error': profile.reading[0].title}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getReviews(request, book_id):
    book = Book.objects.get(pk=book_id)
    reviews = book.get_reviews.all()
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addReview(request, book_id):
    book = Book.objects.get(pk=book_id)

    try:
        # create review
        review = Review( review=request.data["review"], user=request.user, book=book)
        review.save()

        # send review
        return JsonResponse({}, status=status.HTTP_200_OK)
    except:
        return JsonResponse({'error': 'error'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserReviews(request, username):
    user = User.objects.get(username=username)
    reviews = list(reversed(Review.objects.filter(user=user)))
    serializer = UserReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserUpdates(request, username):
    user = User.objects.get(username=username)
    updates = list(reversed(Update.objects.filter(user=user)))
    serializer = UpdateSerializer(updates, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def ratings(request, book_id):
    book = Book.objects.get(pk=book_id)

    try:
        if request.method == "POST":
            # check if a rating already exists
            if Rating.objects.filter(user=request.user, book=book).exists():
                rating = Rating.objects.get(user=request.user, book=book)
                # delete existing rating
                if rating.rating == int(request.data['rating']):
                    rating.delete()
                # update existing rating
                else:     	    
                    rating.rating = request.data['rating']
                    rating.save()
            else:
                # create a rating
                rating = Rating( rating=request.data["rating"], user=request.user, book=book)
                rating.save()
            return JsonResponse({}, status=status.HTTP_200_OK)
        
        elif request.method == "GET":
            ratings = book.get_ratings.all()
            serializer = RatingSerializer(ratings, many=True)
            return Response(serializer.data)
    except:
        return JsonResponse({'error': 'error'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search(request):
    query = request.data['query']
    books = Book.objects.all()

    filteredBooks = []
    for book in books:
        if query.lower() in book.title.lower():
            filteredBooks.append(book)
        else:
            for author in book.authors.all():
                if query.lower() in author.name.lower():
                    filteredBooks.append(book)

    serializer = MyBookSerializer(filteredBooks, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def searchCategory(request, category_id):
    try:
        # get books by category
        category = Category(pk=category_id)
        books = category.books_in_category.all()
        serializer = MyBookSerializer(books, many=True)
        return Response(serializer.data)
    except:
        return JsonResponse({'error': 'error'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bookRecomendations(request):
    profile = Profile.objects.get(user=request.user)
    categories = Category.objects.all()

    recomendations = []
    for category in categories:
        books = category.get_by_main_category.all()

        for book in books:
            if book not in profile.read.all() and book not in profile.want_read.all() and book not in profile.reading.all() and book not in recomendations:
                recomendations.append(book)
                break

   
    serializer = ShelfBookSerializer(recomendations, many=True)
    return Response(serializer.data)