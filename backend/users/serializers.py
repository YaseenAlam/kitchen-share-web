from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CookProfile

User = get_user_model()


class CookProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    profile_image = serializers.ImageField(source='user.profile_image', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = CookProfile
        fields = [
            'id', 'username', 'email', 'profile_image', 'first_name', 'last_name',
            'bio', 'years_experience', 'cuisine_specialties', 'signature_dishes',
            'kitchen_description', 'food_safety_certified', 'certified_details',
            'accepted_payments', 'payment_notes', 'available_days', 'pickup_instructions',
            'is_verified', 'rating', 'total_orders', 'created_at'
        ]
        read_only_fields = ['id', 'is_verified', 'rating', 'total_orders', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    cook_profile = CookProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'is_cook', 'phone', 'address', 
            'profile_image', 'latitude', 'longitude', 'first_name', 'last_name',
            'cook_profile'
        ]
        read_only_fields = ['id', 'is_cook']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user
    
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allows users to log in with either their username OR email address.
    The frontend still sends the value in the 'username' field, but we 
    check email too if no username match is found.
    """

    def validate(self, attrs):
        login_value = attrs.get('username', '').strip()
        password = attrs.get('password')

        # Try to find user by username first, then fall back to email
        user = None
        if '@' in login_value:
            # Looks like an email — try email lookup
            try:
                user_obj = User.objects.get(email__iexact=login_value)
                user = authenticate(
                    request=self.context.get('request'),
                    username=user_obj.username,
                    password=password,
                )
            except User.DoesNotExist:
                user = None
        else:
            # Treat as username
            user = authenticate(
                request=self.context.get('request'),
                username=login_value,
                password=password,
            )

        if user is None:
            raise serializers.ValidationError({
                'detail': 'No active account found with the given credentials'
            })

        # Build the token pair using the standard SimpleJWT method
        refresh = self.get_token(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }