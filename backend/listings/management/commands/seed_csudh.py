from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from listings.models import Listing
from users.models import CookProfile
import random
import requests

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with test cooks around Cal State Dominguez Hills'

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
        self.stdout.write('🌱 Seeding CSUDH area database with images...')
        
        # Cal State Dominguez Hills / Carson, CA coordinates
        CENTER_LAT = 33.8634
        CENTER_LNG = -118.2553
        
        # Test cooks data
        cooks_data = [
            {
                'username': 'campus_eats_carlos',
                'email': 'carlos@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1583394293214-28ez1c79f3a3?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'CSUDH alumni serving up authentic Filipino-Mexican fusion right by campus!',
                    'years_experience': 5,
                    'cuisine_specialties': ['Filipino', 'Mexican', 'Fusion'],
                    'signature_dishes': ['Adobo Tacos', 'Lumpia', 'Sisig Fries'],
                    'kitchen_description': 'Home kitchen near campus, perfect for student pickup',
                    'food_safety_certified': True,
                    'accepted_payments': ['venmo', 'zelle', 'cashapp'],
                    'payment_notes': 'Venmo: @carlos-eats / CashApp: $carloseats',
                    'available_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                    'pickup_instructions': 'Text when arriving - 5 min walk from campus!',
                }
            },
            {
                'username': 'soul_food_mama_dee',
                'email': 'dee@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Bringing Southern comfort food to Carson! 30 years of family recipes.',
                    'years_experience': 30,
                    'cuisine_specialties': ['Soul Food', 'Southern', 'BBQ'],
                    'signature_dishes': ['Fried Chicken', 'Mac & Cheese', 'Collard Greens'],
                    'kitchen_description': 'Full kitchen with smoker in backyard',
                    'food_safety_certified': True,
                    'accepted_payments': ['cash', 'zelle'],
                    'payment_notes': 'Cash preferred! Zelle: dee@email.com',
                    'available_days': ['friday', 'saturday', 'sunday'],
                    'pickup_instructions': 'Come to side gate, ring bell twice',
                }
            },
            {
                'username': 'korean_kitchen_jin',
                'email': 'jin@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Authentic Korean home cooking. Everything made from scratch, just like omma!',
                    'years_experience': 25,
                    'cuisine_specialties': ['Korean'],
                    'signature_dishes': ['Korean Fried Chicken', 'Bulgogi', 'Kimchi Jjigae'],
                    'kitchen_description': 'Traditional Korean kitchen with all authentic ingredients',
                    'food_safety_certified': True,
                    'accepted_payments': ['venmo', 'zelle', 'cash'],
                    'payment_notes': 'Venmo: @jin-korean',
                    'available_days': ['wednesday', 'thursday', 'friday', 'saturday'],
                    'pickup_instructions': 'Apartment complex - will meet at lobby',
                }
            },
            {
                'username': 'vegan_vibes_tasha',
                'email': 'tasha@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Plant-based chef making vegan food that even meat-lovers crave! 🌱',
                    'years_experience': 8,
                    'cuisine_specialties': ['Vegan', 'Health Food', 'American'],
                    'signature_dishes': ['Vegan Burger', 'Cauliflower Wings', 'Acai Bowls'],
                    'kitchen_description': '100% plant-based kitchen, no cross-contamination',
                    'food_safety_certified': True,
                    'accepted_payments': ['venmo', 'cashapp', 'apple_pay'],
                    'payment_notes': 'Venmo: @vegan-tasha',
                    'available_days': ['monday', 'wednesday', 'friday', 'saturday', 'sunday'],
                    'pickup_instructions': 'Front porch pickup in insulated bag',
                }
            },
            {
                'username': 'taco_king_roberto',
                'email': 'roberto@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Street tacos like you\'d find in Mexico City. Handmade tortillas daily!',
                    'years_experience': 22,
                    'cuisine_specialties': ['Mexican', 'Street Food'],
                    'signature_dishes': ['Street Tacos', 'Quesabirria', 'Elote'],
                    'kitchen_description': 'Outdoor prep area with plancha grill',
                    'food_safety_certified': True,
                    'accepted_payments': ['cash', 'venmo', 'zelle'],
                    'payment_notes': 'Cash is king! Venmo: @tacoking-roberto',
                    'available_days': ['thursday', 'friday', 'saturday', 'sunday'],
                    'pickup_instructions': 'Driveway pickup - look for the taco flag!',
                }
            },
            {
                'username': 'jamaican_jerk_marcus',
                'email': 'marcus@test.com',
                'password': 'testpass123',
                'profile_image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
                'profile': {
                    'bio': 'Bringing the flavors of Jamaica to Carson! Jerk chicken like back home.',
                    'years_experience': 18,
                    'cuisine_specialties': ['Jamaican', 'Caribbean'],
                    'signature_dishes': ['Jerk Chicken', 'Oxtail', 'Rice and Peas'],
                    'kitchen_description': 'Authentic jerk drum smoker in backyard',
                    'food_safety_certified': True,
                    'accepted_payments': ['cash', 'zelle', 'venmo'],
                    'payment_notes': 'Zelle: marcus@email.com',
                    'available_days': ['friday', 'saturday', 'sunday'],
                    'pickup_instructions': 'Backyard entrance through side gate',
                }
            },
        ]

        # Listings with images
        listings_data = {
            'campus_eats_carlos': [
                {
                    'title': 'Adobo Tacos (3 pcs)',
                    'description': 'Filipino-Mexican fusion! Tender chicken adobo in handmade corn tortillas with pickled onions and cilantro-lime crema.',
                    'price': 12.99,
                    'image_url': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop',
                    'cuisine_type': 'mexican',
                    'prep_time': 20,
                    'servings': 1,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Chicken thigh, soy sauce, vinegar, corn tortillas, pickled onions',
                    'allergens': ['Soy'],
                    'spice_level': 'mild',
                    'calories': 520,
                    'customization_options': [
                        {'name': 'Protein', 'required': True, 'options': [
                            {'label': 'Chicken Adobo', 'price': 0},
                            {'label': 'Pork Adobo', 'price': 0},
                            {'label': 'Tofu Adobo', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Tortillas', 'price': 2},
                            {'label': 'Side of Rice', 'price': 3}
                        ]}
                    ],
                },
                {
                    'title': 'Crispy Lumpia (10 pcs)',
                    'description': 'Golden fried Filipino spring rolls with seasoned pork and vegetables. Served with sweet chili sauce.',
                    'price': 10.99,
                    'image_url': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 15,
                    'servings': 2,
                    'dietary_tags': [],
                    'ingredients': 'Ground pork, carrots, onions, lumpia wrapper',
                    'allergens': ['Gluten'],
                    'spice_level': 'none',
                    'calories': 380,
                    'customization_options': [],
                    'add_ons': [
                        {'name': 'Sauces', 'items': [
                            {'label': 'Extra Sweet Chili', 'price': 0.50},
                            {'label': 'Vinegar Dip', 'price': 0.50}
                        ]}
                    ],
                },
                {
                    'title': 'Sisig Fries',
                    'description': 'Loaded fries topped with sizzling pork sisig, egg, spicy mayo, and green onions. Student favorite!',
                    'price': 13.99,
                    'image_url': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 25,
                    'servings': 2,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Crispy fries, chopped pork, onions, chili, egg, mayo',
                    'allergens': ['Eggs'],
                    'spice_level': 'medium',
                    'calories': 720,
                    'customization_options': [
                        {'name': 'Spice Level', 'required': True, 'options': [
                            {'label': 'Mild', 'price': 0},
                            {'label': 'Medium', 'price': 0},
                            {'label': 'Extra Spicy', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Toppings', 'items': [
                            {'label': 'Extra Egg', 'price': 1.50},
                            {'label': 'Extra Pork', 'price': 3}
                        ]}
                    ],
                },
            ],
            'soul_food_mama_dee': [
                {
                    'title': 'Fried Chicken Dinner',
                    'description': '3 pieces of crispy, juicy fried chicken with your choice of 2 sides. Family recipe for 3 generations!',
                    'price': 16.99,
                    'image_url': 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&h=600&fit=crop',
                    'cuisine_type': 'american',
                    'prep_time': 25,
                    'servings': 1,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Chicken pieces, buttermilk, seasoned flour, secret spices',
                    'allergens': ['Gluten', 'Dairy'],
                    'spice_level': 'mild',
                    'calories': 890,
                    'customization_options': [
                        {'name': 'Pieces', 'required': True, 'options': [
                            {'label': 'Mixed (breast, thigh, leg)', 'price': 0},
                            {'label': 'All Dark Meat', 'price': 0},
                            {'label': 'All White Meat', 'price': 2}
                        ]},
                        {'name': 'Side 1', 'required': True, 'options': [
                            {'label': 'Mac & Cheese', 'price': 0},
                            {'label': 'Collard Greens', 'price': 0},
                            {'label': 'Candied Yams', 'price': 0},
                            {'label': 'Coleslaw', 'price': 0}
                        ]},
                        {'name': 'Side 2', 'required': True, 'options': [
                            {'label': 'Mac & Cheese', 'price': 0},
                            {'label': 'Collard Greens', 'price': 0},
                            {'label': 'Candied Yams', 'price': 0},
                            {'label': 'Cornbread', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Piece', 'price': 3},
                            {'label': 'Hot Sauce', 'price': 0}
                        ]}
                    ],
                },
                {
                    'title': 'Smothered Pork Chops',
                    'description': 'Tender bone-in pork chops smothered in rich onion gravy. Served with rice and one side.',
                    'price': 18.99,
                    'image_url': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&h=600&fit=crop',
                    'cuisine_type': 'american',
                    'prep_time': 30,
                    'servings': 1,
                    'dietary_tags': [],
                    'ingredients': 'Bone-in pork chops, onion gravy, rice',
                    'allergens': ['Gluten'],
                    'spice_level': 'none',
                    'calories': 780,
                    'customization_options': [
                        {'name': 'Side', 'required': True, 'options': [
                            {'label': 'Collard Greens', 'price': 0},
                            {'label': 'Mac & Cheese', 'price': 0},
                            {'label': 'Candied Yams', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Gravy', 'price': 1},
                            {'label': 'Cornbread', 'price': 2}
                        ]}
                    ],
                },
                {
                    'title': 'Southern Mac & Cheese',
                    'description': 'Creamy, cheesy, baked to perfection with a golden crust. The real deal!',
                    'price': 8.99,
                    'image_url': 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&h=600&fit=crop',
                    'cuisine_type': 'american',
                    'prep_time': 15,
                    'servings': 2,
                    'dietary_tags': ['Vegetarian'],
                    'ingredients': 'Elbow pasta, cheddar, American cheese, butter, milk, eggs',
                    'allergens': ['Dairy', 'Gluten', 'Eggs'],
                    'spice_level': 'none',
                    'calories': 450,
                    'customization_options': [],
                    'add_ons': [
                        {'name': 'Add protein', 'items': [
                            {'label': 'Pulled Pork', 'price': 4},
                            {'label': 'Fried Chicken Strips', 'price': 5}
                        ]}
                    ],
                },
            ],
            'korean_kitchen_jin': [
                {
                    'title': 'Korean Fried Chicken',
                    'description': 'Double-fried crispy chicken with your choice of sauce. Served with pickled radish.',
                    'price': 15.99,
                    'image_url': 'https://images.unsplash.com/photo-1575932444877-5106bee2a599?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 30,
                    'servings': 2,
                    'dietary_tags': [],
                    'ingredients': 'Chicken wings, rice flour, gochujang, soy garlic sauce',
                    'allergens': ['Gluten', 'Soy'],
                    'spice_level': 'medium',
                    'calories': 680,
                    'customization_options': [
                        {'name': 'Sauce', 'required': True, 'options': [
                            {'label': 'Yangnyeom (Sweet & Spicy)', 'price': 0},
                            {'label': 'Soy Garlic', 'price': 0},
                            {'label': 'Half & Half', 'price': 0}
                        ]},
                        {'name': 'Pieces', 'required': True, 'options': [
                            {'label': 'Wings (10 pcs)', 'price': 0},
                            {'label': 'Drumsticks (6 pcs)', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Sides', 'items': [
                            {'label': 'Extra Pickled Radish', 'price': 1},
                            {'label': 'Rice', 'price': 2}
                        ]}
                    ],
                },
                {
                    'title': 'Bulgogi Bowl',
                    'description': 'Marinated beef bulgogi over steamed rice with vegetables and a fried egg.',
                    'price': 14.99,
                    'image_url': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 20,
                    'servings': 1,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Beef sirloin, soy sauce, pear, garlic, rice, vegetables, egg',
                    'allergens': ['Soy', 'Eggs'],
                    'spice_level': 'none',
                    'calories': 620,
                    'customization_options': [
                        {'name': 'Protein', 'required': True, 'options': [
                            {'label': 'Beef Bulgogi', 'price': 0},
                            {'label': 'Spicy Pork', 'price': 0},
                            {'label': 'Chicken', 'price': -1}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Egg', 'price': 1.50},
                            {'label': 'Kimchi', 'price': 2}
                        ]}
                    ],
                },
                {
                    'title': 'Kimchi Jjigae',
                    'description': 'Hearty kimchi stew with pork belly and tofu. Comes with rice and banchan.',
                    'price': 13.99,
                    'image_url': 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 25,
                    'servings': 1,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Aged kimchi, pork belly, tofu, gochugaru',
                    'allergens': ['Soy'],
                    'spice_level': 'hot',
                    'calories': 480,
                    'customization_options': [
                        {'name': 'Spice Level', 'required': True, 'options': [
                            {'label': 'Regular Spicy', 'price': 0},
                            {'label': 'Extra Spicy 🔥', 'price': 0},
                            {'label': 'Mild', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Rice', 'price': 2},
                            {'label': 'Extra Tofu', 'price': 2}
                        ]}
                    ],
                },
            ],
            'vegan_vibes_tasha': [
                {
                    'title': 'Beyond Smash Burger',
                    'description': 'Double smashed Beyond patties with vegan cheese, special sauce, pickles on a brioche bun.',
                    'price': 14.99,
                    'image_url': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
                    'cuisine_type': 'american',
                    'prep_time': 20,
                    'servings': 1,
                    'dietary_tags': ['Vegan', 'Dairy-Free'],
                    'ingredients': 'Beyond Meat, vegan cheese, vegan brioche, special sauce',
                    'allergens': ['Gluten', 'Soy'],
                    'spice_level': 'none',
                    'calories': 580,
                    'customization_options': [
                        {'name': 'Style', 'required': True, 'options': [
                            {'label': 'Classic', 'price': 0},
                            {'label': 'Spicy (jalapeños)', 'price': 0},
                            {'label': 'BBQ Style', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Sweet Potato Fries', 'price': 4},
                            {'label': 'Extra Patty', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Cauliflower Wings',
                    'description': 'Crispy battered cauliflower tossed in your choice of sauce with ranch dip.',
                    'price': 11.99,
                    'image_url': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
                    'cuisine_type': 'american',
                    'prep_time': 20,
                    'servings': 2,
                    'dietary_tags': ['Vegan', 'Dairy-Free'],
                    'ingredients': 'Cauliflower, chickpea flour, buffalo sauce, vegan ranch',
                    'allergens': [],
                    'spice_level': 'medium',
                    'calories': 320,
                    'customization_options': [
                        {'name': 'Sauce', 'required': True, 'options': [
                            {'label': 'Buffalo', 'price': 0},
                            {'label': 'BBQ', 'price': 0},
                            {'label': 'Korean Gochujang', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Dips', 'items': [
                            {'label': 'Extra Ranch', 'price': 1},
                            {'label': 'Blue Cheese Dip', 'price': 1}
                        ]}
                    ],
                },
                {
                    'title': 'Acai Power Bowl',
                    'description': 'Blended acai topped with granola, fresh fruits, coconut, and honey drizzle.',
                    'price': 12.99,
                    'image_url': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 10,
                    'servings': 1,
                    'dietary_tags': ['Vegan', 'Gluten-Free', 'Dairy-Free'],
                    'ingredients': 'Acai, banana, berries, granola, coconut flakes, agave',
                    'allergens': ['Nuts'],
                    'spice_level': 'none',
                    'calories': 380,
                    'customization_options': [
                        {'name': 'Base', 'required': True, 'options': [
                            {'label': 'Acai', 'price': 0},
                            {'label': 'Pitaya (Dragon Fruit)', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Toppings', 'items': [
                            {'label': 'Peanut Butter', 'price': 1.50},
                            {'label': 'Extra Granola', 'price': 1},
                            {'label': 'Hemp Seeds', 'price': 1}
                        ]}
                    ],
                },
            ],
            'taco_king_roberto': [
                {
                    'title': 'Street Tacos (5 pcs)',
                    'description': 'Authentic Mexico City style tacos on handmade corn tortillas. Choice of meat.',
                    'price': 13.99,
                    'image_url': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop',
                    'cuisine_type': 'mexican',
                    'prep_time': 15,
                    'servings': 1,
                    'dietary_tags': ['Gluten-Free'],
                    'ingredients': 'Handmade tortillas, choice of meat, onion, cilantro, salsa',
                    'allergens': [],
                    'spice_level': 'medium',
                    'calories': 580,
                    'customization_options': [
                        {'name': 'Meat', 'required': True, 'options': [
                            {'label': 'Carne Asada', 'price': 0},
                            {'label': 'Al Pastor', 'price': 0},
                            {'label': 'Carnitas', 'price': 0},
                            {'label': 'Pollo', 'price': 0},
                            {'label': 'Lengua', 'price': 2}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Guacamole', 'price': 3},
                            {'label': 'Extra Salsa', 'price': 1}
                        ]}
                    ],
                },
                {
                    'title': 'Quesabirria Tacos (4 pcs)',
                    'description': 'Crispy birria-dipped tacos filled with tender beef and melted cheese. Served with consommé.',
                    'price': 16.99,
                    'image_url': 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&h=600&fit=crop',
                    'cuisine_type': 'mexican',
                    'prep_time': 20,
                    'servings': 1,
                    'dietary_tags': [],
                    'ingredients': 'Beef birria, cheese, corn tortillas, consommé',
                    'allergens': ['Dairy'],
                    'spice_level': 'medium',
                    'calories': 720,
                    'customization_options': [],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Consommé', 'price': 2},
                            {'label': 'Horchata', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Elote (Mexican Street Corn)',
                    'description': 'Grilled corn on the cob with mayo, cotija cheese, chili powder, and lime.',
                    'price': 5.99,
                    'image_url': 'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?w=800&h=600&fit=crop',
                    'cuisine_type': 'mexican',
                    'prep_time': 10,
                    'servings': 1,
                    'dietary_tags': ['Vegetarian', 'Gluten-Free'],
                    'ingredients': 'Corn, mayo, cotija cheese, tajin, lime',
                    'allergens': ['Dairy', 'Eggs'],
                    'spice_level': 'mild',
                    'calories': 220,
                    'customization_options': [
                        {'name': 'Style', 'required': True, 'options': [
                            {'label': 'On the Cob', 'price': 0},
                            {'label': 'In a Cup (Esquites)', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Extra Cheese', 'price': 1},
                            {'label': 'Extra Spicy', 'price': 0}
                        ]}
                    ],
                },
            ],
            'jamaican_jerk_marcus': [
                {
                    'title': 'Jerk Chicken Plate',
                    'description': 'Authentic Jamaican jerk chicken marinated 24 hours, smoked over pimento wood. Served with rice & peas.',
                    'price': 17.99,
                    'image_url': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 25,
                    'servings': 1,
                    'dietary_tags': ['Gluten-Free', 'Dairy-Free'],
                    'ingredients': 'Chicken, scotch bonnet, allspice, thyme, rice, kidney beans, coconut milk',
                    'allergens': [],
                    'spice_level': 'hot',
                    'calories': 750,
                    'customization_options': [
                        {'name': 'Spice Level', 'required': True, 'options': [
                            {'label': 'Mild', 'price': 0},
                            {'label': 'Medium', 'price': 0},
                            {'label': 'Jamaican Hot 🔥', 'price': 0}
                        ]},
                        {'name': 'Cut', 'required': True, 'options': [
                            {'label': 'Leg Quarter', 'price': 0},
                            {'label': 'Breast', 'price': 1},
                            {'label': 'Wings (6 pcs)', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Sides', 'items': [
                            {'label': 'Extra Rice & Peas', 'price': 3},
                            {'label': 'Fried Plantains', 'price': 4},
                            {'label': 'Festival (Fried Dumplings)', 'price': 3}
                        ]}
                    ],
                },
                {
                    'title': 'Oxtail Stew',
                    'description': 'Slow-braised oxtail in rich brown gravy with butter beans. A Jamaican delicacy!',
                    'price': 24.99,
                    'image_url': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 30,
                    'servings': 1,
                    'dietary_tags': ['Gluten-Free', 'Dairy-Free'],
                    'ingredients': 'Oxtail, butter beans, carrots, thyme, allspice, scotch bonnet',
                    'allergens': [],
                    'spice_level': 'medium',
                    'calories': 820,
                    'customization_options': [],
                    'add_ons': [
                        {'name': 'Sides', 'items': [
                            {'label': 'Rice & Peas', 'price': 3},
                            {'label': 'Steamed Cabbage', 'price': 3},
                            {'label': 'Fried Plantains', 'price': 4}
                        ]}
                    ],
                },
                {
                    'title': 'Jamaican Beef Patties (3 pcs)',
                    'description': 'Flaky golden pastry filled with seasoned ground beef. Perfect snack!',
                    'price': 9.99,
                    'image_url': 'https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?w=800&h=600&fit=crop',
                    'cuisine_type': 'other',
                    'prep_time': 15,
                    'servings': 1,
                    'dietary_tags': [],
                    'ingredients': 'Flaky pastry, seasoned beef, curry, thyme',
                    'allergens': ['Gluten'],
                    'spice_level': 'mild',
                    'calories': 420,
                    'customization_options': [
                        {'name': 'Filling', 'required': True, 'options': [
                            {'label': 'Beef', 'price': 0},
                            {'label': 'Chicken', 'price': 0},
                            {'label': 'Veggie', 'price': 0}
                        ]}
                    ],
                    'add_ons': [
                        {'name': 'Extras', 'items': [
                            {'label': 'Coco Bread', 'price': 2}
                        ]}
                    ],
                },
            ],
        }

        # Location offsets around CSUDH
        location_offsets = [
            (0.008, 0.008),    # NE - towards Compton
            (-0.012, 0.015),   # NW - towards Torrance
            (0.015, -0.008),   # SE - towards Long Beach
            (-0.008, -0.012),  # SW - towards Harbor City
            (0.003, 0.018),    # N - towards Gardena
            (-0.018, 0.003),   # W - towards Torrance
            (0.012, -0.015),   # S - towards Wilmington
            (-0.005, -0.005),  # Close to campus
            (0.006, 0.003),    # Near campus
            (-0.003, 0.008),   # Near campus
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

            # Download profile image
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
                    'rating': round(random.uniform(4.3, 5.0), 1),
                    'total_orders': random.randint(20, 100),
                }
            )

            # Create listings
            for j, listing_data in enumerate(listings_data.get(cook_data['username'], [])):
                offset = location_offsets[(i * 3 + j) % len(location_offsets)]
                
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
                    
                    # Download image
                    if listing_data.get('image_url'):
                        self.stdout.write(f'       📸 Downloading image...')
                        img_content = self.download_image(listing_data['image_url'])
                        if img_content:
                            listing.image.save(f'{listing.id}_{listing.title[:20]}.jpg', img_content, save=True)
                            self.stdout.write(f'       ✅ Image saved!')
                else:
                    self.stdout.write(f'    ⏭️  Exists: {listing.title}')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'🎓 CSUDH Area Done! Created {created_cooks} cooks and {created_listings} listings'))
        self.stdout.write('')
        self.stdout.write('📝 New test accounts (password: testpass123):')
        for cook in cooks_data:
            self.stdout.write(f'   - {cook["username"]}')