from rest_framework import serializers
from .models import Listing
import json


class ListingSerializer(serializers.ModelSerializer):
    cook_name = serializers.CharField(source='cook.username', read_only=True)
    cook_image = serializers.ImageField(source='cook.profile_image', read_only=True)
    cook_bio = serializers.SerializerMethodField()
    cook_rating = serializers.SerializerMethodField()
    cook_total_orders = serializers.SerializerMethodField()
    accepted_payments = serializers.SerializerMethodField()
    payment_notes = serializers.SerializerMethodField()
    pickup_instructions = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id', 'cook', 'cook_name', 'cook_image', 'cook_bio', 'cook_rating', 'cook_total_orders',
            'accepted_payments', 'payment_notes', 'pickup_instructions',
            'title', 'description', 'price', 'image', 'cuisine_type', 'dietary_tags', 'available',
            'prep_time', 'servings', 'latitude', 'longitude', 'distance',
            'ingredients', 'allergens', 'spice_level', 'calories',
            'customization_options', 'add_ons',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'cook', 'created_at', 'updated_at']

    def get_cook_bio(self, obj):
        if hasattr(obj.cook, 'cook_profile'):
            return obj.cook.cook_profile.bio
        return None

    def get_cook_rating(self, obj):
        if hasattr(obj.cook, 'cook_profile'):
            return obj.cook.cook_profile.rating
        return 0

    def get_cook_total_orders(self, obj):
        if hasattr(obj.cook, 'cook_profile'):
            return obj.cook.cook_profile.total_orders
        return 0

    def get_accepted_payments(self, obj):
        if hasattr(obj.cook, 'cook_profile'):
            return obj.cook.cook_profile.accepted_payments
        return []

    def get_payment_notes(self, obj):
        if hasattr(obj.cook, 'cook_profile'):
            return obj.cook.cook_profile.payment_notes
        return ''

    def get_pickup_instructions(self, obj):
        if hasattr(obj.cook, 'cook_profile'):
            return obj.cook.cook_profile.pickup_instructions
        return ''

    def get_distance(self, obj):
        request = self.context.get('request')
        if request and obj.latitude and obj.longitude:
            user_lat = request.query_params.get('lat')
            user_lng = request.query_params.get('lng')
            if user_lat and user_lng:
                from math import radians, sin, cos, sqrt, atan2
                
                lat1 = radians(float(user_lat))
                lat2 = radians(float(obj.latitude))
                lon1 = radians(float(user_lng))
                lon2 = radians(float(obj.longitude))
                
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                
                r = 3956
                distance = r * c
                return round(distance, 1)
        return None

    def to_internal_value(self, data):
        # Handle both regular dict and QueryDict from FormData
        if hasattr(data, 'dict'):
            # It's a QueryDict, convert to regular dict
            data = data.dict()
        else:
            data = dict(data)
        
        # Parse JSON string fields
        json_fields = ['dietary_tags', 'allergens', 'customization_options', 'add_ons']
        for field in json_fields:
            if field in data:
                value = data[field]
                if isinstance(value, str):
                    try:
                        data[field] = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        data[field] = []
                elif value is None:
                    data[field] = []
        
        return super().to_internal_value(data)