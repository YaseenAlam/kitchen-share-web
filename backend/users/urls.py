from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, MeView, BecomeCookView, GoogleLoginView,
    CookProfileView, PublicCookProfileView, CookReviewsView,
    EmailOrUsernameLoginView, UnenrollCookView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
path('login/', EmailOrUsernameLoginView.as_view(), name='login'),    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('become-cook/', BecomeCookView.as_view(), name='become-cook'),
    path('cook-profile/', CookProfileView.as_view(), name='cook-profile'),
    path('cook/<str:username>/', PublicCookProfileView.as_view(), name='public-cook-profile'),
    path('cook/<str:username>/reviews/', CookReviewsView.as_view(), name='cook-reviews'),
    path('google/', GoogleLoginView.as_view(), name='google-login'),
    path('unenroll-cook/', UnenrollCookView.as_view(), name='unenroll-cook'),
]