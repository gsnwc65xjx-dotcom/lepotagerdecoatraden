let currentData = null;
let fileHandle = null;

const editorContainer = document.getElementById('editor-container');
const previewFrame = document.getElementById('preview-frame');
const saveBtn = document.getElementById('btn-save');

// 1. Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadContent();
    setupSaveHandler();
});

// 2. Load Content
async function loadContent() {
    try {
        if (window.siteContent) {
            currentData = window.siteContent;
            renderEditor(currentData);
            updatePreview();
        } else {
            throw new Error('window.siteContent not found');
        }
    } catch (error) {
        console.error('Error loading content:', error);
        editorContainer.innerHTML = '<p style="color:red">Erreur de chargement. Vérifiez que assets/content.js est bien chargé.</p>';
    }
}

// 3. Render Editor Forms
function renderEditor(data) {
    editorContainer.innerHTML = '';

    // Helper to create sections
    const createSection = (key, title, content) => {
        const group = document.createElement('div');
        group.className = 'section-group';

        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `<span>${title}</span> <i class="fas fa-chevron-down"></i>`;
        header.onclick = () => {
            const body = group.querySelector('.section-body');
            body.classList.toggle('active');
            const icon = header.querySelector('i');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        };

        const body = document.createElement('div');
        body.className = 'section-body';
        body.innerHTML = content;

        group.appendChild(header);
        group.appendChild(body);
        editorContainer.appendChild(group);

        // Bind inputs in this section
        bindInputs(body, key);
    };

    // --- Global Settings ---
    createSection('global', 'Paramètres Généraux (SEO)', `
        <div class="form-group">
            <label>Titre du Site (Onglet Navigateur)</label>
            <input type="text" data-path="global.siteTitle" value="${escapeHtml(data.global ? data.global.siteTitle : '')}">
        </div>
        <div class="form-group">
            <label>Description (Meta Description)</label>
            <textarea data-path="global.metaDescription">${escapeHtml(data.global ? data.global.metaDescription : '')}</textarea>
        </div>
    `);

    // --- Hero ---
    createSection('hero', 'Accueil (Hero)', `
        <div class="form-group">
            <label>Titre</label>
            <input type="text" data-path="hero.title" value="${escapeHtml(data.hero.title)}">
        </div>
        <div class="form-group">
            <label>Sous-titre</label>
            <textarea data-path="hero.subtitle">${escapeHtml(data.hero.subtitle)}</textarea>
        </div>
    `);

    // --- About ---
    let aboutFeaturesHtml = '';
    if (data.about.features) {
        data.about.features.forEach((feature, index) => {
            aboutFeaturesHtml += `
                <div class="form-group" style="display: flex; gap: 10px; align-items: center;">
                    <div style="display: flex; flex-direction: column;">
                        <i class="fas fa-chevron-up" style="cursor: pointer; color: #888;" onclick="moveItem('about.features', ${index}, -1)"></i>
                        <i class="fas fa-chevron-down" style="cursor: pointer; color: #888;" onclick="moveItem('about.features', ${index}, 1)"></i>
                    </div>
                    <input type="text" data-path="about.features.${index}" value="${escapeHtml(feature)}">
                    <span class="btn-remove" onclick="removeItem('about.features', ${index})"><i class="fas fa-trash"></i></span>
                </div>
            `;
        });
        aboutFeaturesHtml += `<button class="btn btn-add" onclick="addItem('about.features')"><i class="fas fa-plus"></i> Ajouter un point fort</button>`;
    }

    createSection('about', 'À Propos', `
        <div class="form-group">
            <label>Titre</label>
            <input type="text" data-path="about.title" value="${escapeHtml(data.about.title)}">
        </div>
        <div class="form-group">
            <label>Paragraphe 1</label>
            <textarea data-path="about.text_1">${escapeHtml(data.about.text_1)}</textarea>
        </div>
        <div class="form-group">
            <label>Paragraphe 2</label>
            <textarea data-path="about.text_2">${escapeHtml(data.about.text_2)}</textarea>
        </div>
        <div class="form-group">
            <label>Points Forts</label>
            <div style="background: #f9f9f9; padding: 10px; border-radius: 4px;">
                ${aboutFeaturesHtml}
            </div>
        </div>
    `);

    // --- Products ---
    let productsHtml = '';
    if (data.products && data.products.items) {
        data.products.items.forEach((item, index) => {
            productsHtml += `
                <div class="item-card">
                    <div class="item-header">
                        <span>Produit ${index + 1}</span>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <i class="fas fa-chevron-up" style="cursor: pointer; color: #888;" onclick="moveItem('products.items', ${index}, -1)"></i>
                            <i class="fas fa-chevron-down" style="cursor: pointer; color: #888;" onclick="moveItem('products.items', ${index}, 1)"></i>
                            <span class="btn-remove" onclick="removeItem('products.items', ${index})"><i class="fas fa-trash"></i> Supprimer</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Titre</label>
                        <input type="text" data-path="products.items.${index}.title" value="${escapeHtml(item.title)}">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea data-path="products.items.${index}.description">${escapeHtml(item.description)}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Prix</label>
                        <input type="text" data-path="products.items.${index}.price" value="${escapeHtml(item.price)}">
                    </div>
                    <div class="form-group">
                        <label>Icône (FontAwesome)</label>
                        <input type="text" data-path="products.items.${index}.icon" value="${escapeHtml(item.icon)}">
                    </div>
                </div>
            `;
        });
        productsHtml += `<button class="btn btn-add" onclick="addItem('products.items')"><i class="fas fa-plus"></i> Ajouter un produit</button>`;
    }

    createSection('products', 'Produits', `
        <div class="form-group">
            <label>Titre</label>
            <input type="text" data-path="products.title" value="${escapeHtml(data.products.title)}">
        </div>
        <div class="form-group">
            <label>Sous-titre</label>
            <textarea data-path="products.subtitle">${escapeHtml(data.products.subtitle)}</textarea>
        </div>
        ${productsHtml}
    `);

    // --- Baskets ---
    let basketsHtml = '';
    data.baskets.items.forEach((item, index) => {
        basketsHtml += `
            <div class="item-card">
                <div class="item-header">
                    <span>Panier ${index + 1}</span>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <i class="fas fa-chevron-up" style="cursor: pointer; color: #888;" onclick="moveItem('baskets.items', ${index}, -1)"></i>
                        <i class="fas fa-chevron-down" style="cursor: pointer; color: #888;" onclick="moveItem('baskets.items', ${index}, 1)"></i>
                        <span class="btn-remove" onclick="removeItem('baskets.items', ${index})"><i class="fas fa-trash"></i> Supprimer</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nom</label>
                    <input type="text" data-path="baskets.items.${index}.title" value="${escapeHtml(item.title)}">
                </div>
                <div class="form-group">
                    <label>Prix</label>
                    <input type="text" data-path="baskets.items.${index}.price" value="${escapeHtml(item.price)}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea data-path="baskets.items.${index}.description">${escapeHtml(item.description)}</textarea>
                </div>
            </div>
        `;
    });
    basketsHtml += `<button class="btn btn-add" onclick="addItem('baskets.items')"><i class="fas fa-plus"></i> Ajouter un panier</button>`;
    createSection('baskets', 'Paniers', basketsHtml);

    // --- Recipes (With Images) ---
    let recipesHtml = '';
    data.recipes.items.forEach((item, index) => {
        recipesHtml += `
            <div class="item-card">
                <div class="item-header">
                    <span>Recette ${index + 1}</span>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <i class="fas fa-chevron-up" style="cursor: pointer; color: #888;" onclick="moveItem('recipes.items', ${index}, -1)"></i>
                        <i class="fas fa-chevron-down" style="cursor: pointer; color: #888;" onclick="moveItem('recipes.items', ${index}, 1)"></i>
                        <span class="btn-remove" onclick="removeItem('recipes.items', ${index})"><i class="fas fa-trash"></i> Supprimer</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Titre</label>
                    <input type="text" data-path="recipes.items.${index}.title" value="${escapeHtml(item.title)}">
                </div>
                <div class="form-group">
                    <label>Temps</label>
                    <input type="text" data-path="recipes.items.${index}.time" value="${escapeHtml(item.time)}">
                </div>
                <div class="form-group">
                    <label>Image</label>
                    <div class="image-preview" onclick="triggerFileSelect('recipes.items.${index}.image')">
                        <img src="${item.image}" id="img-preview-recipes.items.${index}.image">
                        <span style="${item.image ? 'display:none' : ''}">Cliquez pour changer</span>
                    </div>
                    <input type="file" id="file-recipes.items.${index}.image" accept="image/*" onchange="handleImageUpload(this, 'recipes.items.${index}.image')">
                </div>
            </div>
        `;
    });
    recipesHtml += `<button class="btn btn-add" onclick="addItem('recipes.items')"><i class="fas fa-plus"></i> Ajouter une recette</button>`;
    createSection('recipes', 'Recettes', recipesHtml);

    // --- Social ---
    createSection('social', 'Réseaux Sociaux', `
        <div class="form-group">
            <label>Titre</label>
            <input type="text" data-path="social.title" value="${escapeHtml(data.social ? data.social.title : '')}">
        </div>
        <div class="form-group">
            <label>Sous-titre</label>
            <textarea data-path="social.subtitle">${escapeHtml(data.social ? data.social.subtitle : '')}</textarea>
        </div>
    `);

    // --- Contact ---
    createSection('contact', 'Contact', `
        <div class="form-group">
            <label>Titre</label>
            <input type="text" data-path="contact.title" value="${escapeHtml(data.contact.title)}">
        </div>
        <div class="form-group">
            <label>Sous-titre</label>
            <textarea data-path="contact.subtitle">${escapeHtml(data.contact.subtitle)}</textarea>
        </div>
        <div class="form-group">
            <label>Adresse</label>
            <textarea data-path="contact.address">${escapeHtml(data.contact.address)}</textarea>
        </div>
        <div class="form-group">
            <label>Horaires</label>
            <textarea data-path="contact.hours">${escapeHtml(data.contact.hours)}</textarea>
        </div>
        <div class="form-group">
            <label>Téléphone</label>
            <input type="text" data-path="contact.phone" value="${escapeHtml(data.contact.phone)}">
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="text" data-path="contact.email" value="${escapeHtml(data.contact.email)}">
        </div>
    `);
}

// 4. Data Binding & Live Update
function bindInputs(container, sectionKey) {
    const inputs = container.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const path = e.target.dataset.path;
            updateDataByPath(currentData, path, e.target.value);
            updatePreview();
        });
    });
}

function updateDataByPath(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
}

function updatePreview() {
    // Send data to iframe
    if (previewFrame.contentWindow) {
        previewFrame.contentWindow.postMessage({
            type: 'UPDATE_CONTENT',
            data: currentData
        }, '*');
    }
}

// 5. Item Management (Add/Remove/Move)
window.removeItem = (path, index) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    const keys = path.split('.');
    let current = currentData;
    for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
    }

    if (Array.isArray(current)) {
        current.splice(index, 1);
        renderEditor(currentData);
        updatePreview();
    }
};

window.addItem = (path) => {
    const keys = path.split('.');
    let current = currentData;
    for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
    }

    if (Array.isArray(current)) {
        // Define templates for new items
        let newItem = {};
        if (path.includes('baskets')) {
            newItem = { title: "Nouveau Panier", price: "0€", description: "Description...", features: ["Option 1"] };
        } else if (path.includes('recipes')) {
            newItem = { title: "Nouvelle Recette", time: "0 min", image: "assets/images/basket.png" };
        } else if (path.includes('products')) {
            newItem = { title: "Nouveau Produit", description: "Description...", price: "Prix", icon: "fas fa-box" };
        } else if (path.includes('about.features')) {
            newItem = "Nouvel avantage";
        }

        current.push(newItem);
        renderEditor(currentData);
        updatePreview();
    }
};

window.moveItem = (path, index, direction) => {
    const keys = path.split('.');
    let current = currentData;
    for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
    }

    if (Array.isArray(current)) {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < current.length) {
            const item = current.splice(index, 1)[0];
            current.splice(newIndex, 0, item);
            renderEditor(currentData);
            updatePreview();
        }
    }
};

// 6. Image Handling
window.triggerFileSelect = (path) => {
    document.getElementById('file-' + path).click();
};

window.handleImageUpload = (input, path) => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        // Update Data
        updateDataByPath(currentData, path, base64);
        // Update Preview Image in Editor
        document.getElementById('img-preview-' + path).src = base64;
        document.getElementById('img-preview-' + path).nextElementSibling.style.display = 'none';
        // Update Live Site
        updatePreview();
    };
    reader.readAsDataURL(file);
};

// 7. Save Functionality (Local Server + Fallback)
async function setupSaveHandler() {
    saveBtn.addEventListener('click', async () => {
        const jsContent = `window.siteContent = ${JSON.stringify(currentData, null, 4)};`;

        try {
            // 1. Try Local Server API
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/javascript'
                },
                body: jsContent
            });

            if (response.ok) {
                alert('Sauvegarde réussie (Serveur Local) !');
                return;
            }
        } catch (e) {
            console.log('Local server not available, falling back to file download/system API');
        }

        // 2. Fallback: File System Access API or Download
        try {
            // Check if browser supports File System Access API
            if ('showSaveFilePicker' in window) {
                try {
                    // Reuse handle if available, otherwise ask user
                    if (!fileHandle) {
                        const options = {
                            suggestedName: 'content.js',
                            types: [{
                                description: 'JavaScript Files',
                                accept: { 'text/javascript': ['.js'] },
                            }],
                        };
                        fileHandle = await window.showSaveFilePicker(options);
                    }

                    const writable = await fileHandle.createWritable();
                    await writable.write(jsContent);
                    await writable.close();
                    alert('Sauvegarde réussie (Fichier) !');
                } catch (err) {
                    // If user cancels or permission denied, reset handle and try download
                    if (err.name !== 'AbortError') {
                        console.error('File System API Error:', err);
                        fileHandle = null; // Reset handle on error
                        downloadJS(jsContent);
                    }
                }
            } else {
                downloadJS(jsContent);
            }
        } catch (error) {
            console.error('Save failed:', error);
            alert('Erreur lors de la sauvegarde.');
        }
    });
}

function downloadJS(content) {
    const dataStr = "data:text/javascript;charset=utf-8," + encodeURIComponent(content);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "content.js");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    alert('Fichier content.js généré ! Remplacez le fichier existant dans le dossier assets/.');
}

// Utils
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
