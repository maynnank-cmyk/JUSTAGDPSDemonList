// auth.js - простая система авторизации с localStorage

class AuthSystem {
    constructor() {
        this.usersKey = 'gdps_users';
        this.currentUserKey = 'gdps_current_user';
        this.init();
    }

    init() {
        // Создаем хранилище пользователей, если его нет
        if (!localStorage.getItem(this.usersKey)) {
            localStorage.setItem(this.usersKey, JSON.stringify([]));
        }
        
        // Проверяем авторизацию при загрузке
        this.checkAuth();
        
        // Добавляем обработчик для обновления UI при изменении языка
        document.addEventListener('languageChanged', () => {
            this.updateUI();
        });
    }

    // Регистрация
    async register(username, email, password) {
        const users = this.getUsers();
        
        // Валидация
        if (username.length < 3) {
            return { 
                success: false, 
                message: this.getLocalizedMessage('usernameTooShort', 'Имя пользователя должно содержать минимум 3 символа') 
            };
        }
        
        if (password.length < 6) {
            return { 
                success: false, 
                message: this.getLocalizedMessage('passwordTooShort', 'Пароль должен содержать минимум 6 символов') 
            };
        }
        
        if (!this.isValidEmail(email)) {
            return { 
                success: false, 
                message: this.getLocalizedMessage('invalidEmail', 'Введите корректный email') 
            };
        }
        
        // Проверка существования
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { 
                success: false, 
                message: this.getLocalizedMessage('usernameTaken', 'Имя пользователя уже занято') 
            };
        }
        
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { 
                success: false, 
                message: this.getLocalizedMessage('emailTaken', 'Email уже зарегистрирован') 
            };
        }

        // Создание пользователя
        const newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            username,
            email,
            password: this.hashPassword(password),
            registeredAt: new Date().toISOString(),
            stats: {
                completedDemons: [],
                points: 0,
                rank: this.getRankByPoints(0),
                demonsCompleted: 0
            },
            settings: {
                theme: localStorage.getItem('theme') || 'dark',
                language: localStorage.getItem('language') || 'ru'
            }
        };

        users.push(newUser);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        return { 
            success: true, 
            message: this.getLocalizedMessage('registerSuccess', 'Регистрация успешна!') 
        };
    }

    // Вход
    async login(email, password) {
        const users = this.getUsers();
        const hashedPassword = this.hashPassword(password);
        
        const user = users.find(u => 
            (u.email.toLowerCase() === email.toLowerCase() || 
             u.username.toLowerCase() === email.toLowerCase()) && 
            u.password === hashedPassword
        );

        if (user) {
            // Создаем копию без пароля для хранения в localStorage
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem(this.currentUserKey, JSON.stringify(userWithoutPassword));
            
            // Обновляем UI
            this.updateUI();
            
            return { 
                success: true, 
                message: this.getLocalizedMessage('loginSuccess', 'Вход выполнен успешно'),
                user: userWithoutPassword
            };
        }

        return { 
            success: false, 
            message: this.getLocalizedMessage('invalidCredentials', 'Неверный email или пароль') 
        };
    }

    // Выход
    logout() {
        localStorage.removeItem(this.currentUserKey);
        this.updateUI();
        
        // Перенаправление на главную, если нужно
        if (window.location.pathname.includes('profile')) {
            window.location.href = 'index.html';
        }
    }

    // Получение текущего пользователя
    getCurrentUser() {
        const userStr = localStorage.getItem(this.currentUserKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Проверка авторизации
    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    // Получение всех пользователей
    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    }

    // Простое хэширование (для демонстрации)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    // Валидация email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Получение ранга по очкам
    getRankByPoints(points) {
        if (points >= 1000) return 'Легенда';
        if (points >= 500) return 'Эксперт';
        if (points >= 100) return 'Продвинутый';
        return 'Новичок';
    }

    // Локализация сообщений
    getLocalizedMessage(key, ruMessage) {
        const lang = localStorage.getItem('language') || 'ru';
        if (lang === 'ru') return ruMessage;
        
        const enMessages = {
            usernameTooShort: 'Username must be at least 3 characters',
            passwordTooShort: 'Password must be at least 6 characters',
            invalidEmail: 'Please enter a valid email',
            usernameTaken: 'Username already taken',
            emailTaken: 'Email already registered',
            registerSuccess: 'Registration successful!',
            loginSuccess: 'Login successful!',
            invalidCredentials: 'Invalid email or password'
        };
        
        return enMessages[key] || ruMessage;
    }

    // Обновление UI
    updateUI() {
        const user = this.getCurrentUser();
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        
        if (!loginBtn || !userMenu) return;
        
        if (user) {
            // Показываем меню пользователя
            loginBtn.style.display = 'none';
            userMenu.style.display = 'block';
            
            // Обновляем аватар
            const avatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            const userPoints = document.getElementById('userPoints');
            const userRank = document.getElementById('userRank');
            
            if (avatar) {
                avatar.textContent = user.username.charAt(0).toUpperCase();
            }
            if (userName) {
                userName.textContent = user.username;
            }
            if (userPoints) {
                userPoints.textContent = user.stats.points;
            }
            if (userRank) {
                userRank.textContent = user.stats.rank;
            }
        } else {
            // Показываем кнопку входа
            loginBtn.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }

    // Проверка авторизации при загрузке
    checkAuth() {
        this.updateUI();
    }

    // Добавление пройденного демона
    addCompletedDemon(demonId, demonName, points) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: 'Not authenticated' };

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
            // Проверяем, не пройден ли уже демон
            if (users[userIndex].stats.completedDemons.includes(demonId)) {
                return { 
                    success: false, 
                    message: this.getLocalizedMessage('demonAlreadyCompleted', 'Демон уже пройден') 
                };
            }

            // Добавляем демона
            users[userIndex].stats.completedDemons.push(demonId);
            users[userIndex].stats.points += points;
            users[userIndex].stats.demonsCompleted++;
            users[userIndex].stats.rank = this.getRankByPoints(users[userIndex].stats.points);

            // Сохраняем изменения
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            
            // Обновляем текущего пользователя
            const { password, ...updatedUser } = users[userIndex];
            localStorage.setItem(this.currentUserKey, JSON.stringify(updatedUser));
            
            // Обновляем UI
            this.updateUI();
            
            return { 
                success: true, 
                message: this.getLocalizedMessage('demonAdded', 'Демон добавлен в профиль!'),
                user: updatedUser
            };
        }
        
        return { success: false, message: 'User not found' };
    }

    // Получение статистики для лидерборда
    getLeaderboard() {
        const users = this.getUsers();
        return users
            .map(user => ({
                username: user.username,
                points: user.stats.points,
                rank: user.stats.rank,
                demonsCompleted: user.stats.demonsCompleted
            }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 100);
    }
}

// Инициализация
const auth = new AuthSystem();

// Делаем доступным глобально
window.auth = auth;
