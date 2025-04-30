document.addEventListener('DOMContentLoaded', () => {
    // Fetch and parse XML
    fetch('content.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, 'application/xml');

            // Header
            document.getElementById('logo').textContent = xml.querySelector('header logoText').textContent;
            const nav = document.getElementById('nav');
            xml.querySelectorAll('header nav item').forEach(item => {
                const a = document.createElement('a');
                a.href = `#${item.textContent.toLowerCase()}`;
                a.textContent = item.textContent;
                a.className = 'hover:text-green-200';
                nav.appendChild(a);
            });

            // Hero
            document.getElementById('hero-title').textContent = xml.querySelector('hero title').textContent;
            document.getElementById('hero-subtitle').textContent = xml.querySelector('hero subtitle').textContent;
            document.getElementById('hero-image').src = xml.querySelector('hero image').textContent;
            document.getElementById('hero-button').textContent = xml.querySelector('hero button').textContent;

            // About
            document.getElementById('about-title').textContent = xml.querySelector('about title').textContent;
            document.getElementById('about-description').textContent = xml.querySelector('about description').textContent;
            document.getElementById('about-image').src = xml.querySelector('about image').textContent;

            // Products
            document.getElementById('products-title').textContent = xml.querySelector('products title').textContent;
            document.getElementById('products-description').textContent = xml.querySelector('products description').textContent;
            document.getElementById('products-image').src = xml.querySelector('products image').textContent;

            // Sustainability
            document.getElementById('sustainability-title').textContent = xml.querySelector('sustainability title').textContent;
            document.getElementById('sustainability-description').textContent = xml.querySelector('sustainability description').textContent;
            document.getElementById('sustainability-image').src = xml.querySelector('sustainability image').textContent;

            // Contact
            document.getElementById('contact-title').textContent = xml.querySelector('contact title').textContent;
            document.getElementById('contact-description').textContent = xml.querySelector('contact description').textContent;
            document.getElementById('contact-image').src = xml.querySelector('contact image').textContent;
            document.getElementById('form-name').placeholder = xml.querySelector('contact form name').textContent;
            document.getElementById('form-email').placeholder = xml.querySelector('contact form email').textContent;
            document.getElementById('form-message').placeholder = xml.querySelector('contact form message').textContent;
            document.querySelector('#contact-form button').textContent = xml.querySelector('contact form button').textContent;

            // Footer
            document.getElementById('footer-text').textContent = xml.querySelector('footer text').textContent;
        });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
    });

    // Form submission
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Form submitted! (This is a demo)');
        form.reset();
    });
});
