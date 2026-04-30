"""
Seed data for 50 mile radius around CSUDH, Carson CA
Creates 30+ cooks with 90+ listings across LA area

Run with: python manage.py seed_la_area
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import CookProfile
from listings.models import Listing
from decimal import Decimal
import random
import requests
from django.core.files.base import ContentFile

User = get_user_model()

# Cooks data - spread across LA area within 50 miles of CSUDH (33.8634, -118.2553)
COOKS_DATA = [
    # === SOUTH BAY ===
    {
        "username": "torrance_teriyaki_tom",
        "first_name": "Tom",
        "last_name": "Nakamura",
        "email": "tom@example.com",
        "lat": 33.8358, "lng": -118.3406,
        "bio": "Japanese home cooking passed down three generations. My teriyaki sauce is legendary!",
        "specialties": ["japanese"],
        "dishes": [
            {"title": "Chicken Teriyaki Bento", "price": "14.00", "cuisine": "japanese", "prep": 35, "desc": "Grilled chicken with house teriyaki, rice, pickled veggies, and miso soup"},
            {"title": "Tonkotsu Ramen", "price": "16.00", "cuisine": "japanese", "prep": 25, "desc": "Rich pork bone broth, chashu, soft egg, nori, green onions"},
            {"title": "Salmon Onigiri Set", "price": "10.00", "cuisine": "japanese", "prep": 20, "desc": "Three rice balls with salmon, umeboshi, and tuna mayo fillings"},
        ]
    },
    {
        "username": "hermosa_healthy_helen",
        "first_name": "Helen",
        "last_name": "Santos",
        "email": "helen@example.com",
        "lat": 33.8622, "lng": -118.3995,
        "bio": "Beach lifestyle meets clean eating. Açaí bowls and poke made fresh daily!",
        "specialties": ["american", "japanese"],
        "dishes": [
            {"title": "Açaí Power Bowl", "price": "13.00", "cuisine": "american", "prep": 10, "desc": "Organic açaí, granola, fresh berries, banana, honey drizzle"},
            {"title": "Ahi Poke Bowl", "price": "17.00", "cuisine": "japanese", "prep": 15, "desc": "Fresh ahi tuna, avocado, edamame, seaweed salad over rice"},
            {"title": "Green Goddess Smoothie Bowl", "price": "12.00", "cuisine": "american", "prep": 10, "desc": "Spinach, mango, banana, chia seeds, coconut flakes"},
        ]
    },
    {
        "username": "redondo_ricks_bbq",
        "first_name": "Rick",
        "last_name": "Johnson",
        "email": "rick@example.com",
        "lat": 33.8492, "lng": -118.3884,
        "bio": "Texas-style BBQ with California flair. Smoked low and slow in my backyard pit.",
        "specialties": ["american"],
        "dishes": [
            {"title": "Brisket Plate", "price": "22.00", "cuisine": "american", "prep": 20, "desc": "12-hour smoked brisket, coleslaw, baked beans, cornbread"},
            {"title": "Pulled Pork Sandwich", "price": "14.00", "cuisine": "american", "prep": 15, "desc": "Smoked pulled pork, tangy slaw, pickles on brioche"},
            {"title": "BBQ Rib Tips", "price": "16.00", "cuisine": "american", "prep": 15, "desc": "Tender rib tips with house BBQ sauce, fries, and ranch beans"},
        ]
    },
    
    # === LONG BEACH ===
    {
        "username": "cambodian_kitchen_sokha",
        "first_name": "Sokha",
        "last_name": "Chhim",
        "email": "sokha@example.com",
        "lat": 33.7701, "lng": -118.1937,
        "bio": "Authentic Cambodian recipes from my mother's kitchen in Phnom Penh.",
        "specialties": ["thai"],
        "dishes": [
            {"title": "Lok Lak", "price": "16.00", "cuisine": "thai", "prep": 25, "desc": "Marinated beef cubes, lime pepper sauce, over rice with fried egg"},
            {"title": "Chicken Amok", "price": "15.00", "cuisine": "thai", "prep": 35, "desc": "Coconut curry steamed in banana leaf, lemongrass, kaffir lime"},
            {"title": "Num Banh Chok", "price": "12.00", "cuisine": "thai", "prep": 20, "desc": "Rice noodles with green fish curry, fresh vegetables, herbs"},
        ]
    },
    {
        "username": "lb_vegan_vida",
        "first_name": "Vida",
        "last_name": "Martinez",
        "email": "vida@example.com",
        "lat": 33.7866, "lng": -118.1598,
        "bio": "Plant-based Mexican food that even my carnivore family loves!",
        "specialties": ["mexican"],
        "dishes": [
            {"title": "Jackfruit Carnitas Tacos", "price": "13.00", "cuisine": "mexican", "prep": 20, "desc": "Three tacos with slow-cooked jackfruit, pico, guac, cashew crema", "dietary": ["vegan", "vegetarian"]},
            {"title": "Cauliflower Al Pastor Bowl", "price": "14.00", "cuisine": "mexican", "prep": 25, "desc": "Roasted cauliflower, pineapple, cilantro rice, black beans", "dietary": ["vegan", "vegetarian"]},
            {"title": "Vegan Birria Quesadilla", "price": "15.00", "cuisine": "mexican", "prep": 30, "desc": "Mushroom birria, vegan cheese, consommé for dipping", "dietary": ["vegan", "vegetarian"]},
        ]
    },
    {
        "username": "signal_hill_sams_seafood",
        "first_name": "Sam",
        "last_name": "Nguyen",
        "email": "samnguyen@example.com",
        "lat": 33.8045, "lng": -118.1678,
        "bio": "Fresh seafood boils and Vietnamese-Cajun fusion. Get messy, eat good!",
        "specialties": ["vietnamese"],
        "dishes": [
            {"title": "Cajun Seafood Boil", "price": "28.00", "cuisine": "vietnamese", "prep": 40, "desc": "Shrimp, crawfish, mussels, corn, potatoes in garlic butter sauce"},
            {"title": "Vietnamese Garlic Noodles", "price": "14.00", "cuisine": "vietnamese", "prep": 20, "desc": "Egg noodles tossed in garlic butter, parmesan, topped with grilled shrimp"},
            {"title": "Crab Fried Rice", "price": "18.00", "cuisine": "vietnamese", "prep": 25, "desc": "Wok-fried rice with jumbo lump crab, egg, scallions"},
        ]
    },

    # === COMPTON / WATTS / SOUTH LA ===
    {
        "username": "compton_soul_queen",
        "first_name": "Denise",
        "last_name": "Washington",
        "email": "denise@example.com",
        "lat": 33.8958, "lng": -118.2201,
        "bio": "Soul food from the heart. Recipes from my grandma in Louisiana.",
        "specialties": ["african"],
        "dishes": [
            {"title": "Smothered Pork Chops", "price": "16.00", "cuisine": "african", "prep": 40, "desc": "Bone-in chops in rich onion gravy, rice, collard greens"},
            {"title": "Shrimp & Grits", "price": "18.00", "cuisine": "african", "prep": 30, "desc": "Cajun shrimp, creamy stone-ground grits, andouille sausage"},
            {"title": "Peach Cobbler", "price": "8.00", "cuisine": "african", "prep": 15, "desc": "Warm peach cobbler with buttery crust, serve with vanilla ice cream"},
        ]
    },
    {
        "username": "watts_wings_willie",
        "first_name": "Willie",
        "last_name": "Brown",
        "email": "willie@example.com",
        "lat": 33.9425, "lng": -118.2551,
        "bio": "Best wings in South LA. 20 flavors, always crispy, always fresh.",
        "specialties": ["american"],
        "dishes": [
            {"title": "Lemon Pepper Wings (10pc)", "price": "14.00", "cuisine": "american", "prep": 25, "desc": "Crispy wings tossed in zesty lemon pepper, ranch dip"},
            {"title": "Honey BBQ Wings (10pc)", "price": "14.00", "cuisine": "american", "prep": 25, "desc": "Sweet and smoky glazed wings with celery and blue cheese"},
            {"title": "Wing Combo Platter", "price": "22.00", "cuisine": "american", "prep": 30, "desc": "20 wings (2 flavors), fries, coleslaw, 2 drinks"},
        ]
    },

    # === INGLEWOOD / HAWTHORNE ===
    {
        "username": "inglewood_italian_gio",
        "first_name": "Giovanni",
        "last_name": "Rossi",
        "email": "gio@example.com",
        "lat": 33.9617, "lng": -118.3531,
        "bio": "Nonno's recipes from Napoli. Fresh pasta made daily in my kitchen.",
        "specialties": ["italian"],
        "dishes": [
            {"title": "Lasagna Bolognese", "price": "18.00", "cuisine": "italian", "prep": 30, "desc": "Layers of fresh pasta, beef ragù, béchamel, parmigiano"},
            {"title": "Chicken Parmigiana", "price": "17.00", "cuisine": "italian", "prep": 35, "desc": "Breaded cutlet, marinara, melted mozzarella, spaghetti"},
            {"title": "Tiramisu", "price": "9.00", "cuisine": "italian", "prep": 10, "desc": "Classic espresso-soaked ladyfingers, mascarpone, cocoa"},
        ]
    },
    {
        "username": "hawthorne_hot_pot_li",
        "first_name": "Li",
        "last_name": "Chen",
        "email": "lichen@example.com",
        "lat": 33.9164, "lng": -118.3526,
        "bio": "Sichuan flavors that bring the heat! Hot pot kits and mapo tofu specialist.",
        "specialties": ["chinese"],
        "dishes": [
            {"title": "Mapo Tofu", "price": "13.00", "cuisine": "chinese", "prep": 20, "desc": "Silken tofu in spicy doubanjiang sauce with ground pork, rice"},
            {"title": "Dan Dan Noodles", "price": "12.00", "cuisine": "chinese", "prep": 20, "desc": "Spicy sesame noodles with minced pork, chili oil, peanuts"},
            {"title": "Hot Pot Kit for 2", "price": "35.00", "cuisine": "chinese", "prep": 45, "desc": "Sichuan broth base, sliced meats, vegetables, noodles, dipping sauces"},
        ]
    },

    # === DOWNTOWN LA / ARTS DISTRICT ===
    {
        "username": "dtla_dumpling_dave",
        "first_name": "David",
        "last_name": "Wu",
        "email": "davidwu@example.com",
        "lat": 34.0407, "lng": -118.2468,
        "bio": "Hand-folded dumplings, 15 varieties. Former dim sum chef gone indie.",
        "specialties": ["chinese"],
        "dishes": [
            {"title": "Pork & Chive Dumplings (12)", "price": "14.00", "cuisine": "chinese", "prep": 25, "desc": "Classic juicy pork dumplings, black vinegar dipping sauce"},
            {"title": "Soup Dumplings XLB (8)", "price": "16.00", "cuisine": "chinese", "prep": 30, "desc": "Shanghai-style xiao long bao, ginger soy"},
            {"title": "Veggie Crystal Dumplings (10)", "price": "13.00", "cuisine": "chinese", "prep": 25, "desc": "Translucent skin, shiitake, cabbage, carrot filling", "dietary": ["vegan", "vegetarian"]},
        ]
    },
    {
        "username": "arts_district_arturo",
        "first_name": "Arturo",
        "last_name": "Gomez",
        "email": "arturo@example.com",
        "lat": 34.0373, "lng": -118.2316,
        "bio": "Oaxacan street food with modern twists. Mole is my love language.",
        "specialties": ["mexican"],
        "dishes": [
            {"title": "Mole Negro Enchiladas", "price": "16.00", "cuisine": "mexican", "prep": 25, "desc": "Three enchiladas in complex black mole, crema, sesame"},
            {"title": "Tlayuda", "price": "14.00", "cuisine": "mexican", "prep": 20, "desc": "Crispy Oaxacan tortilla, black beans, cheese, chorizo, avocado"},
            {"title": "Mezcal Marinated Carne Asada", "price": "19.00", "cuisine": "mexican", "prep": 30, "desc": "Grilled steak, nopales, charred salsa, fresh tortillas"},
        ]
    },

    # === KOREATOWN ===
    {
        "username": "ktown_kimchi_kim",
        "first_name": "Eunji",
        "last_name": "Kim",
        "email": "eunji@example.com",
        "lat": 34.0577, "lng": -118.3003,
        "bio": "Homestyle Korean comfort food. My kimchi ferments 3 weeks for perfect tang!",
        "specialties": ["korean"],
        "dishes": [
            {"title": "Kimchi Jjigae", "price": "14.00", "cuisine": "korean", "prep": 25, "desc": "Spicy kimchi stew with pork belly, tofu, rice"},
            {"title": "Bulgogi Plate", "price": "17.00", "cuisine": "korean", "prep": 20, "desc": "Marinated beef, rice, banchan (5 sides), lettuce wraps"},
            {"title": "Korean Fried Chicken", "price": "18.00", "cuisine": "korean", "prep": 35, "desc": "Double-fried crispy chicken, yangnyeom & garlic soy sauces"},
        ]
    },
    {
        "username": "ktown_soon_tofu_park",
        "first_name": "James",
        "last_name": "Park",
        "email": "jamespark@example.com",
        "lat": 34.0621, "lng": -118.3089,
        "bio": "Soon tofu specialist. Every bowl made to order, choose your spice level!",
        "specialties": ["korean"],
        "dishes": [
            {"title": "Seafood Soon Tofu", "price": "15.00", "cuisine": "korean", "prep": 20, "desc": "Bubbling soft tofu stew, shrimp, clams, mussels, egg, rice"},
            {"title": "Beef Soon Tofu", "price": "14.00", "cuisine": "korean", "prep": 20, "desc": "Tender beef in spicy silken tofu stew, banchan, rice"},
            {"title": "Dolsot Bibimbap", "price": "16.00", "cuisine": "korean", "prep": 25, "desc": "Hot stone bowl rice, vegetables, beef, gochujang, crispy rice"},
        ]
    },

    # === SANTA MONICA / WESTSIDE ===
    {
        "username": "santa_monica_sara",
        "first_name": "Sara",
        "last_name": "Mitchell",
        "email": "sara@example.com",
        "lat": 34.0195, "lng": -118.4912,
        "bio": "Farm-to-table California cuisine. Everything organic, everything fresh.",
        "specialties": ["american", "mediterranean"],
        "dishes": [
            {"title": "Grilled Salmon Bowl", "price": "19.00", "cuisine": "american", "prep": 25, "desc": "Wild salmon, quinoa, roasted vegetables, lemon tahini"},
            {"title": "Farmers Market Salad", "price": "14.00", "cuisine": "american", "prep": 15, "desc": "Seasonal greens, avocado, citrus, toasted seeds, champagne vinaigrette", "dietary": ["vegan", "vegetarian", "gluten_free"]},
            {"title": "Grass-Fed Burger", "price": "17.00", "cuisine": "american", "prep": 20, "desc": "1/3 lb patty, aged cheddar, caramelized onions, brioche, hand-cut fries"},
        ]
    },
    {
        "username": "venice_vegan_victor",
        "first_name": "Victor",
        "last_name": "Reyes",
        "email": "victorr@example.com",
        "lat": 33.9850, "lng": -118.4695,
        "bio": "Plant-based chef making comfort food that happens to be vegan.",
        "specialties": ["american"],
        "dishes": [
            {"title": "Impossible Burger Deluxe", "price": "16.00", "cuisine": "american", "prep": 20, "desc": "Impossible patty, vegan cheese, special sauce, fries", "dietary": ["vegan", "vegetarian"]},
            {"title": "Cauliflower Wings", "price": "13.00", "cuisine": "american", "prep": 25, "desc": "Crispy buffalo cauliflower, vegan ranch, celery", "dietary": ["vegan", "vegetarian"]},
            {"title": "Loaded Vegan Nachos", "price": "15.00", "cuisine": "mexican", "prep": 20, "desc": "Chips, cashew queso, black beans, pico, guac, jalapeños", "dietary": ["vegan", "vegetarian"]},
        ]
    },

    # === EAST LA / BOYLE HEIGHTS ===
    {
        "username": "boyle_heights_birria_beto",
        "first_name": "Roberto",
        "last_name": "Hernandez",
        "email": "beto@example.com",
        "lat": 34.0339, "lng": -118.2095,
        "bio": "Birria is life. Family recipe from Jalisco, perfected over 40 years.",
        "specialties": ["mexican"],
        "dishes": [
            {"title": "Birria Tacos (4)", "price": "16.00", "cuisine": "mexican", "prep": 20, "desc": "Slow-braised beef, melted cheese, consommé, onion, cilantro"},
            {"title": "Birria Ramen", "price": "17.00", "cuisine": "mexican", "prep": 25, "desc": "Fusion bowl: ramen noodles in birria consommé, braised beef, soft egg"},
            {"title": "Quesabirria", "price": "14.00", "cuisine": "mexican", "prep": 15, "desc": "Giant birria quesadilla, crispy cheese edges, consommé"},
        ]
    },
    {
        "username": "el_sereno_empanadas",
        "first_name": "Lucia",
        "last_name": "Vargas",
        "email": "lucia@example.com",
        "lat": 34.0745, "lng": -118.1765,
        "bio": "Argentine empanadas baked fresh. Crispy, flaky, addictive!",
        "specialties": ["other"],
        "dishes": [
            {"title": "Empanada Sampler (6)", "price": "18.00", "cuisine": "other", "prep": 25, "desc": "Two each: beef, chicken, spinach & cheese"},
            {"title": "Carne Empanadas (4)", "price": "14.00", "cuisine": "other", "prep": 20, "desc": "Ground beef, olives, egg, cumin, chimichurri"},
            {"title": "Dulce de Leche Empanadas (3)", "price": "10.00", "cuisine": "other", "prep": 15, "desc": "Sweet pastry filled with creamy caramel"},
        ]
    },

    # === PASADENA / SGV ===
    {
        "username": "pasadena_persian_pari",
        "first_name": "Pari",
        "last_name": "Tehrani",
        "email": "pari@example.com",
        "lat": 34.1478, "lng": -118.1445,
        "bio": "Persian home cooking with love. Saffron rice, tender kabobs, fragrant stews.",
        "specialties": ["middle_eastern"],
        "dishes": [
            {"title": "Koobideh Plate", "price": "18.00", "cuisine": "middle_eastern", "prep": 30, "desc": "Two ground beef kabobs, saffron rice, grilled tomato, sumac onions"},
            {"title": "Ghormeh Sabzi", "price": "16.00", "cuisine": "middle_eastern", "prep": 25, "desc": "Herb stew with beef, kidney beans, dried lime, basmati rice"},
            {"title": "Tahdig", "price": "12.00", "cuisine": "middle_eastern", "prep": 35, "desc": "Crispy saffron rice bottom, the crown jewel of Persian cooking"},
        ]
    },
    {
        "username": "sgv_dim_sum_danny",
        "first_name": "Danny",
        "last_name": "Leung",
        "email": "danny@example.com",
        "lat": 34.0689, "lng": -118.0298,
        "bio": "Dim sum chef for 25 years. Now making fresh to order for neighbors.",
        "specialties": ["chinese"],
        "dishes": [
            {"title": "Dim Sum Combo", "price": "22.00", "cuisine": "chinese", "prep": 35, "desc": "Har gow, siu mai, char siu bao, cheung fun (12 pieces total)"},
            {"title": "BBQ Pork Buns (4)", "price": "10.00", "cuisine": "chinese", "prep": 20, "desc": "Fluffy steamed buns filled with sweet BBQ pork"},
            {"title": "Egg Tarts (6)", "price": "9.00", "cuisine": "chinese", "prep": 15, "desc": "Flaky pastry, silky custard, Hong Kong style"},
        ]
    },

    # === ANAHEIM / ORANGE COUNTY ===
    {
        "username": "anaheim_arepas_ana",
        "first_name": "Ana",
        "last_name": "Rodriguez",
        "email": "anar@example.com",
        "lat": 33.8353, "lng": -117.9145,
        "bio": "Venezuelan comfort food. Arepas stuffed with love and lots of cheese!",
        "specialties": ["caribbean"],
        "dishes": [
            {"title": "Reina Pepiada Arepa", "price": "12.00", "cuisine": "caribbean", "prep": 20, "desc": "Crispy corn cake stuffed with chicken, avocado, mayo"},
            {"title": "Pabellón Criollo", "price": "16.00", "cuisine": "caribbean", "prep": 30, "desc": "Shredded beef, black beans, rice, fried plantains"},
            {"title": "Tequeños (8)", "price": "10.00", "cuisine": "caribbean", "prep": 15, "desc": "Crispy cheese sticks wrapped in dough, guava dipping sauce"},
        ]
    },
    {
        "username": "fullerton_filipino_food",
        "first_name": "Miguel",
        "last_name": "Santos",
        "email": "miguels@example.com",
        "lat": 33.8703, "lng": -117.9242,
        "bio": "Filipino classics from my lola's kitchen. Adobo, sinigang, and more!",
        "specialties": ["other"],
        "dishes": [
            {"title": "Chicken Adobo", "price": "14.00", "cuisine": "other", "prep": 35, "desc": "Braised in soy, vinegar, garlic, bay leaves. Rice included"},
            {"title": "Pork Sinigang", "price": "15.00", "cuisine": "other", "prep": 40, "desc": "Tamarind sour soup with pork belly, vegetables, rice"},
            {"title": "Lumpia Shanghai (12)", "price": "12.00", "cuisine": "other", "prep": 20, "desc": "Crispy pork spring rolls, sweet chili dipping sauce"},
        ]
    },
    {
        "username": "irvine_indian_indira",
        "first_name": "Indira",
        "last_name": "Sharma",
        "email": "indira@example.com",
        "lat": 33.6846, "lng": -117.8265,
        "bio": "North Indian home cooking. Fresh naan baked in my tandoor oven!",
        "specialties": ["indian"],
        "dishes": [
            {"title": "Butter Chicken", "price": "16.00", "cuisine": "indian", "prep": 30, "desc": "Creamy tomato curry, tender chicken, basmati rice, naan"},
            {"title": "Lamb Biryani", "price": "19.00", "cuisine": "indian", "prep": 45, "desc": "Fragrant layered rice with spiced lamb, saffron, raita"},
            {"title": "Vegetable Samosas (4)", "price": "10.00", "cuisine": "indian", "prep": 20, "desc": "Crispy pastry, spiced potato & pea filling, chutneys", "dietary": ["vegetarian"]},
        ]
    },

    # === HUNTINGTON BEACH / COSTA MESA ===
    {
        "username": "hb_hawaiian_hank",
        "first_name": "Hank",
        "last_name": "Kalani",
        "email": "hank@example.com",
        "lat": 33.6595, "lng": -117.9988,
        "bio": "Aloha! Hawaiian plate lunches that'll transport you to the islands.",
        "specialties": ["other"],
        "dishes": [
            {"title": "Kalua Pork Plate", "price": "16.00", "cuisine": "other", "prep": 20, "desc": "Smoky pulled pork, mac salad, rice, cabbage"},
            {"title": "Loco Moco", "price": "14.00", "cuisine": "other", "prep": 20, "desc": "Rice, beef patty, fried egg, brown gravy"},
            {"title": "Spam Musubi (3)", "price": "9.00", "cuisine": "other", "prep": 15, "desc": "Grilled spam on rice, wrapped in nori"},
        ]
    },
    {
        "username": "costa_mesa_crepes_claire",
        "first_name": "Claire",
        "last_name": "Dubois",
        "email": "claire@example.com",
        "lat": 33.6411, "lng": -117.9187,
        "bio": "French-trained pastry chef. Sweet and savory crêpes made with love.",
        "specialties": ["french"],
        "dishes": [
            {"title": "Ham & Gruyère Crêpe", "price": "13.00", "cuisine": "french", "prep": 15, "desc": "Savory buckwheat crêpe, ham, melted Gruyère, fried egg"},
            {"title": "Nutella Banana Crêpe", "price": "11.00", "cuisine": "french", "prep": 15, "desc": "Sweet crêpe, Nutella, fresh banana, whipped cream"},
            {"title": "Croque Monsieur", "price": "14.00", "cuisine": "french", "prep": 20, "desc": "Classic French grilled ham & cheese, béchamel, side salad"},
        ]
    },

    # === GLENDALE / BURBANK ===
    {
        "username": "glendale_greek_george",
        "first_name": "George",
        "last_name": "Papadopoulos",
        "email": "georgep@example.com",
        "lat": 34.1425, "lng": -118.2551,
        "bio": "Opa! Greek family recipes from my village in Crete. Fresh, healthy, delicious.",
        "specialties": ["mediterranean"],
        "dishes": [
            {"title": "Lamb Gyro Plate", "price": "17.00", "cuisine": "mediterranean", "prep": 20, "desc": "Seasoned lamb, tzatziki, tomato, onion, pita, Greek salad"},
            {"title": "Moussaka", "price": "16.00", "cuisine": "mediterranean", "prep": 35, "desc": "Layered eggplant, spiced meat, potatoes, creamy béchamel"},
            {"title": "Spanakopita", "price": "12.00", "cuisine": "mediterranean", "prep": 20, "desc": "Flaky phyllo, spinach & feta filling, lemon wedge", "dietary": ["vegetarian"]},
        ]
    },
    {
        "username": "burbank_breakfast_beth",
        "first_name": "Beth",
        "last_name": "Anderson",
        "email": "beth@example.com",
        "lat": 34.1808, "lng": -118.3090,
        "bio": "All-day breakfast specialist. Fluffy pancakes, perfect eggs, crispy bacon.",
        "specialties": ["american"],
        "dishes": [
            {"title": "Classic Breakfast Plate", "price": "14.00", "cuisine": "american", "prep": 20, "desc": "3 eggs any style, bacon or sausage, hash browns, toast"},
            {"title": "Blueberry Pancake Stack", "price": "13.00", "cuisine": "american", "prep": 20, "desc": "Three fluffy pancakes, fresh blueberries, maple syrup, butter"},
            {"title": "Avocado Toast Deluxe", "price": "15.00", "cuisine": "american", "prep": 15, "desc": "Sourdough, smashed avo, poached eggs, everything seasoning, microgreens"},
        ]
    },

    # === MORE SOUTH BAY ===
    {
        "username": "gardena_grandmas_cooking",
        "first_name": "Yuki",
        "last_name": "Tanaka",
        "email": "yuki@example.com",
        "lat": 33.8883, "lng": -118.3090,
        "bio": "Japanese-American fusion. Grandma's comfort food with SoCal flair.",
        "specialties": ["japanese"],
        "dishes": [
            {"title": "Katsu Curry", "price": "16.00", "cuisine": "japanese", "prep": 30, "desc": "Crispy pork cutlet, rich curry sauce, rice, pickles"},
            {"title": "Omurice", "price": "14.00", "cuisine": "japanese", "prep": 25, "desc": "Fluffy omelette over ketchup fried rice, demi-glace"},
            {"title": "Mentaiko Pasta", "price": "15.00", "cuisine": "japanese", "prep": 20, "desc": "Spaghetti with spicy cod roe, butter, nori, shiso"},
        ]
    },
    {
        "username": "lawndale_lumpia_lita",
        "first_name": "Lita",
        "last_name": "Cruz",
        "email": "litac@example.com",
        "lat": 33.8872, "lng": -118.3526,
        "bio": "Filipino party food specialist. Let me cater your next celebration!",
        "specialties": ["other"],
        "dishes": [
            {"title": "Party Platter - 50 Lumpia", "price": "35.00", "cuisine": "other", "prep": 45, "desc": "Crispy pork & veggie spring rolls, sweet chili sauce"},
            {"title": "Pancit Bihon", "price": "14.00", "cuisine": "other", "prep": 30, "desc": "Stir-fried rice noodles, chicken, vegetables, calamansi"},
            {"title": "Lechon Kawali", "price": "18.00", "cuisine": "other", "prep": 40, "desc": "Crispy deep-fried pork belly, liver sauce, rice"},
        ]
    },
]

# Unsplash food images
FOOD_IMAGES = [
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
    "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800",
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800",
    "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=800",
]


class Command(BaseCommand):
    help = 'Seed database with 30+ cooks across LA area (50 mile radius from CSUDH)'

    def download_image(self, url):
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return ContentFile(response.content)
        except:
            pass
        return None

    def handle(self, *args, **options):
        created_cooks = 0
        created_listings = 0

        for cook_data in COOKS_DATA:
            user, created = User.objects.get_or_create(
                username=cook_data["username"],
                defaults={
                    "email": cook_data["email"],
                    "first_name": cook_data["first_name"],
                    "last_name": cook_data["last_name"],
                    "is_cook": True,
                    "latitude": cook_data["lat"],
                    "longitude": cook_data["lng"],
                }
            )

            if created:
                user.set_password("testpass123")
                user.save()
                created_cooks += 1
                self.stdout.write(self.style.SUCCESS(f"✅ Created cook: {cook_data['username']}"))
            else:
                self.stdout.write(f"⏭️  Cook exists: {cook_data['username']}")

            profile, _ = CookProfile.objects.get_or_create(
                user=user,
                defaults={
                    "bio": cook_data["bio"],
                    "cuisine_specialties": cook_data["specialties"],
                    "years_experience": random.randint(2, 15),
                    "accepted_payments": ["cash", "venmo", "zelle"],
                    "available_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                    "pickup_instructions": "Text when you arrive and I'll bring it out!",
                }
            )

            for dish in cook_data["dishes"]:
                listing, listing_created = Listing.objects.get_or_create(
                    cook=user,
                    title=dish["title"],
                    defaults={
                        "description": dish["desc"],
                        "price": Decimal(dish["price"]),
                        "cuisine_type": dish["cuisine"],
                        "prep_time": dish["prep"],
                        "latitude": cook_data["lat"] + random.uniform(-0.005, 0.005),
                        "longitude": cook_data["lng"] + random.uniform(-0.005, 0.005),
                        "available": True,
                        "dietary_tags": dish.get("dietary", []),
                    }
                )

                if listing_created:
                    img_url = random.choice(FOOD_IMAGES)
                    img_content = self.download_image(img_url)
                    if img_content:
                        filename = f"{dish['title'].lower().replace(' ', '_')[:30]}.jpg"
                        listing.image.save(filename, img_content, save=True)

                    created_listings += 1
                    self.stdout.write(f"   📝 Created: {dish['title']}")

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Done! Created {created_cooks} cooks and {created_listings} listings"))
