from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from .serializers import UserSerializer, RegisterSerializer, CookProfileSerializer
from .models import CookProfile
from orders.models import Review
from orders.serializers import ReviewSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import EmailOrUsernameTokenObtainPairSerializer

User = get_user_model()

class EmailOrUsernameLoginView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BecomeCookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_cook:
            return Response({"detail": "Already a cook"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_cook = True
        user.save()
        CookProfile.objects.get_or_create(user=user)
        return Response({"detail": "You are now a cook!", "redirect": "/cook-setup"}, status=status.HTTP_201_CREATED)

class UnenrollCookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from orders.models import Order
        from listings.models import Listing

        user = request.user
        if not user.is_cook:
            return Response(
                {"detail": "You are not a cook."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Block if there are any active orders on this cook's listings.
        # "Active" = not yet completed and not cancelled.
        active_statuses = ['pending', 'accepted', 'preparing', 'ready']
        active_orders = Order.objects.filter(
            listing__cook=user,
            status__in=active_statuses,
        )

        if active_orders.exists():
            return Response(
                {
                    "detail": (
                        f"You have {active_orders.count()} active order(s). "
                        "Please fulfill or cancel them before unenrolling."
                    ),
                    "active_order_count": active_orders.count(),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Soft delete: mark all this cook's listings as unavailable.
        # Order history stays intact because we don't touch the listings.
        Listing.objects.filter(cook=user).update(available=False)

        # Flip cook flag off. We keep the CookProfile row so if they
        # re-enroll later, their bio/specialties/etc are still there.
        user.is_cook = False
        user.save()

        return Response(
            {"detail": "You have unenrolled as a cook. Your listings have been hidden."},
            status=status.HTTP_200_OK,
        )
    
    
class CookPublicProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, pk=None):
        from rest_framework.response import Response
        from rest_framework import status
        try:
            cook = User.objects.get(pk=pk, is_cook=True)
        except User.DoesNotExist:
            return Response({"detail": "Cook not found"}, status=status.HTTP_404_NOT_FOUND)

        cook_profile = getattr(cook, 'cook_profile', None)
        listings = cook.listings.filter(available=True).values(
            'id', 'title', 'price', 'image', 'cuisine_type', 'prep_time'
        )
        reviews = Review.objects.filter(
            order__listing__cook=cook
        ).select_related('reviewer').order_by('-created_at')

        review_data = ReviewSerializer(reviews, many=True).data

        return Response({
            'id': cook.id,
            'username': cook.username,
            'first_name': cook.first_name,
            'last_name': cook.last_name,
            'profile_image': request.build_absolute_uri(cook.profile_image.url) if cook.profile_image else None,
            'bio': cook_profile.bio if cook_profile else '',
            'kitchen_description': cook_profile.kitchen_description if cook_profile else '',
            'rating': float(cook_profile.rating) if cook_profile else 0,
            'is_verified': cook_profile.is_verified if cook_profile else False,
            'listings': list(listings),
            'reviews': review_data,
            'total_reviews': len(review_data),
        })
class CookProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CookProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        profile, created = CookProfile.objects.get_or_create(user=self.request.user)
        return profile


class PublicCookProfileView(generics.RetrieveAPIView):
    """Public view of a cook's profile"""
    serializer_class = CookProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        username = self.kwargs.get('username')
        user = get_object_or_404(User, username=username, is_cook=True)
        profile, created = CookProfile.objects.get_or_create(user=user)
        return profile


class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response({"detail": "Token required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
            
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': name.split()[0] if name else '',
                    'last_name': ' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
                }
            )
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
            })
            
        except ValueError as e:
            return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        
class CookReviewsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, username):
        from orders.models import Review
        from orders.serializers import ReviewSerializer
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "Cook not found"}, status=status.HTTP_404_NOT_FOUND)
        
        reviews = Review.objects.filter(
            order__listing__cook=user
        ).select_related('order', 'reviewer', 'order__listing').order_by('-created_at')
        
        # Custom serialization to include more info
        data = []
        for review in reviews:
            data.append({
                'id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'reviewer_name': review.reviewer.username,
                'listing_title': review.order.listing.title,
                'created_at': review.created_at,
            })
        
        return Response(data)