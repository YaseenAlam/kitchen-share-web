from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, MeView, BecomeCookView, GoogleLoginView,
    CookProfileView, PublicCookProfileView, CookReviewsView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('become-cook/', BecomeCookView.as_view(), name='become-cook'),
    path('cook-profile/', CookProfileView.as_view(), name='cook-profile'),
    path('cook/<str:username>/', PublicCookProfileView.as_view(), name='public-cook-profile'),
    path('cook/<str:username>/reviews/', CookReviewsView.as_view(), name='cook-reviews'),
    path('google/', GoogleLoginView.as_view(), name='google-login'),
]