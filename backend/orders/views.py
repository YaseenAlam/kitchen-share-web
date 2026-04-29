from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, Review
from .serializers import OrderSerializer, ReviewSerializer


class IsOrderParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.buyer == request.user or obj.listing.cook == request.user


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipant]

    def get_queryset(self):
        return Order.objects.filter(buyer=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        listing = serializer.validated_data['listing']
        quantity = serializer.validated_data.get('quantity', 1)
        
        # Calculate total price
        base_price = float(listing.price) * quantity
        
        # Add selected options price
        selected_options = serializer.validated_data.get('selected_options', {})
        for option_name, option_data in selected_options.items():
            if isinstance(option_data, dict) and option_data.get('price'):
                base_price += float(option_data['price']) * quantity
        
        # Add selected add-ons price
        selected_add_ons = serializer.validated_data.get('selected_add_ons', [])
        for addon in selected_add_ons:
            if isinstance(addon, dict) and addon.get('price'):
                base_price += float(addon['price']) * quantity
        
        serializer.save(buyer=self.request.user, total_price=base_price)

    @action(detail=False, methods=['get'])
    def incoming(self, request):
        """Get orders for dishes the current user (cook) is selling"""
        if not request.user.is_cook:
            return Response({"detail": "Not a cook"}, status=status.HTTP_403_FORBIDDEN)
        
        orders = Order.objects.filter(listing__cook=request.user).order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='update_status')
    def update_status(self, request, pk=None):
        """Update order status (for cooks)"""
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Only the cook who owns the listing can update status
        if order.listing.cook != request.user:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status not in dict(Order.Status.choices):
            return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        # Update cook's total orders count when completed
        if new_status == 'completed' and hasattr(order.listing.cook, 'cook_profile'):
            profile = order.listing.cook.cook_profile
            profile.total_orders += 1
            profile.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order (for buyers, only if pending)"""
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Only the buyer can cancel their own order
        if order.buyer != request.user:
            return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
        # Can only cancel pending or accepted orders
        if order.status not in ['pending', 'accepted']:
            return Response(
                {"detail": "Cannot cancel order that is already being prepared"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Add a review for a completed order"""
        order = self.get_object()
        
        if order.buyer != request.user:
            return Response({"detail": "Not your order"}, status=status.HTTP_403_FORBIDDEN)
        
        if order.status != 'completed':
            return Response({"detail": "Order not completed"}, status=status.HTTP_400_BAD_REQUEST)
        
        if hasattr(order, 'review'):
            return Response({"detail": "Already reviewed"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(order=order, reviewer=request.user)
            
            # Update cook's rating
            cook_profile = order.listing.cook.cook_profile
            reviews = Review.objects.filter(order__listing__cook=order.listing.cook)
            avg_rating = reviews.aggregate(models.Avg('rating'))['rating__avg']
            cook_profile.rating = round(avg_rating, 2)
            cook_profile.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)