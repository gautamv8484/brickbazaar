const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// ========== Connect DB ==========
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');
};

// ========== Seed Data ==========

// 5 Sellers
const sellers = [
  {
    name: 'Sharma Brick Works',
    email: 'sharma@bricks.com',
    phone: '9876543210',
    password: 'password123',
    role: 'seller',
    city: 'Ahmedabad',
    address: 'Industrial Area, Naroda, Ahmedabad',
    pincode: '382330',
    lat: 23.0225,
    lng: 72.5714,
    hasLocation: true
  },
  {
    name: 'Rajesh Cement Store',
    email: 'rajesh@cement.com',
    phone: '9876543211',
    password: 'password123',
    role: 'seller',
    city: 'Surat',
    address: 'Udhna, Surat, Gujarat',
    pincode: '394210',
    lat: 21.1702,
    lng: 72.8311,
    hasLocation: true
  },
  {
    name: 'Krishna Sand Traders',
    email: 'krishna@sand.com',
    phone: '9876543212',
    password: 'password123',
    role: 'seller',
    city: 'Vadodara',
    address: 'Gorwa, Vadodara, Gujarat',
    pincode: '390016',
    lat: 22.3072,
    lng: 73.1812,
    hasLocation: true
  },
  {
    name: 'Metro Steel Corp',
    email: 'metro@steel.com',
    phone: '9876543213',
    password: 'password123',
    role: 'seller',
    city: 'Rajkot',
    address: 'Aji Industrial Estate, Rajkot',
    pincode: '360003',
    lat: 22.3039,
    lng: 70.8022,
    hasLocation: true
  },
  {
    name: 'Green Bricks Ltd',
    email: 'green@bricks.com',
    phone: '9876543214',
    password: 'password123',
    role: 'seller',
    city: 'Gandhinagar',
    address: 'Sector 25, Gandhinagar, Gujarat',
    pincode: '382025',
    lat: 23.2156,
    lng: 72.6369,
    hasLocation: true
  }
];

// 5 Buyers
const buyers = [
  {
    name: 'Amit Patel',
    email: 'amit@buyer.com',
    phone: '9988776655',
    password: 'password123',
    role: 'buyer',
    city: 'Ahmedabad',
    address: 'Satellite, Ahmedabad',
    pincode: '380015',
    lat: 23.0300,
    lng: 72.5100,
    hasLocation: true
  },
  {
    name: 'Priya Shah',
    email: 'priya@buyer.com',
    phone: '9988776644',
    password: 'password123',
    role: 'buyer',
    city: 'Surat',
    address: 'Vesu, Surat',
    pincode: '395007',
    lat: 21.1500,
    lng: 72.7800,
    hasLocation: true
  },
  {
    name: 'Ravi Kumar',
    email: 'ravi@buyer.com',
    phone: '9988776633',
    password: 'password123',
    role: 'buyer',
    city: 'Vadodara',
    address: 'Alkapuri, Vadodara',
    pincode: '390007',
    lat: 22.3200,
    lng: 73.1700,
    hasLocation: true
  },
  {
    name: 'Sneha Desai',
    email: 'sneha@buyer.com',
    phone: '9988776622',
    password: 'password123',
    role: 'buyer',
    city: 'Rajkot',
    address: 'University Road, Rajkot',
    pincode: '360005',
    lat: 22.3100,
    lng: 70.7900,
    hasLocation: true
  },
  {
    name: 'Mohit Joshi',
    email: 'mohit@buyer.com',
    phone: '9988776611',
    password: 'password123',
    role: 'buyer',
    city: 'Gandhinagar',
    address: 'Sector 11, Gandhinagar',
    pincode: '382011',
    lat: 23.2200,
    lng: 72.6500,
    hasLocation: true
  }
];

// ========== Products (will be added after sellers created) ==========
const getProducts = (sellerMap) => [
  // Sharma Brick Works Products
  {
    name: 'Premium Red Clay Bricks',
    category: 'Bricks',
    price: 8,
    unit: 'piece',
    quantity: 50000,
    minOrderQty: 1000,
    description: 'High-quality handmade red clay bricks. Weather resistant and durable. Perfect for all types of construction.',
    image: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=600',
    location: 'Ahmedabad, Gujarat',
    seller: sellerMap['sharma@bricks.com']._id,
    sellerName: sellerMap['sharma@bricks.com'].name,
    sellerPhone: sellerMap['sharma@bricks.com'].phone,
    sellerEmail: 'sharma@bricks.com',
    sellerCity: 'Ahmedabad',
    sellerLat: 23.0225,
    sellerLng: 72.5714,
    hasSellerLocation: true,
    transportAvailable: true,
    selfPickupAvailable: true,
    rating: 4.8
  },
  {
    name: 'Fly Ash Bricks - Eco Friendly',
    category: 'Bricks',
    price: 6,
    unit: 'piece',
    quantity: 30000,
    minOrderQty: 1000,
    description: 'Eco-friendly fly ash bricks. Lighter than clay bricks. Great thermal insulation. ISI certified.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
    location: 'Ahmedabad, Gujarat',
    seller: sellerMap['sharma@bricks.com']._id,
    sellerName: sellerMap['sharma@bricks.com'].name,
    sellerPhone: sellerMap['sharma@bricks.com'].phone,
    sellerEmail: 'sharma@bricks.com',
    sellerCity: 'Ahmedabad',
    sellerLat: 23.0225,
    sellerLng: 72.5714,
    hasSellerLocation: true,
    transportAvailable: true,
    selfPickupAvailable: true,
    rating: 4.5
  },

  // Rajesh Cement Store Products
  {
    name: 'UltraTech OPC 53 Grade Cement',
    category: 'Cement',
    price: 380,
    unit: 'bag',
    quantity: 500,
    minOrderQty: 50,
    description: 'Premium OPC 53 grade cement. Ideal for RCC work, foundation and high-strength concrete.',
    image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600',
    location: 'Surat, Gujarat',
    seller: sellerMap['rajesh@cement.com']._id,
    sellerName: sellerMap['rajesh@cement.com'].name,
    sellerPhone: sellerMap['rajesh@cement.com'].phone,
    sellerEmail: 'rajesh@cement.com',
    sellerCity: 'Surat',
    sellerLat: 21.1702,
    sellerLng: 72.8311,
    hasSellerLocation: true,
    transportAvailable: true,
    selfPickupAvailable: true,
    rating: 4.6
  },
  {
    name: 'ACC PPC Cement 50kg',
    category: 'Cement',
    price: 360,
    unit: 'bag',
    quantity: 800,
    minOrderQty: 50,
    description: 'Portland Pozzolana Cement. Best for plastering, masonry and general construction.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600',
    location: 'Surat, Gujarat',
    seller: sellerMap['rajesh@cement.com']._id,
    sellerName: sellerMap['rajesh@cement.com'].name,
    sellerPhone: sellerMap['rajesh@cement.com'].phone,
    sellerEmail: 'rajesh@cement.com',
    sellerCity: 'Surat',
    sellerLat: 21.1702,
    sellerLng: 72.8311,
    hasSellerLocation: true,
    transportAvailable: false,
    selfPickupAvailable: true,
    rating: 4.4
  },

  // Krishna Sand Traders Products
  {
    name: 'River Sand Premium Quality',
    category: 'Sand',
    price: 1200,
    unit: 'ton',
    quantity: 100,
    minOrderQty: 5,
    description: 'Finest quality river sand. Perfectly graded for all construction. Clean and silt-free.',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600',
    location: 'Vadodara, Gujarat',
    seller: sellerMap['krishna@sand.com']._id,
    sellerName: sellerMap['krishna@sand.com'].name,
    sellerPhone: sellerMap['krishna@sand.com'].phone,
    sellerEmail: 'krishna@sand.com',
    sellerCity: 'Vadodara',
    sellerLat: 22.3072,
    sellerLng: 73.1812,
    hasSellerLocation: true,
    transportAvailable: true,
    selfPickupAvailable: false,
    rating: 4.9
  },
  {
    name: 'M-Sand (Manufactured Sand)',
    category: 'Sand',
    price: 900,
    unit: 'ton',
    quantity: 200,
    minOrderQty: 5,
    description: 'High quality manufactured sand. Consistent gradation. Better than river sand for plastering.',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600',
    location: 'Vadodara, Gujarat',
    seller: sellerMap['krishna@sand.com']._id,
    sellerName: sellerMap['krishna@sand.com'].name,
    sellerPhone: sellerMap['krishna@sand.com'].phone,
    sellerEmail: 'krishna@sand.com',
    sellerCity: 'Vadodara',
    sellerLat: 22.3072,
    sellerLng: 73.1812,
    hasSellerLocation: true,
    transportAvailable: true,
    selfPickupAvailable: false,
    rating: 4.3
  },

  // Metro Steel Corp Products
  {
    name: 'TATA TMT 500D Steel Bars',
    category: 'Steel',
    price: 65,
    unit: 'kg',
    quantity: 10000,
    minOrderQty: 500,
    description: 'High strength TATA TMT bars Fe500D grade. Earthquake resistant. Best for RCC construction.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    location: 'Rajkot, Gujarat',
    seller: sellerMap['metro@steel.com']._id,
    sellerName: sellerMap['metro@steel.com'].name,
    sellerPhone: sellerMap['metro@steel.com'].phone,
    sellerEmail: 'metro@steel.com',
    sellerCity: 'Rajkot',
    sellerLat: 22.3039,
    sellerLng: 70.8022,
    hasSellerLocation: true,
    transportAvailable: true,
    selfPickupAvailable: true,
    rating: 4.7
  },
  {
    name: 'JSW Steel TMT Bars Fe550',
    category: 'Steel',
    price: 68,
    unit: 'kg',
    quantity: 5000,
    minOrderQty: 500,
    description: 'JSW Fe550 grade steel bars. Ultra high strength. Suitable for large commercial projects.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    location: 'Rajkot, Gujarat',
    seller: sellerMap['metro@steel.com']._id,
    sellerName: sellerMap['metro@steel.com'].name,
    sellerPhone: sellerMap['metro@steel.com'].phone,
    sellerEmail: 'metro@steel.com',
    sellerCity: 'Rajkot',
    sellerLat: 22.3039,
    sellerLng: 70.8022,
    hasSellerLocation: true,
    transportAvailable: true,
    selfPickupAvailable: true,
    rating: 4.6
  },

  // Green Bricks Products
  {
    name: 'AAC Blocks - Autoclaved',
    category: 'Bricks',
    price: 45,
    unit: 'piece',
    quantity: 15000,
    minOrderQty: 1000,
    description: 'Autoclaved Aerated Concrete blocks. Lightweight and strong. 3x faster construction speed.',
    image: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=600',
    location: 'Gandhinagar, Gujarat',
    seller: sellerMap['green@bricks.com']._id,
    sellerName: sellerMap['green@bricks.com'].name,
    sellerPhone: sellerMap['green@bricks.com'].phone,
    sellerEmail: 'green@bricks.com',
    sellerCity: 'Gandhinagar',
    sellerLat: 23.2156,
    sellerLng: 72.6369,
    hasSellerLocation: true,
    transportAvailable: true,
    selfPickupAvailable: true,
    rating: 4.5
  },
  {
    name: 'Solid Concrete Blocks',
    category: 'Bricks',
    price: 25,
    unit: 'piece',
    quantity: 20000,
    minOrderQty: 1000,
    description: 'Heavy duty solid concrete blocks. Used for boundary walls and load bearing structures.',
    image: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=600',
    location: 'Gandhinagar, Gujarat',
    seller: sellerMap['green@bricks.com']._id,
    sellerName: sellerMap['green@bricks.com'].name,
    sellerPhone: sellerMap['green@bricks.com'].phone,
    sellerEmail: 'green@bricks.com',
    sellerCity: 'Gandhinagar',
    sellerLat: 23.2156,
    sellerLng: 72.6369,
    hasSellerLocation: true,
    transportAvailable: true,
    selfPickupAvailable: true,
    rating: 4.2
  }
];

// ========== Sample Orders ==========
const getOrders = (buyerMap, sellerMap, productMap) => [
  {
    product: productMap['Premium Red Clay Bricks']._id,
    productName: 'Premium Red Clay Bricks',
    seller: sellerMap['sharma@bricks.com']._id,
    sellerName: 'Sharma Brick Works',
    buyer: buyerMap['amit@buyer.com']._id,
    buyerName: 'Amit Patel',
    buyerEmail: 'amit@buyer.com',
    buyerPhone: '9988776655',
    quantity: 5000,
    productCost: 40000,
    transportRequired: true,
    vehicleType: 'medium',
    vehicleName: '🚛 Medium Truck (Mini Truck)',
    transportCost: 1100,
    deliveryAddress: 'Satellite, Ahmedabad - 380015',
    estimatedDistance: 20,
    totalPrice: 41100,
    status: 'completed'
  },
  {
    product: productMap['UltraTech OPC 53 Grade Cement']._id,
    productName: 'UltraTech OPC 53 Grade Cement',
    seller: sellerMap['rajesh@cement.com']._id,
    sellerName: 'Rajesh Cement Store',
    buyer: buyerMap['priya@buyer.com']._id,
    buyerName: 'Priya Shah',
    buyerEmail: 'priya@buyer.com',
    buyerPhone: '9988776644',
    quantity: 100,
    productCost: 38000,
    transportRequired: false,
    vehicleType: 'none',
    vehicleName: 'Self Pickup',
    transportCost: 0,
    deliveryAddress: '',
    estimatedDistance: 0,
    totalPrice: 38000,
    status: 'confirmed'
  },
  {
    product: productMap['TATA TMT 500D Steel Bars']._id,
    productName: 'TATA TMT 500D Steel Bars',
    seller: sellerMap['metro@steel.com']._id,
    sellerName: 'Metro Steel Corp',
    buyer: buyerMap['ravi@buyer.com']._id,
    buyerName: 'Ravi Kumar',
    buyerEmail: 'ravi@buyer.com',
    buyerPhone: '9988776633',
    quantity: 2000,
    productCost: 130000,
    transportRequired: true,
    vehicleType: 'large',
    vehicleName: '🚚 Large Truck (Full Truck)',
    transportCost: 2400,
    deliveryAddress: 'Alkapuri, Vadodara - 390007',
    estimatedDistance: 35,
    totalPrice: 132400,
    status: 'pending'
  },
  {
    product: productMap['River Sand Premium Quality']._id,
    productName: 'River Sand Premium Quality',
    seller: sellerMap['krishna@sand.com']._id,
    sellerName: 'Krishna Sand Traders',
    buyer: buyerMap['sneha@buyer.com']._id,
    buyerName: 'Sneha Desai',
    buyerEmail: 'sneha@buyer.com',
    buyerPhone: '9988776622',
    quantity: 10,
    productCost: 12000,
    transportRequired: true,
    vehicleType: 'medium',
    vehicleName: '🚛 Medium Truck (Mini Truck)',
    transportCost: 850,
    deliveryAddress: 'University Road, Rajkot - 360005',
    estimatedDistance: 10,
    totalPrice: 12850,
    status: 'pending'
  },
  {
    product: productMap['Fly Ash Bricks - Eco Friendly']._id,
    productName: 'Fly Ash Bricks - Eco Friendly',
    seller: sellerMap['sharma@bricks.com']._id,
    sellerName: 'Sharma Brick Works',
    buyer: buyerMap['mohit@buyer.com']._id,
    buyerName: 'Mohit Joshi',
    buyerEmail: 'mohit@buyer.com',
    buyerPhone: '9988776611',
    quantity: 3000,
    productCost: 18000,
    transportRequired: false,
    vehicleType: 'none',
    vehicleName: 'Self Pickup',
    transportCost: 0,
    deliveryAddress: '',
    estimatedDistance: 0,
    totalPrice: 18000,
    status: 'completed'
  }
];

// ========== Main Seed Function ==========
const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create Sellers
    console.log('👷 Creating sellers...');
    const createdSellers = await Promise.all(
      sellers.map(async (seller) => {
        const user = new User(seller);
        await user.save();
        return user;
      })
    );
    console.log(`✅ ${createdSellers.length} sellers created`);

    // Create Buyers
    console.log('🛒 Creating buyers...');
    const createdBuyers = await Promise.all(
      buyers.map(async (buyer) => {
        const user = new User(buyer);
        await user.save();
        return user;
      })
    );
    console.log(`✅ ${createdBuyers.length} buyers created`);

    // Create seller & buyer maps (email -> user)
    const sellerMap = {};
    createdSellers.forEach(s => { sellerMap[s.email] = s; });

    const buyerMap = {};
    createdBuyers.forEach(b => { buyerMap[b.email] = b; });

    // Create Products
    console.log('📦 Creating products...');
    const productData = getProducts(sellerMap);
    const createdProducts = await Product.insertMany(productData);
    console.log(`✅ ${createdProducts.length} products created`);

    // Create product map (name -> product)
    const productMap = {};
    createdProducts.forEach(p => { productMap[p.name] = p; });

    // Create Orders
    console.log('📋 Creating orders...');
    const orderData = getOrders(buyerMap, sellerMap, productMap);
    const createdOrders = await Order.insertMany(orderData);
    console.log(`✅ ${createdOrders.length} orders created`);

    // ========== Summary ==========
    console.log('\n====================================');
    console.log('🎉 SEED DATA CREATED SUCCESSFULLY!');
    console.log('====================================\n');

    console.log('📊 Summary:');
    console.log(`   👷 Sellers: ${createdSellers.length}`);
    console.log(`   🛒 Buyers:  ${createdBuyers.length}`);
    console.log(`   📦 Products: ${createdProducts.length}`);
    console.log(`   📋 Orders:  ${createdOrders.length}`);

    console.log('\n🔐 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SELLERS:');
    sellers.forEach(s => {
      console.log(`  📧 ${s.email} | 🔑 password123 | 🏙️  ${s.city}`);
    });
    console.log('\nBUYERS:');
    buyers.forEach(b => {
      console.log(`  📧 ${b.email} | 🔑 password123 | 🏙️  ${b.city}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

seedDB();