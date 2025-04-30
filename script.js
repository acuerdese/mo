document.addEventListener('DOMContentLoaded', function() {
  // Load XML data
  fetch('data.xml')
    .then(response => response.text())
    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then(data => {
      // Load categories
      const categories = data.querySelectorAll('category');
      const categoryGrid = document.getElementById('categoryGrid');
      
      categories.forEach(category => {
        const id = category.getAttribute('id');
        const name = category.querySelector('name').textContent;
        const image = category.querySelector('image').textContent;
        const description = category.querySelector('description').textContent;
        
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
          <div class="category-img">
            <img src="${image}" alt="${name}">
          </div>
          <div class="category-info">
            <h3>${name}</h3>
            <p>${description}</p>
          </div>
        `;
        
        categoryGrid.appendChild(categoryCard);
      });
      
      // Load featured products
      const products = data.querySelectorAll('featured product');
      const productGrid = document.getElementById('productGrid');
      
      products.forEach(product => {
        const name = product.querySelector('name').textContent;
        const category = product.querySelector('category').textContent;
        const price = product.querySelector('price').textContent;
        const unit = product.querySelector('unit').textContent;
        const image = product.querySelector('image').textContent;
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
          <div class="product-img">
            <img src="${image}" alt="${name}">
          </div>
          <div class="product-info">
            <h3>${name}</h3>
            <p class="category">${getCategoryName(category, data)}</p>
            <div class="product-meta">
              <div>
                <span class="price">$${price}</span>
                <span class="unit">/ ${unit}</span>
              </div>
              <button class="add-to-cart">Add to Cart</button>
            </div>
          </div>
        `;
        
        productGrid.appendChild(productCard);
      });
      
      // Add click event to all "Add to Cart" buttons
      document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
          const productCard = this.closest('.product-card');
          const productName = productCard.querySelector('h3').textContent;
          const productPrice = productCard.querySelector('.price').textContent;
          
          alert(`Added ${productName} (${productPrice}) to your cart!`);
        });
      });
    })
    .catch(error => console.error('Error loading XML data:', error));
});

// Helper function to get category name by ID
function getCategoryName(categoryId, xmlData) {
  const category = xmlData.querySelector(`category[id="${categoryId}"]`);
  return category ? category.querySelector('name').textContent : '';
}
