const Order = require('../models/Order');
const Product = require('../models/Product');

// ========== Vehicle Configuration ==========
const VEHICLES = {
  mini: {
    name: '🛺 Mini Vehicle (Tempo/Chhakda)',
    capacity: '1 Ton',
    baseCost: 300,
    perKmRate: 15
  },
  medium: {
    name: '🚛 Medium Truck (Mini Truck)',
    capacity: '1-5 Tons',
    baseCost: 600,
    perKmRate: 25
  },
  large: {
    name: '🚚 Large Truck (Full Truck)',
    capacity: '5-15 Tons',
    baseCost: 1000,
    perKmRate: 40
  },
  heavy: {
    name: '🏗️ Heavy Vehicle (Trailer)',
    capacity: '15+ Tons',
    baseCost: 2000,
    perKmRate: 60
  }
};

// ========== Auto Suggest Vehicle Based on Category + Quantity ==========
const suggestVehicle = (category, quantity) => {
  switch (category) {
    case 'Bricks':
      if (quantity <= 3000) return 'mini';
      if (quantity <= 10000) return 'medium';
      if (quantity <= 30000) return 'large';
      return 'heavy';
    
    case 'Cement':
      if (quantity <= 200) return 'mini';
      if (quantity <= 500) return 'medium';
      if (quantity <= 1000) return 'large';
      return 'heavy';
    
    case 'Sand':
      if (quantity <= 2) return 'mini';
      if (quantity <= 10) return 'medium';
      if (quantity <= 25) return 'large';
      return 'heavy';
    
    case 'Steel':
      if (quantity <= 2000) return 'mini';
      if (quantity <= 5000) return 'medium';
      if (quantity <= 10000) return 'large';
      return 'heavy';
    
    default:
      if (quantity <= 1000) return 'mini';
      if (quantity <= 5000) return 'medium';
      if (quantity <= 15000) return 'large';
      return 'heavy';
  }
};

// ========== Calculate Transport Cost ==========
const calculateTransportCost = (vehicleType, distance) => {
  const vehicle = VEHICLES[vehicleType];
  if (!vehicle) return 0;
  
  const cost = vehicle.baseCost + (distance * vehicle.perKmRate);
  return Math.round(cost);
};

// ========== Minimum Order Quantities ==========
const MIN_ORDER_QTY = {
  'Bricks': 1000,
  'Cement': 50,
  'Sand': 5,
  'Steel': 500,
  'Other': 100
};

// @route   POST /api/orders
// @desc    Create new order (buyer only)
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
  try {
    const { 
      productId, 
      quantity, 
      transportRequired, 
      vehicleType, 
      deliveryAddress,
      estimatedDistance 
    } = req.body;

    console.log('📦 New order request:', req.body);

    // Validate basic fields
    if (!productId || !quantity) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide product ID and quantity' 
      });
    }

    // Get product details
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check minimum order quantity
    const minQty = product.minOrderQty || MIN_ORDER_QTY[product.category] || 100;
    
    if (quantity < minQty) {
      return res.status(400).json({ 
        success: false,
        message: `Minimum order quantity for ${product.category} is ${minQty} ${product.unit}s` 
      });
    }

    // Check stock
    if (product.quantity < quantity) {
      return res.status(400).json({ 
        success: false,
        message: `Only ${product.quantity} ${product.unit}s available` 
      });
    }

    // Calculate product cost
    const productCost = product.price * quantity;

    // Calculate transport cost
    let transportCost = 0;
    let finalVehicleType = 'none';
    let vehicleName = 'Self Pickup';

    if (transportRequired) {
      // Validate transport fields
      if (!deliveryAddress) {
        return res.status(400).json({ 
          success: false,
          message: 'Please provide delivery address' 
        });
      }

      // Use selected vehicle or auto suggest
      finalVehicleType = vehicleType || suggestVehicle(product.category, quantity);
      
      // Calculate distance (default 10km if not provided)
      const distance = estimatedDistance || 10;
      
      // Calculate transport cost
      transportCost = calculateTransportCost(finalVehicleType, distance);
      vehicleName = VEHICLES[finalVehicleType]?.name || 'Unknown Vehicle';

      console.log(`🚛 Transport: ${vehicleName}, Distance: ${distance}km, Cost: ₹${transportCost}`);
    }

    // Calculate total price
    const totalPrice = productCost + transportCost;

    console.log(`💰 Product: ₹${productCost} + Transport: ₹${transportCost} = Total: ₹${totalPrice}`);

    // Create order
    const order = await Order.create({
      product: productId,
      productName: product.name,
      seller: product.seller,
      sellerName: product.sellerName,
      buyer: req.user.id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      buyerPhone: req.user.phone,
      quantity,
      productCost,
      transportRequired: transportRequired || false,
      vehicleType: finalVehicleType,
      vehicleName,
      transportCost,
      deliveryAddress: deliveryAddress || '',
      estimatedDistance: estimatedDistance || 0,
      totalPrice
    });

    // Update product quantity
    product.quantity -= quantity;
    await product.save();

    console.log('✅ Order created successfully:', order._id);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Seller has been notified.',
      order
    });
  } catch (error) {
    console.error('❌ Order error:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   GET /api/orders/vehicle-suggest
// @desc    Get vehicle suggestion based on category and quantity
// @access  Public
exports.getVehicleSuggestion = async (req, res) => {
  try {
    const { category, quantity, distance } = req.query;

    if (!category || !quantity) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide category and quantity' 
      });
    }

    const vehicleType = suggestVehicle(category, Number(quantity));
    const vehicle = VEHICLES[vehicleType];
    const dist = Number(distance) || 10;
    const cost = calculateTransportCost(vehicleType, dist);

    res.json({
      success: true,
      suggestion: {
        vehicleType,
        vehicleName: vehicle.name,
        capacity: vehicle.capacity,
        baseCost: vehicle.baseCost,
        perKmRate: vehicle.perKmRate,
        distance: dist,
        totalCost: cost
      },
      allVehicles: Object.entries(VEHICLES).map(([key, val]) => ({
        type: key,
        name: val.name,
        capacity: val.capacity,
        cost: calculateTransportCost(key, dist)
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   GET /api/orders/buyer/me
// @desc    Get buyer's orders
// @access  Private (Buyer)
exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('product', 'name image category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   GET /api/orders/seller/me
// @desc    Get seller's received orders
// @access  Private (Seller)
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate('product', 'name image category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status (seller only)
// @access  Private (Seller)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if seller owns this order
    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // If cancelling, restore product quantity
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const product = await Product.findById(order.product);
      if (product) {
        product.quantity += order.quantity;
        await product.save();
        console.log(`📦 Restored ${order.quantity} units to product stock`);
      }
    }

    order.status = status;
    await order.save();

    console.log(`✅ Order ${order._id} status updated to: ${status}`);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};