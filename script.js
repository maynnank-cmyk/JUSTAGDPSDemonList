// ========== ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА ==========
function toggleLanguage() {
    const currentLang = localStorage.getItem('language') || 'ru';
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    
    localStorage.setItem('language', newLang);
    updateLanguage(newLang);
    
    const langButton = document.getElementById('languageToggle');
    langButton.textContent = newLang === 'ru' ? 'EN' : 'RU';
}

function loadLanguage() {
    const savedLang = localStorage.getItem('language') || 'ru';
    updateLanguage(savedLang);
    
    const langButton = document.getElementById('languageToggle');
    langButton.textContent = savedLang === 'ru' ? 'EN' : 'RU';
}

function updateLanguage(lang) {
    // Показываем/скрываем элементы по языку
    document.querySelectorAll('[data-lang]').forEach(element => {
        if (element.getAttribute('data-lang') === lang) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });
    
    // Обновляем плейсхолдеры
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = searchInput.getAttribute(`data-placeholder-${lang}`);
    }
    
    const tagsSearch = document.getElementById('tagsSearch');
    if (tagsSearch) {
        tagsSearch.placeholder = tagsSearch.getAttribute(`data-placeholder-${lang}`);
    }
    
    // Обновляем текущий текст выбранного типа поиска
    updateCurrentSearchTypeText();
    
    // Обновляем иконки в зависимости от темы
    updateIconColors(document.documentElement.getAttribute('data-theme') || 'dark');
}

// ========== ВЫБОР ТИПА ПОИСКА ==========
let currentSearchType = localStorage.getItem('searchType') || 'normal';

function toggleSearchTypeMenu() {
    const searchTypeMenu = document.getElementById('searchTypeMenu');
    const searchTypeToggle = document.getElementById('searchTypeToggle');
    
    const isActive = searchTypeMenu.classList.contains('active');
    
    if (!isActive) {
        searchTypeMenu.classList.add('active');
        searchTypeToggle.classList.add('active');
    } else {
        searchTypeMenu.classList.remove('active');
        searchTypeToggle.classList.remove('active');
    }
}

function changeSearchType(type) {
    currentSearchType = type;
    localStorage.setItem('searchType', type);
    
    // Обновляем активный элемент в меню
    document.querySelectorAll('.search-type-option').forEach(option => {
        if (option.dataset.searchType === type) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Обновляем отображение
    updateSearchTypeDisplay();
    
    // Обновляем текущий текст выбранного типа поиска
    updateCurrentSearchTypeText();
    
    // Закрываем меню выбора типа поиска
    const searchTypeMenu = document.getElementById('searchTypeMenu');
    const searchTypeToggle = document.getElementById('searchTypeToggle');
    searchTypeMenu.classList.remove('active');
    searchTypeToggle.classList.remove('active');
    
    // Обновляем результаты
    updateFilteredDemons();
}

function updateSearchTypeDisplay() {
    const normalSearchContainer = document.getElementById('normalSearchContainer');
    const tagsSearchContainer = document.getElementById('tagsSearchContainer');
    const currentSearchIcon = document.getElementById('currentSearchIcon');
    
    if (currentSearchType === 'normal') {
        normalSearchContainer.style.display = 'block';
        tagsSearchContainer.style.display = 'none';
        currentSearchIcon.src = 'assets/search.png';
    } else if (currentSearchType === 'tags') {
        normalSearchContainer.style.display = 'none';
        tagsSearchContainer.style.display = 'block';
        currentSearchIcon.src = 'assets/tag.png';
    }
}

function updateCurrentSearchTypeText() {
    const currentLang = localStorage.getItem('language') || 'ru';
    const currentSearchText = document.getElementById('currentSearchText');
    const currentSearchTextEn = document.getElementById('currentSearchTextEn');
    
    if (currentSearchType === 'normal') {
        if (currentLang === 'ru') {
            currentSearchText.textContent = 'Обычный поиск';
            currentSearchText.style.display = '';
            currentSearchTextEn.style.display = 'none';
        } else {
            currentSearchTextEn.textContent = 'Normal Search';
            currentSearchText.style.display = 'none';
            currentSearchTextEn.style.display = '';
        }
    } else if (currentSearchType === 'tags') {
        if (currentLang === 'ru') {
            currentSearchText.textContent = 'Поиск по тегам';
            currentSearchText.style.display = '';
            currentSearchTextEn.style.display = 'none';
        } else {
            currentSearchTextEn.textContent = 'Search by Tags';
            currentSearchText.style.display = 'none';
            currentSearchTextEn.style.display = '';
        }
    }
}

function loadSearchType() {
    const savedType = localStorage.getItem('searchType') || 'normal';
    changeSearchType(savedType);
}

// Закрытие меню выбора типа поиска при клике вне его
document.addEventListener('click', function(event) {
    const searchTypeMenu = document.getElementById('searchTypeMenu');
    const searchTypeToggle = document.getElementById('searchTypeToggle');
    
    if (!searchTypeToggle.contains(event.target) && !searchTypeMenu.contains(event.target)) {
        searchTypeMenu.classList.remove('active');
        searchTypeToggle.classList.remove('active');
    }
});

// ========== ВЫПАДАЮЩИЕ МЕНЮ ==========
function toggleDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const dropdown = event.currentTarget.parentElement;
    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    const arrow = event.currentTarget.querySelector('.dropdown-arrow');
    const isActive = dropdownMenu.classList.contains('active');
    
    // Закрываем все другие выпадающие меню
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdownMenu) {
            menu.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
        if (btn !== event.currentTarget) {
            btn.classList.remove('active');
            const otherArrow = btn.querySelector('.dropdown-arrow');
            if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
        }
    });
    
    if (!isActive) {
        dropdownMenu.classList.add('active');
        event.currentTarget.classList.add('active');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
        dropdownMenu.classList.remove('active');
        event.currentTarget.classList.remove('active');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }
}

function toggleMobileDropdown(event, type) {
    event.preventDefault();
    event.stopPropagation();
    
    const mobileDropdown = document.getElementById(`mobileDropdown${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const isActive = mobileDropdown.classList.contains('active');
    const arrow = event.currentTarget.querySelector('.dropdown-arrow');
    
    document.querySelectorAll('.mobile-dropdown').forEach(dropdown => {
        if (dropdown.id !== mobileDropdown.id) {
            dropdown.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.mobile-menu .dropdown-toggle').forEach(btn => {
        if (btn !== event.currentTarget) {
            btn.classList.remove('active');
            const otherArrow = btn.querySelector('.dropdown-arrow');
            if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
        }
    });
    
    if (!isActive) {
        mobileDropdown.classList.add('active');
        arrow.style.transform = 'rotate(180deg)';
        event.currentTarget.classList.add('active');
    } else {
        mobileDropdown.classList.remove('active');
        arrow.style.transform = 'rotate(0deg)';
        event.currentTarget.classList.remove('active');
    }
}

// Закрытие меню при клике вне его
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
        document.querySelectorAll('.dropdown-toggle').forEach(btn => {
            btn.classList.remove('active');
            const arrow = btn.querySelector('.dropdown-arrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        });
    }
    
    if (!event.target.closest('.mobile-menu nav ul li')) {
        document.querySelectorAll('.mobile-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        document.querySelectorAll('.mobile-menu .dropdown-toggle').forEach(btn => {
            btn.classList.remove('active');
            const arrow = btn.querySelector('.dropdown-arrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        });
    }
});

// Закрытие меню при нажатии Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
        document.querySelectorAll('.dropdown-toggle').forEach(btn => {
            btn.classList.remove('active');
            const arrow = btn.querySelector('.dropdown-arrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        });
        
        document.querySelectorAll('.mobile-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        document.querySelectorAll('.mobile-menu .dropdown-toggle').forEach(btn => {
            btn.classList.remove('active');
            const arrow = btn.querySelector('.dropdown-arrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        });
        
        const searchTypeMenu = document.getElementById('searchTypeMenu');
        const searchTypeToggle = document.getElementById('searchTypeToggle');
        searchTypeMenu.classList.remove('active');
        searchTypeToggle.classList.remove('active');
    }
});

// ========== МОБИЛЬНОЕ МЕНЮ ==========
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    mobileMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    mobileMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    document.querySelectorAll('.mobile-dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
    document.querySelectorAll('.mobile-menu .dropdown-toggle').forEach(btn => {
        btn.classList.remove('active');
        const arrow = btn.querySelector('.dropdown-arrow');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    });
}

document.querySelectorAll('.mobile-menu a').forEach(link => {
    if (!link.classList.contains('dropdown-toggle')) {
        link.addEventListener('click', closeMobileMenu);
    }
});

// ========== СМЕНА ТЕМЫ ==========
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.style.transform = newTheme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)';
    
    updateIconColors(newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.style.transition = 'transform 0.5s ease';
    themeIcon.style.transform = savedTheme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)';
    
    updateIconColors(savedTheme);
}

function updateIconColors(theme) {
    const searchIcons = document.querySelectorAll('.search-icon');
    searchIcons.forEach(icon => {
        if (theme === 'dark') {
            icon.style.filter = 'brightness(0) invert(1)';
        } else {
            icon.style.filter = 'brightness(0) saturate(100%) invert(24%) sepia(9%) saturate(1200%) hue-rotate(170deg) brightness(92%) contrast(87%)';
        }
    });
}

// ========== ДАННЫЕ ДЕМОНОВ ==========
let demons = [];
let filteredDemons = [];
let imageCache = new Map();
let allTags = new Set();
let activeTags = new Set();
let tagStats = {};

function calculatePointsByRank(rank) {
    const basePoints = 1000;
    if (rank === 1) return basePoints;
    
    const reduction = 0.05;
    const points = basePoints * Math.pow(1 - reduction, rank - 1);
    
    return Math.max(Math.round(points), 1);
}

// ========== СЕТКА ТЕГОВ ==========
function renderTagsList() {
    const tagsSlider = document.getElementById('tagsSlider');
    
    if (!tagsSlider) return;
    
    tagsSlider.innerHTML = '';
    
    const sortedTags = Array.from(allTags).sort((a, b) => {
        // Сначала популярные теги
        const countDiff = tagStats[b] - tagStats[a];
        if (countDiff !== 0) return countDiff;
        // Затем по алфавиту
        return a.localeCompare(b);
    });
    
    // Рендерим в сетку
    sortedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-slider-item';
        tagElement.innerHTML = `
            ${tag} <span class="tag-count">(${tagStats[tag]})</span>
        `;
        
        tagElement.addEventListener('click', () => {
            toggleTagFilter(tag);
        });
        
        tagsSlider.appendChild(tagElement);
    });
    
    updateActiveTagsDisplay();
}

function toggleTagFilter(tag) {
    if (activeTags.has(tag)) {
        activeTags.delete(tag);
    } else {
        activeTags.add(tag);
    }
    
    updateActiveTagsDisplay();
    updateFilteredDemons();
    updateFilterStats();
}

function updateActiveTagsDisplay() {
    // Обновляем сетку тегов
    document.querySelectorAll('.tag-slider-item').forEach(item => {
        const tagName = item.textContent.split(' (')[0].trim();
        if (activeTags.has(tagName)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function clearAllTags() {
    activeTags.clear();
    updateActiveTagsDisplay();
    updateFilteredDemons();
    updateFilterStats();
    
    // Очищаем поле поиска тегов
    const tagsSearch = document.getElementById('tagsSearch');
    tagsSearch.value = '';
    tagsSearch.dispatchEvent(new Event('input'));
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const tagsSearch = document.getElementById('tagsSearch');
    
    // Обычный поиск при вводе
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm.length === 0) {
            searchResults.style.display = 'none';
            updateFilteredDemons();
            return;
        }
        
        const results = demons.filter(demon => 
            demon.name.toLowerCase().includes(searchTerm) || 
            demon.creator.toLowerCase().includes(searchTerm)
        );
        
        displaySearchResults(results);
        updateFilteredDemons();
    });
    
    // Обработчик Enter в поле поиска
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateFilteredDemons();
            searchResults.style.display = 'none';
        }
    });
    
    // Поиск в фильтрах тегов
    tagsSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        // Фильтрация в сетке тегов
        document.querySelectorAll('.tag-slider-item').forEach(item => {
            const tagName = item.textContent.toLowerCase().split(' (')[0];
            if (tagName.includes(searchTerm) || searchTerm === '') {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Закрытие результатов поиска при клике вне их
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    const currentLang = localStorage.getItem('language') || 'ru';
    const noResultsText = currentLang === 'ru' ? 'Демоны не найдены' : 'Demons not found';
    
    if (results.length === 0) {
        searchResults.innerHTML = `<div class="no-results">${noResultsText}</div>`;
        searchResults.style.display = 'block';
        return;
    }
    
    searchResults.innerHTML = '';
    
    results.slice(0, 6).forEach(demon => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <div class="search-result-name">${demon.name}</div>
            <div class="search-result-creator">by ${demon.creator}</div>
            ${demon.tags ? `<div style="font-size:0.8rem;color:var(--accent-purple);margin-top:0.2rem;">${demon.tags.slice(0, 3).join(', ')}</div>` : ''}
        `;
        resultItem.addEventListener('click', function() {
            openDemonPage(demon.id);
            searchResults.style.display = 'none';
        });
        searchResults.appendChild(resultItem);
    });
    
    searchResults.style.display = 'block';
}

function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = `
        <div class="error-message">
            <strong>Ошибка:</strong> ${message}
        </div>
    `;
}

async function getAvailableImage(demonId) {
    if (imageCache.has(demonId)) {
        return imageCache.get(demonId);
    }

    const imageUrl = `images/${demonId}.png`;
    
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        const isAvailable = response.ok;
        imageCache.set(demonId, isAvailable ? imageUrl : null);
        return isAvailable ? imageUrl : null;
    } catch (error) {
        imageCache.set(demonId, null);
        return null;
    }
}

async function loadDataFromJSON() {
    try {
        console.log('📥 Загружаем демонов из demons.json...');
        
        const response = await fetch('data/demons.json');
        if (!response.ok) throw new Error('Файл demons.json не найден');
        
        const data = await response.json();
        
        if (data.demons && Array.isArray(data.demons)) {
            demons = [];
            allTags.clear();
            tagStats = {};
            
            // Загружаем демонов и собираем теги
            demons = data.demons.map((demon, index) => {
                const demonObj = {
                    ...demon,
                    rank: index + 1
                };
                
                // Собираем теги
                if (demon.tags && Array.isArray(demon.tags)) {
                    demon.tags.forEach(tag => {
                        allTags.add(tag);
                        if (!tagStats[tag]) {
                            tagStats[tag] = 0;
                        }
                        tagStats[tag]++;
                    });
                }
                
                return demonObj;
            });
            
            filteredDemons = [...demons];
            
            console.log('✅ Демоны загружены:', demons.length);
            console.log('🏷️  Найдено тегов:', allTags.size);
            
            const currentLang = localStorage.getItem('language') || 'ru';
            const statusText = currentLang === 'ru' ? 'Список демонов загружен' : 'Demon list loaded';
            updateSyncStatus(statusText);
            
            renderDemons();
            renderTagsList();
            updateFilterStats();
            loadImagesAsync();
            
            return true;
        } else {
            throw new Error('Неверный формат demons.json');
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки демонов:', error);
        showError(error.message);
        
        const currentLang = localStorage.getItem('language') || 'ru';
        const statusText = currentLang === 'ru' ? 'Ошибка загрузки данных' : 'Error loading data';
        updateSyncStatus(statusText);
        
        return false;
    }
}

async function loadImagesAsync() {
    if (demons.length === 0) return;
    
    console.log('🖼️ Асинхронная загрузка изображений...');
    
    const batchSize = 5;
    
    for (let i = 0; i < demons.length; i += batchSize) {
        const batch = demons.slice(i, i + batchSize);
        
        await Promise.all(
            batch.map(async (demon) => {
                const imageUrl = await getAvailableImage(demon.id);
                if (imageUrl) {
                    demon.image = imageUrl;
                    
                    const demonElement = document.querySelector(`[data-demon-id="${demon.id}"]`);
                    if (demonElement) {
                        const imgElement = demonElement.querySelector('.demon-image img');
                        if (imgElement) {
                            imgElement.src = imageUrl;
                            imgElement.style.opacity = '0';
                            setTimeout(() => {
                                imgElement.style.opacity = '1';
                                imgElement.style.transition = 'opacity 0.5s ease';
                            }, 10);
                        }
                    }
                }
            })
        );
        
        if (i + batchSize < demons.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    
    console.log('✅ Все изображения загружены');
}

function updateSyncStatus(message) {
    const statusElement = document.getElementById('syncStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = 'sync-status ' + (message.includes('загружен') || message.includes('loaded') ? 'synced' : '');
    }
}

function updateFilteredDemons() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    let filtered = demons;
    
    if (currentSearchType === 'normal') {
        // Фильтрация по обычному поиску
        if (searchTerm.length > 0) {
            filtered = demons.filter(demon => 
                demon.name.toLowerCase().includes(searchTerm) || 
                demon.creator.toLowerCase().includes(searchTerm)
            );
        }
    } else if (currentSearchType === 'tags') {
        // Фильтрация по тегам
        if (activeTags.size > 0) {
            filtered = demons.filter(demon => 
                demon.tags && activeTags.size > 0 && 
                Array.from(activeTags).every(tag => demon.tags.includes(tag))
            );
        }
    }
    
    filteredDemons = filtered;
    renderDemons();
    updateFilterStats();
}

function updateFilterStats() {
    const filterCount = document.getElementById('filterCount');
    const showingCount = document.getElementById('showingCount');
    const totalCount = document.getElementById('totalCount');
    
    if (filterCount && showingCount && totalCount) {
        filterCount.textContent = activeTags.size;
        showingCount.textContent = filteredDemons.length;
        totalCount.textContent = demons.length;
    }
}

function renderDemons() {
    const demonList = document.getElementById('demonList');
    const currentLang = localStorage.getItem('language') || 'ru';
    
    if (!demonList) return;
    
    const fragment = document.createDocumentFragment();
    
    if (filteredDemons.length === 0) {
        const noResultsTitle = currentLang === 'ru' ? 'Демоны не найдены' : 'Demons not found';
        let noResultsDesc = '';
        
        if (currentSearchType === 'normal') {
            noResultsDesc = currentLang === 'ru' ? 'Попробуйте изменить поисковый запрос' : 'Try changing your search query';
        } else if (currentSearchType === 'tags') {
            noResultsDesc = currentLang === 'ru' ? 'Попробуйте изменить фильтры тегов' : 'Try changing tag filters';
        }
        
        demonList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔍</div>
                <div style="font-size: 1.2rem; margin-bottom: 0.8rem; font-weight: 700;">${noResultsTitle}</div>
                <div style="font-weight: 500; font-size: 1rem;">${noResultsDesc}</div>
                ${(currentSearchType === 'tags' && activeTags.size > 0) ? 
                    `<div style="margin-top: 1rem;">
                        <button onclick="clearAllTags()" style="background: var(--accent-red); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                            ${currentLang === 'ru' ? 'Очистить теги' : 'Clear tags'}
                        </button>
                    </div>` : ''
                }
            </div>
        `;
        return;
    }
    
    filteredDemons.forEach(demon => {
        const points = calculatePointsByRank(demon.rank);
        const rankClass = demon.rank === 1 ? 'top-1' : 
                        demon.rank <= 3 ? 'top-3' : 
                        demon.rank <= 10 ? 'top-10' : '';
        
        const demonRow = document.createElement('div');
        demonRow.className = 'demon-row';
        demonRow.setAttribute('data-demon-id', demon.id);
        demonRow.onclick = () => openDemonPage(demon.id);
        
        const hasImage = demon.image;
        
        demonRow.innerHTML = `
            <div class="demon-rank ${rankClass}">${demon.rank}</div>
            <div class="demon-image">
                ${hasImage ? 
                    `<img src="${demon.image}" alt="${demon.name}" 
                          loading="lazy"
                          onerror="handleImageError(this, '${demon.name}')">` :
                    `<div class="image-placeholder">${demon.name.charAt(0)}</div>`
                }
            </div>
            <div class="demon-info">
                <div class="demon-details">
                    <div class="demon-name">${demon.name}</div>
                    <div class="demon-creator">by ${demon.creator}</div>
                    ${demon.tags && demon.tags.length > 0 ? 
                        `<div class="demon-tags">${demon.tags.slice(0, 3).map(tag => 
                            `<span class="demon-tag" onclick="event.stopPropagation(); toggleTagFilter('${tag}')">${tag}</span>`
                        ).join('')}</div>` : ''
                    }
                </div>
                <div class="demon-points">${points}</div>
            </div>
        `;
        fragment.appendChild(demonRow);
    });
    
    demonList.innerHTML = '';
    demonList.appendChild(fragment);
}

function handleImageError(img, demonName) {
    const parent = img.parentNode;
    parent.innerHTML = `<div class="image-placeholder">${demonName.charAt(0)}</div>`;
}

function openDemonPage(demonId) {
    window.location.href = `demon.html?id=${demonId}`;
}

async function refreshData() {
    console.log('🔄 Обновление данных...');
    imageCache.clear();
    allTags.clear();
    activeTags.clear();
    tagStats = {};
    demons = [];
    filteredDemons = [];
    
    await loadDataFromJSON();
    
    document.querySelectorAll('.demon-row').forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-15px)';
        
        setTimeout(() => {
            row.style.transition = 'opacity 0.5s, transform 0.5s';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, index * 50);
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
async function initializeData() {
    loadTheme();
    loadLanguage();
    loadSearchType();
    
    // Добавляем обработчики событий
    document.querySelectorAll('.dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', toggleDropdown);
    });
    
    document.querySelectorAll('.mobile-menu .dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const type = this.parentElement.querySelector('.mobile-dropdown').id.replace('mobileDropdown', '').toLowerCase();
            toggleMobileDropdown(e, type);
        });
    });
    
    document.getElementById('languageToggle').addEventListener('click', toggleLanguage);
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
    document.querySelector('.menu-toggle').addEventListener('click', toggleMobileMenu);
    document.querySelector('.mobile-close').addEventListener('click', closeMobileMenu);
    document.querySelector('.refresh-btn').addEventListener('click', refreshData);
    document.querySelector('.clear-tags-btn').addEventListener('click', clearAllTags);
    
    document.querySelectorAll('.search-type-option').forEach(option => {
        option.addEventListener('click', function() {
            changeSearchType(this.dataset.searchType);
        });
    });
    
    document.getElementById('searchTypeToggle').addEventListener('click', toggleSearchTypeMenu);
    
    const dataPromise = loadDataFromJSON();
    
    initializeSearch();
    
    setTimeout(() => {
        document.querySelectorAll('.demon-row').forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-15px)';
            
            setTimeout(() => {
                row.style.transition = 'opacity 0.5s, transform 0.5s';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }, 100);
    
    await dataPromise;
}

// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ==========
window.refreshData = refreshData;
window.openDemonPage = openDemonPage;
window.toggleTheme = toggleTheme;
window.toggleLanguage = toggleLanguage;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.handleImageError = handleImageError;
window.toggleDropdown = toggleDropdown;
window.toggleMobileDropdown = toggleMobileDropdown;
window.toggleTagFilter = toggleTagFilter;
window.clearAllTags = clearAllTags;
window.toggleSearchTypeMenu = toggleSearchTypeMenu;
window.changeSearchType = changeSearchType;

document.addEventListener('DOMContentLoaded', function() {
    initializeData();
});
