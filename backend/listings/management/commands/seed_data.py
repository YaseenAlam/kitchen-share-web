from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from listings.models import Listing
from users.models import CookProfile
import random
import requests

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with test cooks and listings with images'

    def download_image(self, url):
        """Download image from URL and return as ContentFile"""
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return ContentFile(response.content)
        except Exception as e:
            self.stdout.write(f'    ⚠️  Failed to download image: {e}')
        return None

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding database with images...')
        
        # La Mirada, CA coordinates as center point
        CENTER_LAT = 33.9172
        CENTER_LNG = -118.0120
        
        # Test cooks data with profile images
        cooks_data = [
            {
                'username': 'maria_cocina',
                'email': 'maria@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Authentic Mexican recipes passed down from my abuela. Every dish is made with love and fresh ingredients!',
                    'years_experience': 15,
                    'cuisine_specialties': ['Mexican', 'Latin American'],
                    'signature_dishes': ['Birria Tacos', 'Pozole', 'Tamales'],
                    'kitchen_description': 'Clean, certified home kitchen with commercial-grade equipment',
                    'food_safety_certified': True,
                    'accepted_payments': ['cash', 'venmo', 'zelle'],
                    'payment_notes': 'Venmo: @maria-cocina',
                    'available_days': ['friday', 'saturday', 'sunday'],
                    'pickup_instructions': 'Ring doorbell, I\'ll bring it out fresh!',
                }
            },
            {
                'username': 'chef_mike',
                'email': 'mike@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Former restaurant chef bringing gourmet American cuisine to your neighborhood.',
                    'years_experience': 12,
                    'cuisine_specialties': ['American', 'BBQ'],
                    'signature_dishes': ['Smoked Brisket', 'Mac & Cheese', 'Pulled Pork'],
                    'kitchen_description': 'Professional smoker and full kitchen setup',
                    'food_safety_certified': True,
                    'accepted_payments': ['cash', 'venmo', 'paypal'],
                    'payment_notes': 'Venmo: @chefmike',
                    'available_days': ['saturday', 'sunday'],
                    'pickup_instructions': 'Text when arriving, pickup from garage',
                }
            },
            {
                'username': 'nonna_rosa',
                'email': 'rosa@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Italian grandmother with 40 years of cooking. My pasta is made fresh daily!',
                    'years_experience': 40,
                    'cuisine_specialties': ['Italian'],
                    'signature_dishes': ['Fresh Pasta', 'Lasagna', 'Tiramisu'],
                    'kitchen_description': 'Traditional Italian kitchen, pasta made by hand',
                    'food_safety_certified': True,
                    'accepted_payments': ['cash', 'zelle'],
                    'payment_notes': 'Cash preferred, Zelle to rosa@email.com',
                    'available_days': ['thursday', 'friday', 'saturday'],
                    'pickup_instructions': 'Come to back door, kitchen entrance',
                }
            },
            {
                'username': 'thai_kitchen_joy',
                'email': 'joy@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Born in Bangkok, bringing authentic Thai flavors to California!',
                    'years_experience': 20,
                    'cuisine_specialties': ['Thai', 'Asian'],
                    'signature_dishes': ['Pad Thai', 'Green Curry', 'Tom Yum'],
                    'kitchen_description': 'Fully equipped with authentic Thai ingredients',
                    'food_safety_certified': True,
                    'accepted_payments': ['venmo', 'zelle', 'cashapp'],
                    'payment_notes': 'Venmo: @joythai',
                    'available_days': ['wednesday', 'thursday', 'friday', 'saturday'],
                    'pickup_instructions': 'Front porch pickup, will leave in hot bag',
                }
            },
            {
                'username': 'indian_spice_priya',
                'email': 'priya@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Home chef specializing in North Indian cuisine. All spices ground fresh!',
                    'years_experience': 18,
                    'cuisine_specialties': ['Indian'],
                    'signature_dishes': ['Butter Chicken', 'Biryani', 'Naan'],
                    'kitchen_description': 'Dedicated tandoor oven and spice room',
                    'food_safety_certified': True,
                    'accepted_payments': ['zelle', 'venmo'],
                    'payment_notes': 'Zelle: priya@email.com',
                    'available_days': ['friday', 'saturday', 'sunday'],
                    'pickup_instructions': 'Call when outside, apartment 204',
                }
            },
        ]

        # Listings with image URLs
        listings_data = {
            'maria_cocina': [
                {
                    'title': 'Authentic Birria Tacos',
                    'description': 'Slow-cooked beef birria with consommé for dipping. Served with fresh cilantro, onions, and lime. The tortillas are hand-made and griddled to perfection.',
                    'price': 16.99,
                    'image_url': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop',
                    'cuisine_type': 'mexican',
                    'prep_time': 45,
                    'servings': 4,
                    'dietary_tags': [],
                    'ingredients': 'Beef chuck, guajillo chiles, corn tortillas, cilantro, onion, lime',
                    'allergens': ['Gluten'],
                    'spice_level': 'medium',
                    'calories': 650,
                    'customization_options': [
                        {'name': 'Meat', 'required': True, 'options': [
                            {'label': 'Beef', 'price': 0},
                            {'label': 'Chicken', 'price': 0},
                            {'label': 'Mixed', 'price': 2}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Consommé', 'price': 2},
                            {'label': 'Extra Tortillas (4)', 'price': 3},
                            {'label': 'Guacamole', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Homemade Pozole Rojo',
                    'description': 'Traditional red pozole with tender pork and hominy in a rich chile broth. Includes all the toppings: cabbage, radish, oregano, and tostadas.',
                    'price': 14.99,
                    'image_url': 'https://images.unsplash.com/photo-1564671165093-20688ff1fffa?w=800&h=600&fit=crop',
                    'cuisine_type': 'mexican',
                    'prep_time': 30,
                    'servings': 2,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Pork shoulder, hominy, guajillo chiles, garlic, oregano',
                    'allergens': [],
                    'spice_level': 'mild',
                    'calories': 480,
                    'customization_options': [],
                    'add_ons': [
                        {'name': 'Add-ons', 'items': [
                            {'label': 'Extra Pork', 'price': 4},
                            {'label': 'Avocado', 'price': 2}
                        ]}
                    ],
                },
                {
                    'title': 'Dozen Tamales (Mixed)',
                    'description': 'One dozen handmade tamales: 6 pork in red sauce, 6 chicken in green sauce. Made fresh to order - please order 24 hours in advance!',
                    'price': 24.99,
                    'image_url': 'https://images.unsplash.com/photo-1612871689353-ccd89f94c5c2?w=800&h=600&fit=crop',
                    'cuisine_type': 'mexican',
                    'prep_time': 60,
                    'servings': 6,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Masa, pork, chicken, dried chiles, corn husks',
                    'allergens': [],
                    'spice_level': 'mild',
                    'calories': 280,
                    'customization_options': [
                        {'name': 'Type', 'required': True, 'options': [
                            {'label': 'Mixed (6 pork, 6 chicken)', 'price': 0},
                            {'label': 'All Pork', 'price': 0},
                            {'label': 'All Chicken', 'price': 0}
                        ]}
                    ],
                    'add_ons': [],
                },
            ],
            'chef_mike': [
                {
                    'title': 'Smoked Brisket Plate',
                    'description': '12-hour smoked beef brisket with house-made BBQ sauce. Served with coleslaw and cornbread. This is Texas-style BBQ at its finest!',
                    'price': 22.99,
                    'image_url': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop',
                    'cuisine_type': 'american',
                    'prep_time': 20,
                    'servings': 2,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Prime beef brisket, dry rub, oak wood, house BBQ sauce',
                    'allergens': [],
                    'spice_level': 'mild',
                    'calories': 850,
                    'customization_options': [
                        {'name': 'Cut Preference', 'required': True, 'options': [
                            {'label': 'Lean', 'price': 0},
                            {'label': 'Fatty', 'price': 0},
                            {'label': 'Mixed', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Sides', 'items': [
                            {'label': 'Extra Cornbread', 'price': 2},
                            {'label': 'Mac & Cheese', 'price': 5},
                            {'label': 'Baked Beans', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Loaded Mac & Cheese',
                    'description': 'Creamy four-cheese mac topped with crispy bacon bits and breadcrumbs. Ultimate comfort food!',
                    'price': 12.99,
                    'image_url': 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&h=600&fit=crop',
                    'cuisine_type': 'american',
                    'prep_time': 15,
                    'servings': 2,
                    'dietary_tags': ['Vegetarian'],
                    'ingredients': 'Pasta, cheddar, gruyere, parmesan, cream, bacon',
                    'allergens': ['Dairy', 'Gluten'],
                    'spice_level': 'none',
                    'calories': 720,
                    'customization_options': [
                        {'name': 'Style', 'required': False, 'options': [
                            {'label': 'Classic', 'price': 0},
                            {'label': 'No Bacon (Vegetarian)', 'price': 0},
                            {'label': 'Extra Bacon', 'price': 2}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Toppings', 'items': [
                            {'label': 'Pulled Pork', 'price': 5},
                            {'label': 'Jalapeños', 'price': 1}
                        ]}
                    ],
                },
                {
                    'title': 'Pulled Pork Sandwich',
                    'description': 'Tender pulled pork with tangy Carolina-style vinegar sauce on a brioche bun. Served with pickles and chips.',
                    'price': 13.99,
                    'image_url': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
                    'cuisine_type': 'american',
                    'prep_time': 15,
                    'servings': 1,
                    'dietary_tags': [],
                    'ingredients': 'Pork shoulder, vinegar sauce, brioche bun, coleslaw',
                    'allergens': ['Gluten'],
                    'spice_level': 'mild',
                    'calories': 680,
                    'customization_options': [],
                    'add_ons': [
                        {'name': 'Make it a meal', 'items': [
                            {'label': 'Add Fries', 'price': 3},
                            {'label': 'Add Coleslaw', 'price': 2}
                        ]}
                    ],
                },
            ],
            'nonna_rosa': [
                {
                    'title': 'Fresh Pasta with Bolognese',
                    'description': 'Hand-rolled tagliatelle with authentic Bolognese sauce simmered for 4 hours. Topped with aged Parmigiano-Reggiano.',
                    'price': 18.99,
                    'image_url': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
                    'cuisine_type': 'italian',
                    'prep_time': 25,
                    'servings': 2,
                    'dietary_tags': [],
                    'ingredients': 'Fresh pasta, beef, pork, San Marzano tomatoes, Parmigiano',
                    'allergens': ['Gluten', 'Dairy', 'Eggs'],
                    'spice_level': 'none',
                    'calories': 720,
                    'customization_options': [
                        {'name': 'Pasta Type', 'required': True, 'options': [
                            {'label': 'Tagliatelle', 'price': 0},
                            {'label': 'Pappardelle', 'price': 0},
                            {'label': 'Rigatoni', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Parmesan', 'price': 2},
                            {'label': 'Garlic Bread', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Homemade Lasagna',
                    'description': 'Five layers of fresh pasta, ricotta, mozzarella, and slow-cooked meat sauce. Family recipe from Naples!',
                    'price': 16.99,
                    'image_url': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&h=600&fit=crop',
                    'cuisine_type': 'italian',
                    'prep_time': 30,
                    'servings': 2,
                    'dietary_tags': [],
                    'ingredients': 'Fresh pasta sheets, ricotta, mozzarella, beef, bechamel',
                    'allergens': ['Gluten', 'Dairy', 'Eggs'],
                    'spice_level': 'none',
                    'calories': 820,
                    'customization_options': [],
                    'add_ons': [
                        {'name': 'Sides', 'items': [
                            {'label': 'Caesar Salad', 'price': 5},
                            {'label': 'Garlic Bread', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Classic Tiramisu',
                    'description': 'Traditional tiramisu with espresso-soaked ladyfingers and mascarpone cream. Made fresh daily!',
                    'price': 8.99,
                    'image_url': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop',
                    'cuisine_type': 'italian',
                    'prep_time': 10,
                    'servings': 2,
                    'dietary_tags': ['Vegetarian'],
                    'ingredients': 'Mascarpone, espresso, ladyfingers, cocoa, eggs',
                    'allergens': ['Dairy', 'Gluten', 'Eggs'],
                    'spice_level': 'none',
                    'calories': 380,
                    'customization_options': [],
                    'add_ons': [],
                },
            ],
            'thai_kitchen_joy': [
                {
                    'title': 'Authentic Pad Thai',
                    'description': 'Classic pad Thai with rice noodles, shrimp, tofu, egg, and crushed peanuts. Made with real tamarind paste!',
                    'price': 15.99,
                    'image_url': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 25,
                    'servings': 2,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Rice noodles, shrimp, tofu, eggs, tamarind, peanuts',
                    'allergens': ['Shellfish', 'Eggs', 'Nuts'],
                    'spice_level': 'mild',
                    'calories': 580,
                    'customization_options': [
                        {'name': 'Protein', 'required': True, 'options': [
                            {'label': 'Shrimp', 'price': 0},
                            {'label': 'Chicken', 'price': 0},
                            {'label': 'Tofu (Vegan)', 'price': 0},
                            {'label': 'Combo', 'price': 3}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Peanuts', 'price': 1},
                            {'label': 'Extra Protein', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Green Curry Bowl',
                    'description': 'Creamy Thai green curry with bamboo shoots, Thai basil, and vegetables in coconut milk. Served with jasmine rice.',
                    'price': 14.99,
                    'image_url': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 20,
                    'servings': 2,
                    'dietary_tags': ['Gluten-Free', 'Dairy-Free'],
                    'ingredients': 'Green curry paste, coconut milk, bamboo, Thai basil, vegetables',
                    'allergens': [],
                    'spice_level': 'hot',
                    'calories': 520,
                    'customization_options': [
                        {'name': 'Spice Level', 'required': True, 'options': [
                            {'label': 'Mild', 'price': 0},
                            {'label': 'Medium', 'price': 0},
                            {'label': 'Thai Hot 🔥', 'price': 0}
                        ]},
                        {'name': 'Protein', 'required': True, 'options': [
                            {'label': 'Chicken', 'price': 0},
                            {'label': 'Shrimp', 'price': 2},
                            {'label': 'Tofu', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Sides', 'items': [
                            {'label': 'Extra Rice', 'price': 2},
                            {'label': 'Spring Rolls (2)', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Tom Yum Soup',
                    'description': 'Hot and sour Thai soup with shrimp, mushrooms, lemongrass, and lime. The perfect balance of flavors!',
                    'price': 12.99,
                    'image_url': 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 20,
                    'servings': 2,
                    'dietary_tags': ['Gluten-Free', 'Dairy-Free'],
                    'ingredients': 'Shrimp, mushrooms, lemongrass, galangal, lime, chiles',
                    'allergens': ['Shellfish'],
                    'spice_level': 'hot',
                    'calories': 280,
                    'customization_options': [],
                    'add_ons': [
                        {'name': 'Make it a meal', 'items': [
                            {'label': 'Add Jasmine Rice', 'price': 2},
                            {'label': 'Extra Shrimp', 'price': 4}
                        ]}
                    ],
                },
            ],
            'indian_spice_priya': [
                {
                    'title': 'Butter Chicken',
                    'description': 'Tender chicken tikka in a creamy tomato-butter sauce. Mild and rich, served with basmati rice and naan.',
                    'price': 17.99,
                    'image_url': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop',
                    'cuisine_type': 'indian',
                    'prep_time': 30,
                    'servings': 2,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Chicken thigh, tomatoes, cream, butter, garam masala, fenugreek',
                    'allergens': ['Dairy'],
                    'spice_level': 'mild',
                    'calories': 680,
                    'customization_options': [
                        {'name': 'Spice Level', 'required': True, 'options': [
                            {'label': 'Mild', 'price': 0},
                            {'label': 'Medium', 'price': 0},
                            {'label': 'Spicy', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Breads', 'items': [
                            {'label': 'Extra Naan', 'price': 3},
                            {'label': 'Garlic Naan', 'price': 4}
                        ]},
                        {'name': 'Sides', 'items': [
                            {'label': 'Raita', 'price': 2},
                            {'label': 'Extra Rice', 'price': 3}
                        ]}
                    ],
                },
                {
                    'title': 'Lamb Biryani',
                    'description': 'Fragrant basmati rice layered with spiced lamb, caramelized onions, and saffron. A royal dish!',
                    'price': 21.99,
                    'image_url': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop',
                    'cuisine_type': 'indian',
                    'prep_time': 40,
                    'servings': 2,
                    'dietary_tags': ['Gluten-Free', 'Dairy-Free'],
                    'ingredients': 'Lamb, basmati rice, saffron, fried onions, whole spices, mint',
                    'allergens': [],
                    'spice_level': 'medium',
                    'calories': 750,
                    'customization_options': [
                        {'name': 'Meat', 'required': True, 'options': [
                            {'label': 'Lamb', 'price': 0},
                            {'label': 'Chicken', 'price': -3},
                            {'label': 'Goat', 'price': 2}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Sides', 'items': [
                            {'label': 'Raita', 'price': 2},
                            {'label': 'Mirchi Ka Salan', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Samosa Platter (6 pcs)',
                    'description': 'Crispy golden samosas filled with spiced potatoes and peas. Served with mint and tamarind chutneys.',
                    'price': 9.99,
                    'image_url': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop',
                    'cuisine_type': 'indian',
                    'prep_time': 15,
                    'servings': 3,
                    'dietary_tags': ['Vegetarian', 'Vegan', 'Dairy-Free'],
                    'ingredients': 'Potatoes, peas, cumin, coriander, pastry',
                    'allergens': ['Gluten'],
                    'spice_level': 'mild',
                    'calories': 320,
                    'customization_options': [],
                    'add_ons': [
                        {'name': 'Dips', 'items': [
                            {'label': 'Extra Mint Chutney', 'price': 1},
                            {'label': 'Extra Tamarind Chutney', 'price': 1}
                        ]}
                    ],
                },
            ],
        }

        # Location offsets for variety
        location_offsets = [
            (0.01, 0.01), (-0.015, 0.02), (0.02, -0.01), (-0.01, -0.015), (0.025, 0.005),
            (-0.02, 0.01), (0.015, -0.02), (-0.025, -0.01), (0.005, 0.025), (-0.01, 0.015),
        ]

        created_cooks = 0
        created_listings = 0

        for i, cook_data in enumerate(cooks_data):
            # Create or get user
            user, created = User.objects.get_or_create(
                username=cook_data['username'],
                defaults={
                    'email': cook_data['email'],
                    'is_cook': True,
                }
            )
            
            if created:
                user.set_password(cook_data['password'])
                user.save()
                created_cooks += 1
                self.stdout.write(f'  ✅ Created cook: {user.username}')
            else:
                user.is_cook = True
                user.save()
                self.stdout.write(f'  ⏭️  Cook exists: {user.username}')

            # Download and set profile image
            if cook_data.get('profile_image') and not user.profile_image:
                self.stdout.write(f'    📸 Downloading profile image...')
                img_content = self.download_image(cook_data['profile_image'])
                if img_content:
                    user.profile_image.save(f'{user.username}_profile.jpg', img_content, save=True)

            # Create or update cook profile
            profile_data = cook_data['profile']
            profile, _ = CookProfile.objects.update_or_create(
                user=user,
                defaults={
                    'bio': profile_data['bio'],
                    'years_experience': profile_data['years_experience'],
                    'cuisine_specialties': profile_data['cuisine_specialties'],
                    'signature_dishes': profile_data['signature_dishes'],
                    'kitchen_description': profile_data['kitchen_description'],
                    'food_safety_certified': profile_data['food_safety_certified'],
                    'accepted_payments': profile_data['accepted_payments'],
                    'payment_notes': profile_data['payment_notes'],
                    'available_days': profile_data['available_days'],
                    'pickup_instructions': profile_data['pickup_instructions'],
                    'rating': round(random.uniform(4.2, 5.0), 1),
                    'total_orders': random.randint(15, 75),
                }
            )

            # Create listings
            for j, listing_data in enumerate(listings_data.get(cook_data['username'], [])):
                offset = location_offsets[(i * 3 + j) % len(location_offsets)]
                
                # Check if listing exists
                listing, created = Listing.objects.get_or_create(
                    cook=user,
                    title=listing_data['title'],
                    defaults={
                        'description': listing_data['description'],
                        'price': listing_data['price'],
                        'cuisine_type': listing_data['cuisine_type'],
                        'prep_time': listing_data['prep_time'],
                        'servings': listing_data['servings'],
                        'dietary_tags': listing_data['dietary_tags'],
                        'ingredients': listing_data['ingredients'],
                        'allergens': listing_data['allergens'],
                        'spice_level': listing_data['spice_level'],
                        'calories': listing_data['calories'],
                        'customization_options': listing_data['customization_options'],
                        'add_ons': listing_data['add_ons'],
                        'latitude': CENTER_LAT + offset[0],
                        'longitude': CENTER_LNG + offset[1],
                        'available': True,
                    }
                )
                
                if created:
                    created_listings += 1
                    self.stdout.write(f'    🍽️  Created: {listing.title}')
                    
                    # Download and attach image
                    if listing_data.get('image_url'):
                        self.stdout.write(f'       📸 Downloading image...')
                        img_content = self.download_image(listing_data['image_url'])
                        if img_content:
                            listing.image.save(f'{listing.id}_{listing.title[:20]}.jpg', img_content, save=True)
                            self.stdout.write(f'       ✅ Image saved!')
                else:
                    self.stdout.write(f'    ⏭️  Exists: {listing.title}')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'✅ Done! Created {created_cooks} cooks and {created_listings} listings with images'))
        self.stdout.write('')
        self.stdout.write('📝 Test accounts (password: testpass123):')
        for cook in cooks_data:
            self.stdout.write(f'   - {cook["username"]}')