document.addEventListener('DOMContentLoaded', function() {
  // Load XML data
  fetch('data/products.xml')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(str => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(str, "text/xml");
      return xmlDoc;
    })
    .then(data => {
      // Load categories
      const categories = data.getElementsByTagName('category');
      const categoryGrid = document.getElementById('categoryGrid');
      
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const id = category.getAttribute('id');
        const name = category.getElementsByTagName('name')[0].textContent;
        const image = category.getElementsByTagName('image')[0].textContent;
        const description = category.getElementsByTagName('description')[0].textContent;
        
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
          <div class="category-img">
            <img src="${image}" alt="${name}" loading="lazy">
          </div>
          <div class="category-info">
            <h3>${name}</h3>
            <p>${description}</p>
          </div>
        `;
        
        categoryGrid.appendChild(categoryCard);
      }
      
      // Load featured products
      const products = data.getElementsByTagName('product');
      const productGrid = document.getElementById('productGrid');
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const name = product.getElementsByTagName('name')[0].textContent;
        const category = product.getElementsByTagName('category')[0].textContent;
        const price = product.getElementsByTagName('price')[0].textContent;
        const unit = product.getElementsByTagName('unit')[0].textContent;
        const image = product.getElementsByTagName('image')[0].textContent;
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
          <div class="product-img">
            <img src="${image}" alt="${name}" loading="lazy">
          </div>
          <div class="product-info">
            <h3>${name}</h3>
            <p class="product-category">${getCategoryName(category, data)}</p>
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
      }
      
      // Add click event to all "Add to Cart" buttons
      document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
          const productCard = this.closest('.product-card');
          const productName = productCard.querySelector('h3').textContent;
          const productPrice = productCard.querySelector('.price').textContent;
          
          showAlert(`Added ${productName} (${productPrice}) to your cart!`);
        });
      });
    })
    .catch(error => {
      console.error('Error loading XML data:', error);
      showAlert('Failed to load products. Please try again later.', 'error');
    });

  // Newsletter form submission
  document.getElementById('newsletterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input').value;
    showAlert(`Thank you for subscribing with ${email}!`);
    this.reset();
  });

  // Helper function to get category name by ID
  function getCategoryName(categoryId, xmlData) {
    const categories = xmlData.getElementsByTagName('category');
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].getAttribute('id') === categoryId) {
        return categories[i].getElementsByTagName('name')[0].textContent;
      }
    }
    return '';
  }

  // Helper function to show alerts
  function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(alert);
      }, 300);
    }, 3000);
  }
});
