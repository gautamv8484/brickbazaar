import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { productAPI, orderAPI, uploadAPI } from "../services/api";
import { Link, Navigate } from "react-router-dom";
import Modal from "../components/Modal";
import { toast } from "react-toastify";
import OrderTimeline from "../components/OrderTimeline";
import {
  FiPackage,
  FiChevronUp,   
  FiChevronDown,
  FiShoppingCart,
  FiDollarSign,
  FiPlusCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiEdit,
  FiImage,
  FiSave,
  FiX,
  FiMapPin,
  FiLayers,
  FiFileText,
  FiTruck,
} from "react-icons/fi";

const SellerDashboard = () => {
  const { user, isAuthenticated, isSeller } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  // Edit Product States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "Bricks",
    price: "",
    unit: "piece",
    quantity: "",
    description: "",
    image: "",
    location: "",
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeOrderFilter, setActiveOrderFilter] = useState("all");
  // Redirect if not seller
  if (!isAuthenticated || !isSeller) {
    return <Navigate to="/login" />;
  }

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getMyProducts(),
        orderAPI.getSellerOrders(),
      ]);

      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  //
  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  const filteredOrders =
    activeOrderFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeOrderFilter);

  // ========== Edit Product Functions ==========

  // Open edit modal with product data
  const handleEditClick = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit,
      quantity: product.quantity,
      description: product.description,
      image: product.image,
      location: product.location,
    });
    setEditImagePreview(product.image);
    setEditImageFile(null);
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Handle edit image selection
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove edit image
  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(editProduct?.image || "");
  };

  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      let imageUrl = editForm.image;

      // Upload new image if selected
      if (editImageFile) {
        setUploading(true);
        console.log("📤 Uploading new image...");

        const uploadRes = await uploadAPI.uploadImage(editImageFile);
        imageUrl = `${process.env.REACT_APP_API_URL}${uploadRes.data.imageUrl}`;

        console.log("✅ Image uploaded:", imageUrl);
        setUploading(false);
      }

      // Update product
      const updateData = {
        name: editForm.name,
        category: editForm.category,
        price: Number(editForm.price),
        unit: editForm.unit,
        quantity: Number(editForm.quantity),
        description: editForm.description,
        image: imageUrl,
        location: editForm.location,
      };

      console.log("📦 Updating product:", editProduct._id);

      const response = await productAPI.update(editProduct._id, updateData);
      console.log("✅ Product updated:", response.data);

      toast.success("Product updated successfully! 🎉");
      setShowEditModal(false);
      setEditProduct(null);
      setEditImageFile(null);
      setEditImagePreview(null);

      // Refresh products
      fetchData();
    } catch (error) {
      console.error("❌ Update error:", error);
      const message =
        error.response?.data?.message || "Failed to update product";
      toast.error(message);
    } finally {
      setEditLoading(false);
      setUploading(false);
    }
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditProduct(null);
    setEditForm({
      name: "",
      category: "Bricks",
      price: "",
      unit: "piece",
      quantity: "",
      description: "",
      image: "",
      location: "",
    });
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  // ========== Order & Delete Functions ==========

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order ${newStatus}!`);
      fetchData();
    } catch (err) {
      console.error("❌ Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    )
      return;

    try {
      await productAPI.delete(productId);
      toast.success("Product deleted!");
      fetchData();
    } catch (err) {
      console.error("❌ Error deleting product:", err);
      toast.error("Failed to delete product");
    }
  };

  // ========== Stats ==========
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "confirmed":
        return "status-confirmed";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const defaultImage =
    "https://images.unsplash.com/photo-1590075865003-e48277faa558?w=50";

  return (
    <div className="dashboard-page">
      <div className="dashboard-header seller">
        <div className="dashboard-header-content">
          <div className="dashboard-welcome">
            <h1>Hello, {user?.name}! 👋</h1>
            <p>Welcome to your seller dashboard</p>
          </div>
          <Link to="/seller/add-product" className="btn btn-primary">
            <FiPlusCircle /> Add Product
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon seller">
              <FiPackage />
            </div>
            <div className="stat-info">
              <h3>{totalProducts}</h3>
              <p>Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon buyer">
              <FiShoppingCart />
            </div>
            <div className="stat-info">
              <h3>{totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">
              <FiClock />
            </div>
            <div className="stat-info">
              <h3>{pendingOrders}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <FiDollarSign />
            </div>
            <div className="stat-info">
              <h3>₹{totalRevenue.toLocaleString()}</h3>
              <p>Revenue</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <FiShoppingCart /> Orders ({totalOrders})
          </button>
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <FiPackage /> My Products ({totalProducts})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* ========== Orders Tab ========== */}
            {activeTab === "orders" && (
              <div className="dashboard-section">
                <div className="section-title">
                  <h2>📥 Received Orders</h2>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={fetchData}
                  >
                    Refresh
                  </button>
                </div>

                {/* Filter Tabs */}
                <div className="order-filter-tabs">
                  {[
                    { key: "all", label: "All", count: totalOrders },
                    { key: "pending", label: "Pending", count: pendingOrders },
                    {
                      key: "confirmed",
                      label: "Confirmed",
                      count: orders.filter((o) => o.status === "confirmed")
                        .length,
                    },
                    {
                      key: "completed",
                      label: "Completed",
                      count: orders.filter((o) => o.status === "completed")
                        .length,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      className={`order-filter-tab ${activeOrderFilter === tab.key ? "active" : ""}`}
                      onClick={() => setActiveOrderFilter(tab.key)}
                    >
                      {tab.label}
                      <span className="filter-count">{tab.count}</span>
                    </button>
                  ))}
                </div>

                <div className="section-body">
                  {filteredOrders.length > 0 ? (
                    <div className="orders-card-list">
                      {filteredOrders.map((order) => (
                        <div
                          key={order._id}
                          className="order-card seller-order-card"
                        >
                          {/* Header */}
                          <div
                            className="order-card-header"
                            onClick={() => toggleOrder(order._id)}
                          >
                            <div className="order-card-left">
                              <span className="order-id-badge">
                                #{order._id.slice(-6).toUpperCase()}
                              </span>
                              <div className="order-card-info">
                                <h4>{order.productName}</h4>
                                <p>
                                  Buyer: <strong>{order.buyerName}</strong> •
                                  {order.quantity?.toLocaleString()} units •
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="order-card-right">
                              <span
                                className={`order-status ${getStatusClass(order.status)}`}
                              >
                                {order.status}
                              </span>
                              <span className="order-card-total">
                                ₹{order.totalPrice?.toLocaleString()}
                              </span>
                              <button className="expand-btn">
                                {expandedOrder === order._id ? (
                                  <FiChevronUp />
                                ) : (
                                  <FiChevronDown />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded */}
                          {expandedOrder === order._id && (
                            <div className="order-card-body">
                              <div className="order-card-details">
                                {/* Order Info */}
                                <div className="order-details-grid">
                                  <div className="order-detail-item">
                                    <span>Buyer Name</span>
                                    <strong>{order.buyerName}</strong>
                                  </div>
                                  <div className="order-detail-item">
                                    <span>Phone</span>
                                    <strong>{order.buyerPhone}</strong>
                                  </div>
                                  <div className="order-detail-item">
                                    <span>Email</span>
                                    <strong>{order.buyerEmail}</strong>
                                  </div>
                                  <div className="order-detail-item">
                                    <span>Quantity</span>
                                    <strong>
                                      {order.quantity?.toLocaleString()} units
                                    </strong>
                                  </div>
                                  <div className="order-detail-item">
                                    <span>Product Cost</span>
                                    <strong>
                                      ₹{order.productCost?.toLocaleString()}
                                    </strong>
                                  </div>
                                  <div className="order-detail-item">
                                    <span>Transport</span>
                                    <strong>
                                      {order.transportRequired
                                        ? `₹${order.transportCost?.toLocaleString()} (${order.vehicleName})`
                                        : "Self Pickup"}
                                    </strong>
                                  </div>
                                  <div className="order-detail-item total">
                                    <span>Total Amount</span>
                                    <strong>
                                      ₹{order.totalPrice?.toLocaleString()}
                                    </strong>
                                  </div>
                                  {order.deliveryAddress && (
                                    <div className="order-detail-item full">
                                      <span>Delivery Address</span>
                                      <strong>{order.deliveryAddress}</strong>
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="order-detail-item full">
                                    <span>Update Status</span>
                                    <div className="action-buttons">
                                      {order.status === "pending" && (
                                        <>
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={() =>
                                              handleUpdateStatus(
                                                order._id,
                                                "confirmed",
                                              )
                                            }
                                          >
                                            <FiCheckCircle /> Confirm
                                          </button>
                                          <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() =>
                                              handleUpdateStatus(
                                                order._id,
                                                "cancelled",
                                              )
                                            }
                                          >
                                            <FiXCircle /> Cancel
                                          </button>
                                        </>
                                      )}
                                      {order.status === "confirmed" && (
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={() =>
                                            handleUpdateStatus(
                                              order._id,
                                              "completed",
                                            )
                                          }
                                        >
                                          <FiCheckCircle /> Mark Complete
                                        </button>
                                      )}
                                      {(order.status === "completed" ||
                                        order.status === "cancelled") && (
                                        <span className="status-final">
                                          {order.status === "completed"
                                            ? "✅ Order Completed"
                                            : "❌ Order Cancelled"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Timeline */}
                                <div className="order-timeline-section">
                                  <h4>Order Progress</h4>
                                  <OrderTimeline
                                    status={order.status}
                                    createdAt={order.createdAt}
                                    updatedAt={order.updatedAt}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FiShoppingCart size={50} />
                      <h3>No orders yet</h3>
                      <p>
                        When buyers order your products, they'll appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== Products Tab (Updated with Edit) ========== */}
            {activeTab === "products" && (
              <div className="dashboard-section">
                <div className="section-title">
                  <h2>📦 My Products</h2>
                  <Link
                    to="/seller/add-product"
                    className="btn btn-primary btn-sm"
                  >
                    <FiPlusCircle /> Add New
                  </Link>
                </div>

                <div className="section-body">
                  {products.length > 0 ? (
                    <div className="seller-products-grid">
                      {products.map((product) => (
                        <div key={product._id} className="seller-product-card">
                          {/* Product Image */}
                          <div className="seller-product-image">
                            <img
                              src={product.image || defaultImage}
                              alt={product.name}
                              onError={(e) => {
                                if (e.target.src !== defaultImage)
                                  e.target.src = defaultImage;
                              }}
                            />
                            <span className="seller-product-category">
                              {product.category}
                            </span>
                          </div>

                          {/* Product Info */}
                          <div className="seller-product-info">
                            <h3>{product.name}</h3>

                            <div className="seller-product-details">
                              <div className="detail-row">
                                <span>💰 Price:</span>
                                <strong>
                                  ₹{product.price}/{product.unit}
                                </strong>
                              </div>
                              <div className="detail-row">
                                <span>📦 Stock:</span>
                                <strong
                                  className={
                                    product.quantity > 0
                                      ? "text-success"
                                      : "text-danger"
                                  }
                                >
                                  {product.quantity?.toLocaleString()}{" "}
                                  {product.unit}s
                                </strong>
                              </div>
                              <div className="detail-row">
                                <span>📍 Location:</span>
                                <strong>{product.location}</strong>
                              </div>
                              <div className="detail-row">
                                <span>📅 Added:</span>
                                <strong>{formatDate(product.createdAt)}</strong>
                              </div>
                            </div>

                            <p className="seller-product-desc">
                              {product.description?.substring(0, 80)}...
                            </p>

                            {/* Action Buttons */}
                            <div className="seller-product-actions">
                              <Link
                                to={`/product/${product._id}`}
                                className="btn btn-outline btn-sm"
                              >
                                👁️ View
                              </Link>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleEditClick(product)}
                              >
                                <FiEdit /> Edit
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteProduct(product._id)}
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FiPackage size={50} />
                      <h3>No products yet</h3>
                      <p>Start adding products to sell!</p>
                      <Link
                        to="/seller/add-product"
                        className="btn btn-primary"
                      >
                        <FiPlusCircle /> Add Product
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========== Edit Product Modal ========== */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        title="✏️ Edit Product"
      >
        {editProduct && (
          <form className="edit-product-form" onSubmit={handleEditSubmit}>
            {/* Image Edit */}
            <div className="edit-image-section">
              <label>
                <FiImage /> Product Image
              </label>
              <div className="edit-image-container">
                <div className="edit-image-preview">
                  <img
                    src={editImagePreview || editForm.image || defaultImage}
                    alt="Preview"
                    onError={(e) => {
                      if (e.target.src !== defaultImage)
                        e.target.src = defaultImage;
                    }}
                  />
                </div>
                <div className="edit-image-actions">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="file-input"
                    id="edit-image-input"
                  />
                  {editImageFile && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleRemoveEditImage}
                    >
                      <FiX /> Reset Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div className="form-group">
              <label>
                <FiPackage /> Product Name
              </label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />
            </div>

            {/* Category & Unit */}
            <div className="edit-form-row">
              <div className="form-group">
                <label>
                  <FiLayers /> Category
                </label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  required
                >
                  <option value="Bricks">Bricks</option>
                  <option value="Cement">Cement</option>
                  <option value="Sand">Sand</option>
                  <option value="Steel">Steel</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select
                  name="unit"
                  value={editForm.unit}
                  onChange={handleEditChange}
                  required
                >
                  <option value="piece">Piece</option>
                  <option value="bag">Bag</option>
                  <option value="ton">Ton</option>
                  <option value="kg">Kg</option>
                  <option value="cft">CFT</option>
                </select>
              </div>
            </div>

            {/* Price & Quantity */}
            <div className="edit-form-row">
              <div className="form-group">
                <label>
                  <FiDollarSign /> Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={editForm.quantity}
                  onChange={handleEditChange}
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>
                <FiMapPin /> Location
              </label>
              <input
                type="text"
                name="location"
                value={editForm.location}
                onChange={handleEditChange}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>
                <FiFileText /> Description
              </label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                rows="3"
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="edit-form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCloseEdit}
              >
                <FiX /> Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={editLoading || uploading}
              >
                {uploading ? "📤 Uploading..." : editLoading ? "Saving..." : ""}
                {!uploading && !editLoading && (
                  <>
                    <FiSave /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default SellerDashboard;
