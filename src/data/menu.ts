export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'South Indian' | 'North Indian' | 'Chinese' | 'Fast Food' | 'Beverages' | 'Desserts' | 'Starters' | 'Healthy Food';
  image: string;
  description: string;
  isVeg: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  // South Indian
  { id: 'si1', name: 'Masala Dosa', price: 120, category: 'South Indian', image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80', description: 'Crispy rice crepe filled with spiced potato mash, served with coconut chutney and sambar.', isVeg: true },
  { id: 'si2', name: 'Idli Sambar', price: 80, category: 'South Indian', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', description: 'Soft steamed rice cakes served with flavorful lentil soup and chutneys.', isVeg: true },
  { id: 'si3', name: 'Meda Vada', price: 90, category: 'South Indian', image: 'https://images.unsplash.com/photo-1626132646529-5003375a9b12?auto=format&fit=crop&w=800&q=80', description: 'Savory fried lentil donuts, crispy on the outside and soft inside.', isVeg: true },
  { id: 'si4', name: 'Onion Uttapam', price: 110, category: 'South Indian', image: 'https://images.unsplash.com/photo-1630406184470-7fd4440e82ae?auto=format&fit=crop&w=800&q=80', description: 'Thick rice pancake topped with finely chopped onions and green chillies.', isVeg: true },
  { id: 'si5', name: 'Appam with Stew', price: 150, category: 'South Indian', image: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=800&q=80', description: 'Lacy fermented rice pancakes served with creamy coconut milk vegetable stew.', isVeg: true },
  { id: 'si6', name: 'Paniyaram', price: 100, category: 'South Indian', image: 'https://images.unsplash.com/photo-1645177623570-ad4b5a6556c4?auto=format&fit=crop&w=800&q=80', description: 'Small spiced steamed dumplings made from fermented rice and lentil batter.', isVeg: true },
  { id: 'si7', name: 'Rava Dosa', price: 130, category: 'South Indian', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80', description: 'Thin, lacy, and crispy semolina crepe with black pepper and cumin.', isVeg: true },
  { id: 'si8', name: 'Pongal', price: 110, category: 'South Indian', image: 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=800&q=80', description: 'Savory rice and lentil porridge tempered with black pepper, ginger, and cashews.', isVeg: true },
  { id: 'si9', name: 'Vada Pav', price: 50, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1606491956689-2ea8c5119c8c?auto=format&fit=crop&w=800&q=80', description: 'The classic Mumbai slider - spicy potato fritter in a bun.', isVeg: true },
  { id: 'si10', name: 'Set Dosa', price: 100, category: 'South Indian', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80', description: 'Soft and spongy small pancakes served in a set of three with sagu.', isVeg: true },
  
  // North Indian
  { id: 'ni1', name: 'Paneer Butter Masala', price: 280, category: 'North Indian', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', description: 'Soft cottage cheese cubes in a rich, creamy tomato and butter gravy.', isVeg: true },
  { id: 'ni2', name: 'Dal Makhani', price: 240, category: 'North Indian', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', description: 'Slow-cooked black lentils and kidney beans with cream and butter.', isVeg: true },
  { id: 'ni3', name: 'Butter Chicken', price: 350, category: 'North Indian', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', description: 'Tender tandoori chicken pieces in a velvety tomato-cream sauce.', isVeg: false },
  { id: 'ni4', name: 'Chole Bhature', price: 180, category: 'North Indian', image: 'https://images.unsplash.com/photo-1626132646529-5003375a9b12?auto=format&fit=crop&w=800&q=80', description: 'Spiced chickpea curry served with large, fluffy deep-fried bread.', isVeg: true },
  { id: 'ni5', name: 'Palak Paneer', price: 260, category: 'North Indian', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', description: 'Fresh cottage cheese in a smooth and nutritious spinach gravy.', isVeg: true },
  { id: 'ni6', name: 'Malai Kofta', price: 300, category: 'North Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', description: 'Fried potato and paneer balls in a creamy cashew-based gravy.', isVeg: true },
  { id: 'ni7', name: 'Butter Naan', price: 40, category: 'North Indian', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80', description: 'Soft and pillowy clay oven bread brushed with fresh butter.', isVeg: true },
  { id: 'ni8', name: 'Mutton Rogan Josh', price: 420, category: 'North Indian', image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80', description: 'Classic Kashmiri lamb curry cooked with aromatic spices and yogurt.', isVeg: false },
  { id: 'ni9', name: 'Aloo Gobi', price: 180, category: 'North Indian', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', description: 'Dry cauliflower and potato curry with ginger and turmeric.', isVeg: true },
  { id: 'ni10', name: 'Veg Biryani', price: 260, category: 'North Indian', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800&q=80', description: 'Fragrant basmati rice cooked with garden vegetables and aromatic spices.', isVeg: true },
  { id: 'ni11', name: 'Chicken Biryani', price: 320, category: 'North Indian', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80', description: 'Authentic Hyderabadi style chicken biryani with saffron rice.', isVeg: false },
  { id: 'ni12', name: 'Jeera Rice', price: 140, category: 'North Indian', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800&q=80', description: 'Basmati rice tempered with cumin seeds and ghee.', isVeg: true },
  { id: 'ni13', name: 'Tandoori Roti', price: 25, category: 'North Indian', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', description: 'Whole wheat bread cooked in a traditional clay oven.', isVeg: true },
  { id: 'ni14', name: 'Kadai Paneer', price: 290, category: 'North Indian', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', description: 'Paneer and bell peppers cooked in a spicy tomato-based gravy with kadai masala.', isVeg: true },

  // Chinese
  { id: 'ch1', name: 'Veg Manchurian', price: 220, category: 'Chinese', image: 'https://images.unsplash.com/photo-1512058560366-cd2427ff56f3?auto=format&fit=crop&w=800&q=80', description: 'Deep-fried vegetable balls in a spicy, tangy soy-based sauce.', isVeg: true },
  { id: 'ch2', name: 'Veg Hakka Noodles', price: 200, category: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80', description: 'Stir-fried noodles with crisp vegetables and Indo-Chinese spices.', isVeg: true },
  { id: 'ch3', name: 'Schezwan Fried Rice', price: 210, category: 'Chinese', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', description: 'Spicy wok-tossed rice with vegetables and fiery Schezwan sauce.', isVeg: true },
  { id: 'ch4', name: 'Veg Spring Rolls', price: 160, category: 'Chinese', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', description: 'Golden crispy rolls stuffed with seasoned shredded vegetables.', isVeg: true },
  { id: 'ch5', name: 'Chilli Paneer Dry', price: 240, category: 'Chinese', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=800&q=80', description: 'Paneer cubes tossed with bell peppers, onions, and spicy green chillies.', isVeg: true },
  { id: 'ch6', name: 'Honey Chilli Potato', price: 190, category: 'Chinese', image: 'https://images.unsplash.com/photo-1512058560366-cd2427ff56f3?auto=format&fit=crop&w=800&q=80', description: 'Crispy potato fingers glazed with honey and spicy chilli sauce.', isVeg: true },
  { id: 'ch7', name: 'Veg Momos Fried', price: 140, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b?auto=format&fit=crop&w=800&q=80', description: 'Crispy deep-fried vegetable dumplings.', isVeg: true },

  // Fast Food
  { id: 'ff1', name: 'Classic Veg Burger', price: 120, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80', description: 'Hearty veg patty with lettuce, tomato, and cheese in a toasted bun.', isVeg: true },
  { id: 'ff2', name: 'Peri Peri Fries', price: 110, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80', description: 'Golden crispy fries tossed in spicy Peri Peri seasoning.', isVeg: true },
  { id: 'ff3', name: 'Farmhouse Pizza', price: 320, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', description: 'Fresh pizza topped with mushrooms, corn, onions, and capsicum.', isVeg: true },
  { id: 'ff4', name: 'Cheese Corn Sandwich', price: 140, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', description: 'Grilled sandwich stuffed with sweet corn and melted mozzarella.', isVeg: true },
  { id: 'ff5', name: 'Veg Momos Steamed', price: 130, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b?auto=format&fit=crop&w=800&q=80', description: 'Delicate dumplings filled with minced vegetables, served with spicy dip.', isVeg: true },
  { id: 'ff6', name: 'Pav Bhaji', price: 150, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1606491956689-2ea8c5119c8c?auto=format&fit=crop&w=800&q=80', description: 'Spiced mashed vegetable curry served with buttered bread rolls.', isVeg: true },
  { id: 'ff7', name: 'Veg Grilled Club Sandwich', price: 180, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', description: 'Triple-layered sandwich with veggies, cheese, and house-made spread.', isVeg: true },

  // Beverages
  { id: 'bv1', name: 'Mango Lassi', price: 80, category: 'Beverages', image: 'https://images.unsplash.com/photo-1571006682868-a2d8f337b24f?auto=format&fit=crop&w=800&q=80', description: 'Thick and creamy yogurt drink blended with sweet Alphonso mangoes.', isVeg: true },
  { id: 'bv2', name: 'Cold Coffee', price: 110, category: 'Beverages', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80', description: 'Rich blended coffee with milk and a scoop of vanilla ice cream.', isVeg: true },
  { id: 'bv3', name: 'Fresh Lime Soda', price: 60, category: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', description: 'Refreshing sparkling lime drink, available sweet or salted.', isVeg: true },
  { id: 'bv4', name: 'Masala Chai', price: 30, category: 'Beverages', image: 'https://images.unsplash.com/photo-1544787210-2211d64b5655?auto=format&fit=crop&w=800&q=80', description: 'Traditional Indian tea brewed with ginger, cardamom, and spices.', isVeg: true },
  { id: 'bv5', name: 'Virgin Mojito', price: 120, category: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', description: 'Classic mocktail with fresh mint, lime, and soda.', isVeg: true },
  { id: 'bv6', name: 'Sweet Lassi', price: 70, category: 'Beverages', image: 'https://images.unsplash.com/photo-1571006682868-a2d8f337b24f?auto=format&fit=crop&w=800&q=80', description: 'Traditional Punjabi sweet yogurt drink.', isVeg: true },
  { id: 'bv7', name: 'Iced Tea', price: 90, category: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', description: 'Chilled tea with a hint of lemon and fresh mint leaves.', isVeg: true },
  { id: 'bv8', name: 'Buttermilk (Chaas)', price: 50, category: 'Beverages', image: 'https://images.unsplash.com/photo-1571006682868-a2d8f337b24f?auto=format&fit=crop&w=800&q=80', description: 'Refreshing spiced yogurt drink with roasted cumin and coriander.', isVeg: true },

  // Desserts
  { id: 'ds1', name: 'Gulab Jamun', price: 70, category: 'Desserts', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80', description: 'Warm, syrup-soaked milk dumplings flavored with cardamom.', isVeg: true },
  { id: 'ds2', name: 'Rasmalai', price: 90, category: 'Desserts', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80', description: 'Soft cottage cheese patties immersed in chilled saffron-infused milk.', isVeg: true },
  { id: 'ds3', name: 'Chocolate Brownie', price: 150, category: 'Desserts', image: 'https://images.unsplash.com/photo-1564355808539-22fda35bcd36?auto=format&fit=crop&w=800&q=80', description: 'Fudgy chocolate brownie served warm with chocolate drizzle.', isVeg: true },
  { id: 'ds4', name: 'Vanilla Ice Cream', price: 60, category: 'Desserts', image: 'https://images.unsplash.com/photo-1560008511-11c63416e52d?auto=format&fit=crop&w=800&q=80', description: 'Classic creamy vanilla bean ice cream.', isVeg: true },
  { id: 'ds5', name: 'Gajar Ka Halwa', price: 120, category: 'Desserts', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80', description: 'Traditional carrot pudding cooked with milk, ghee, and nuts.', isVeg: true },
  { id: 'ds6', name: 'Kulfi Falooda', price: 130, category: 'Desserts', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80', description: 'Traditional Indian ice cream with vermicelli and rose syrup.', isVeg: true },
  { id: 'ds7', name: 'Moong Dal Halwa', price: 140, category: 'Desserts', image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80', description: 'Rich and delicious lentil pudding cooked with ghee and dry fruits.', isVeg: true },

  // Starters
  { id: 'st1', name: 'Paneer Tikka', price: 220, category: 'Starters', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80', description: 'Chunks of paneer marinated in spices and grilled in a tandoor.', isVeg: true },
  { id: 'st2', name: 'Hara Bhara Kabab', price: 180, category: 'Starters', image: 'https://images.unsplash.com/photo-1626777552726-4a6b547b4e5c?auto=format&fit=crop&w=800&q=80', description: 'Healthy and delicious patties made with spinach, peas, and potatoes.', isVeg: true },
  { id: 'st3', name: 'Crispy Corn', price: 160, category: 'Starters', image: 'https://images.unsplash.com/photo-1512058560366-cd2427ff56f3?auto=format&fit=crop&w=800&q=80', description: 'Sweet corn kernels fried to perfection and tossed with spices.', isVeg: true },
  { id: 'st4', name: 'Chicken Tikka', price: 280, category: 'Starters', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80', description: 'Classic tandoori grilled chicken pieces with mint chutney.', isVeg: false },
  { id: 'st5', name: 'Veg Seekh Kabab', price: 200, category: 'Starters', image: 'https://images.unsplash.com/photo-1626777552726-4a6b547b4e5c?auto=format&fit=crop&w=800&q=80', description: 'Minced vegetable skewers grilled to perfection.', isVeg: true },
  { id: 'st6', name: 'Chilli Mushroom', price: 210, category: 'Starters', image: 'https://images.unsplash.com/photo-1512058560366-cd2427ff56f3?auto=format&fit=crop&w=800&q=80', description: 'Crispy fried mushrooms tossed in a spicy soy-chilli sauce.', isVeg: true },
  { id: 'st7', name: 'Chicken 65', price: 260, category: 'Starters', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80', description: 'Spicy, deep-fried chicken tempered with curry leaves and chillies.', isVeg: false },

  // Healthy Food
  { id: 'hf1', name: 'Quinoa Salad', price: 240, category: 'Healthy Food', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', description: 'Protein-rich quinoa with fresh cucumber, tomatoes, and lemon dressing.', isVeg: true },
  { id: 'hf2', name: 'Fresh Fruit Bowl', price: 180, category: 'Healthy Food', image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=800&q=80', description: 'A vibrant mix of seasonal fresh fruits.', isVeg: true },
  { id: 'hf3', name: 'Oats Khichdi', price: 160, category: 'Healthy Food', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', description: 'Light and nutritious oats cooked with yellow lentils and mild spices.', isVeg: true },
  { id: 'hf4', name: 'Sprouted Salad', price: 140, category: 'Healthy Food', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', description: 'Mixed sprouts with onions, tomatoes, and a dash of lime.', isVeg: true },
  { id: 'hf5', name: 'Boiled Egg Salad', price: 160, category: 'Healthy Food', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', description: 'Protein-packed salad with boiled eggs, greens, and light vinaigrette.', isVeg: false },
  { id: 'hf6', name: 'Vegetable Clear Soup', price: 120, category: 'Healthy Food', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', description: 'Light and nutritious broth with finely chopped seasonal vegetables.', isVeg: true },
];


export const FOOD_QUOTES = [
  "Food is the ingredient that binds us together.",
  "First, we eat. Then, we do everything else.",
  "People who love to eat are always the best people.",
  "Life is uncertain. Eat dessert first.",
  "Good food is the foundation of genuine happiness.",
  "There is no sincerer love than the love of food.",
  "One cannot think well, love well, sleep well, if one has not dined well.",
  "Laughter is brightest where food is best.",
  "Everything you see I owe to spaghetti.",
  "A recipe has no soul. You, as the cook, must bring soul to the recipe."
];
