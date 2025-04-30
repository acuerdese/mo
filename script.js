document.addEventListener('DOMContentLoaded', () => {
    // Fetch the XML file
    fetch('content.xml')
        .then(response => response.text())
        .then(data => {
            // Parse XML
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, 'application/xml');

            // Populate header
            const title = xml.querySelector('header title').textContent;
            const description = xml.querySelector('header description').textContent;
            document.getElementById('marketplace-title').textContent = title;
            document.getElementById('marketplace-description').textContent = description;

            // Populate products
            const productsContainer = document.getElementById('products');
            const products = xml.querySelectorAll('product');

            products.forEach(product => {
                const id = product.querySelector('id').textContent;
                const name = product.querySelector('name').textContent;
                const price = product.querySelector('price').textContent;
                const image = product.querySelector('image').textContent;
                const description = product.querySelector('description').textContent;

                // Create product card
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.innerHTML = `
                    <img src="${image}" alt="${name}">
                    <h3>${name}</h3>
                    <p>${description}</p>
                    <p class="price">$${price}</p>
                `;

                productsContainer.appendChild(productCard);
            });
        })
        .catch(error => console.error('Error loading XML:', error));
});
