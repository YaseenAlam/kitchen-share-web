from rest_framework import viewsets, permissions
from django.db.models import Q
from math import radians, sin, cos, sqrt, atan2
from .models import Listing
from .serializers import ListingSerializer


class IsCookOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_cook

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.cook == request.user


class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    permission_classes = [IsCookOrReadOnly]

    def get_queryset(self):
        queryset = Listing.objects.filter(available=True)

        # Filter by cook (username)
        cook = self.request.query_params.get('cook')
        if cook:
            queryset = queryset.filter(cook__username=cook)

        # Search by title or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        # Filter by cuisine type
        cuisine = self.request.query_params.get('cuisine')
        if cuisine and cuisine != 'all':
            queryset = queryset.filter(cuisine_type=cuisine)
        
        # Filter by price
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by dietary tags
        dietary_list = self.request.query_params.getlist('dietary')
        if dietary_list:
            for dietary in dietary_list:
                queryset = queryset.filter(dietary_tags__contains=dietary)
        
        # Distance filtering
        user_lat = self.request.query_params.get('lat')
        user_lng = self.request.query_params.get('lng')
        max_distance = self.request.query_params.get('distance')
        
        if user_lat and user_lng and max_distance:
            try:
                user_lat = float(user_lat)
                user_lng = float(user_lng)
                max_distance = float(max_distance)
                
                # Calculate distance and filter
                listings_with_distance = []
                
                for listing in queryset:
                    if listing.latitude and listing.longitude:
                        lat1 = radians(user_lat)
                        lat2 = radians(float(listing.latitude))
                        lon1 = radians(user_lng)
                        lon2 = radians(float(listing.longitude))
                        
                        dlat = lat2 - lat1
                        dlon = lon2 - lon1
                        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                        c = 2 * atan2(sqrt(a), sqrt(1-a))
                        r = 3956
                        distance = r * c
                        
                        if distance <= max_distance:
                            listings_with_distance.append((listing.id, distance))
                    else:
                        listings_with_distance.append((listing.id, 0))
                
                # Sort by distance (closest first)
                listings_with_distance.sort(key=lambda x: x[1])
                sorted_ids = [item[0] for item in listings_with_distance]
                
                # Preserve the sorted order
                preserved = {id: index for index, id in enumerate(sorted_ids)}
                queryset = sorted(queryset.filter(id__in=sorted_ids), key=lambda x: preserved[x.id])
                return queryset
                    
            except (ValueError, TypeError):
                pass
        
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        user = self.request.user
        latitude = self.request.data.get('latitude') or user.latitude
        longitude = self.request.data.get('longitude') or user.longitude
        serializer.save(cook=user, latitude=latitude, longitude=longitude)