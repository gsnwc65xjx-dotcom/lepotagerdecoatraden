document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Listen for messages from Admin Panel
    window.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_CONTENT') {
            renderContent(event.data.data);
        }
    });

    // Initial Load
    loadContent();

    async function loadContent() {
        try {
            // Use global variable from content.js
            if (window.siteContent) {
                renderContent(window.siteContent);
            } else {
                // Fallback for server environment if needed, or error
                console.error('window.siteContent is not defined. Make sure assets/content.js is loaded.');
                // Try fetch as backup if file exists (unlikely in this specific file:// scenario but good practice)
                const response = await fetch('assets/content.json');
                if (response.ok) {
                    const data = await response.json();
                    renderContent(data);
                }
            }
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    function renderContent(data) {
        // Hero
        if (data.hero) {
            if (document.getElementById('hero-title')) document.getElementById('hero-title').innerHTML = data.hero.title;
            if (document.getElementById('hero-subtitle')) document.getElementById('hero-subtitle').textContent = data.hero.subtitle;
            if (document.getElementById('hero-cta-primary')) document.getElementById('hero-cta-primary').textContent = data.hero.cta_primary;
            if (document.getElementById('hero-cta-secondary')) document.getElementById('hero-cta-secondary').textContent = data.hero.cta_secondary;
        }

        // About
        if (data.about) {
            if (document.getElementById('about-title')) document.getElementById('about-title').textContent = data.about.title;
            if (document.getElementById('about-text-1')) document.getElementById('about-text-1').textContent = data.about.text_1;
            if (document.getElementById('about-text-2')) document.getElementById('about-text-2').textContent = data.about.text_2;

            const featuresList = document.getElementById('about-features');
            if (featuresList && data.about.features) {
                featuresList.innerHTML = '';
                const icons = ['fa-leaf', 'fa-carrot', 'fa-heart'];
                data.about.features.forEach((feature, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `<i class="fas ${icons[index] || 'fa-check'}"></i> ${feature}`;
                    featuresList.appendChild(li);
                });
            }
        }

        // Products
        if (data.products) {
            if (document.getElementById('products-title')) document.getElementById('products-title').textContent = data.products.title;
            if (document.getElementById('products-subtitle')) document.getElementById('products-subtitle').textContent = data.products.subtitle;

            const productsGrid = document.getElementById('products-grid');
            if (productsGrid && data.products.items) {
                productsGrid.innerHTML = '';
                data.products.items.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <div class="card-icon"><i class="${item.icon}"></i></div>
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                        <span class="price">${item.price}</span>
                    `;
                    productsGrid.appendChild(card);
                });
            }
        }

        // Baskets
        if (data.baskets) {
            if (document.getElementById('baskets-title')) document.getElementById('baskets-title').textContent = data.baskets.title;
            if (document.getElementById('baskets-subtitle')) document.getElementById('baskets-subtitle').textContent = data.baskets.subtitle;
            const basketsGrid = document.getElementById('baskets-grid');
            if (basketsGrid && data.baskets.items) {
                basketsGrid.innerHTML = '';
                data.baskets.items.forEach(item => {
                    const featuresHtml = item.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('');
                    const card = document.createElement('div');
                    card.className = 'basket-card';
                    card.innerHTML = `
                        <h3>${item.title}</h3>
                        <div class="basket-price">${item.price}</div>
                        <p>${item.description}</p>
                        <ul class="basket-features">${featuresHtml}</ul>
                        <a href="#contact" class="btn-primary">Commander</a>
                    `;
                    basketsGrid.appendChild(card);
                });
            }
        }

        // Recipes
        if (data.recipes) {
            if (document.getElementById('recipes-title')) document.getElementById('recipes-title').textContent = data.recipes.title;
            if (document.getElementById('recipes-subtitle')) document.getElementById('recipes-subtitle').textContent = data.recipes.subtitle;
            const recipesGrid = document.getElementById('recipes-grid');
            if (recipesGrid && data.recipes.items) {
                recipesGrid.innerHTML = '';
                data.recipes.items.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'recipe-card';
                    card.innerHTML = `
                        <div class="recipe-image">
                            <img src="${item.image}" alt="${item.title}">
                        </div>
                        <div class="recipe-content">
                            <span class="recipe-time"><i class="fas fa-clock"></i> ${item.time}</span>
                            <h3>${item.title}</h3>
                        </div>
                    `;
                    recipesGrid.appendChild(card);
                });
            }
        }



        // Contact
        if (data.contact) {
            if (document.getElementById('contact-title')) document.getElementById('contact-title').textContent = data.contact.title;
            if (document.getElementById('contact-subtitle')) document.getElementById('contact-subtitle').textContent = data.contact.subtitle;
            if (document.getElementById('contact-address')) document.getElementById('contact-address').innerHTML = data.contact.address;
            if (document.getElementById('contact-hours')) document.getElementById('contact-hours').innerHTML = data.contact.hours;
            if (document.getElementById('contact-phone')) document.getElementById('contact-phone').textContent = data.contact.phone;
            if (document.getElementById('contact-email')) document.getElementById('contact-email').textContent = data.contact.email;
        }
    }


    // Close menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            navbar.style.padding = '10px 0';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.padding = '15px 0';
        }
    });

    // Smooth Scroll for Safari/Older Browsers (optional as CSS scroll-behavior usually handles this)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
