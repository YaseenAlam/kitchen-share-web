from rest_framework import serializers
from .models import Order, Review


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'order', 'rating', 'comment', 'created_at', 'reviewer', 'reviewer_name']
        read_only_fields = ['id', 'order', 'created_at', 'reviewer']


class OrderSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_image = serializers.ImageField(source='listing.image', read_only=True)
    review = ReviewSerializer(read_only=True)

    # Cook contact info — revealed once the order is placed.
    # OrderViewSet already restricts queryset to participants (buyer or cook),
    # so non-participants can never read these fields.
    cook_name = serializers.CharField(source='listing.cook.username', read_only=True)
    cook_first_name = serializers.CharField(source='listing.cook.first_name', read_only=True)
    cook_last_name = serializers.CharField(source='listing.cook.last_name', read_only=True)
    cook_phone = serializers.SerializerMethodField()
    cook_address = serializers.SerializerMethodField()
    cook_pickup_instructions = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'buyer_name', 'listing', 'listing_title', 'listing_image',
            'quantity', 'total_price', 'status', 'pickup_time',
            'notes', 'selected_options', 'selected_add_ons',
            'review', 'created_at', 'updated_at',
            'cook_name', 'cook_first_name', 'cook_last_name',
            'cook_phone', 'cook_address', 'cook_pickup_instructions',
        ]
        read_only_fields = ['id', 'buyer', 'total_price', 'status', 'created_at', 'updated_at']

    def _is_active(self, obj):
        # Hide contact info on cancelled orders — no need to call them anymore.
        return obj.status != Order.Status.CANCELLED

    def get_cook_phone(self, obj):
        if not self._is_active(obj):
            return None
        return obj.listing.cook.phone or None

    def get_cook_address(self, obj):
        if not self._is_active(obj):
            return None
        return obj.listing.cook.address or None

    def get_cook_pickup_instructions(self, obj):
        if not self._is_active(obj):
            return None
        if hasattr(obj.listing.cook, 'cook_profile'):
            return obj.listing.cook.cook_profile.pickup_instructions or None
        return None