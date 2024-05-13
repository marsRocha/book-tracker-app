from django.urls import path
from . import views
from .views import MyTokenObtainPairView

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('', views.getRoutes),

    path('books/', views.getBooks),
    path('book/<int:book_id>', views.getBook),
    path('shelf/<int:book_id>', views.shelfBook),

    path('ratings/<int:book_id>', views.ratings),

    path('reviews/<int:book_id>', views.getReviews),
    path('review/<int:book_id>', views.addReview),

    path('updates/<str:username>', views.getUserUpdates),

    path('categories/', views.getCategories),

    path('search/', views.search),
    path('searchCategory/<int:category_id>', views.searchCategory),
    path('bookRecomendations/', views.bookRecomendations),

    path('profile/<str:username>', views.getProfile),
    path('profile/<str:username>/books/', views.getMyBooksProfile),
    path('profile/<str:username>/ratings/', views.getUserRatings),
    path('profile/<str:username>/reviews/', views.getUserReviews),

    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('register/', views.register)
]