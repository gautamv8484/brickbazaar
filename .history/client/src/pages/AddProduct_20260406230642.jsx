import { uploadAPI } from '../services/api';

const AddProduct = () => {
  const [form, setForm] = useState({
    name: '',
    category: 'Bricks',
    price: '',
    unit: 'piece',
    quantity: '',
    description: '',
    image: '',
    location: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload image before submitting
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = form.image;

      // Upload image if selected
      if (imageFile) {
        setUploading(true);
        console.log('📤 Uploading image...');
        
        const uploadRes = await uploadAPI.uploadImage(imageFile);
        imageUrl = `http://localhost:5000${uploadRes.data.imageUrl}`;
        
        console.log('✅ Image uploaded:', imageUrl);
        setUploading(false);
      }

      // Create product
      const response = await productAPI.create({
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        image: imageUrl || 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=400'
      });

      console.log('✅ Product added:', response.data);
      toast.success('Product added successfully! 🎉');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        {/* ... existing code ... */}

        <form className="add-product-form" onSubmit={handleSubmit}>
          {/* ... existing fields ... */}

          {/* Image Upload Section */}
          <div className="form-group">
            <label><FiImage /> Product Image</label>
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button 
                  type="button" 
                  className="remove-image"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <small>Upload product image (Max 5MB, jpg/png/gif)</small>
          </div>

          {/* ... rest of form ... */}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/seller/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
              {uploading ? '📤 Uploading Image...' : loading ? 'Adding...' : '✅ Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};