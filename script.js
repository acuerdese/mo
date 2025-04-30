// Cargar contenido desde XML
fetch('content.xml')
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, 'application/xml');
        const sections = xml.getElementsByTagName('section');
        const footer = xml.getElementsByTagName('footer')[0];

        // Rellenar secciones
        for (let section of sections) {
            const id = section.getAttribute('id');
            const title = section.getElementsByTagName('title')[0].textContent;
            const description = section.getElementsByTagName('description')[0].textContent;
            const images = section.getElementsByTagName('image');

            let html = `<h1>${title}</h1><p>${description}</p>`;
            if (images.length > 0) {
                if (id === 'products') {
                    html += '<div class="products-grid">';
                    for (let img of images) {
                        html += `<img src="${img.textContent}" alt="${title}">`;
                    }
                    html += '</div>';
                } else {
                    html += `<img src="${images[0].textContent}" alt="${title}">`;
                }
            }

            document.getElementById(id).innerHTML = html;
        }

        // Rellenar footer
        const footerTitle = footer.getElementsByTagName('title')[0].textContent;
        const footerDesc = footer.getElementsByTagName('description')[0].textContent;
        document.getElementById('footer').innerHTML = `<h3>${footerTitle}</h3><p>${footerDesc}</p>`;
    })
    .catch(error => console.error('Error cargando XML:', error));

// Menú hamburguesa
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});
