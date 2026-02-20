// supabase-config.js
const SUPABASE_URL = 'https://ваш-проект.supabase.co';
const SUPABASE_KEY = 'ваш-public-аннонимный-ключ';

// Инициализация Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class AuthSystem {
    constructor() {
        this.initAuth();
    }

    async initAuth() {
        // Проверяем текущую сессию
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await this.loadUserProfile(user.id);
        }
    }

    // Регистрация
    async register(username, email, password) {
        try {
            // 1. Регистрация в Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (authError) throw authError;

            // 2. Создаем запись в таблице users
            if (authData.user) {
                const { error: dbError } = await supabase
                    .from('users')
                    .insert([
                        {
                            id: authData.user.id,
                            username: username,
                            email: email,
                            password: 'managed_by_supabase_auth',
                            points: 0,
                            rank: 'Новичок',
                            completed_demons: []
                        }
                    ]);

                if (dbError) throw dbError;
            }

            return {
                success: true,
                message: 'Регистрация успешна! Проверьте email для подтверждения.'
            };

        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.message || 'Ошибка при регистрации'
            };
        }
    }

    // Вход
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            if (data.user) {
                await this.loadUserProfile(data.user.id);
                return {
                    success: true,
                    message: 'Вход выполнен успешно'
                };
            }

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message || 'Ошибка при входе'
            };
        }
    }

    // Загрузка профиля пользователя
    async loadUserProfile(userId) {
        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!error && userData) {
            localStorage.setItem('currentUser', JSON.stringify(userData));
            this.updateUIBasedOnAuth(userData);
        }
    }

    // Выход
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            localStorage.removeItem('currentUser');
            window.location.reload();
        }
    }

    // Получение текущего пользователя
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Проверка авторизации
    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    // Добавление пройденного демона
    async addCompletedDemon(demonId, demonName, points) {
        const user = this.getCurrentUser();
        if (!user) return false;

        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('completed_demons, points, rank')
            .eq('id', user.id)
            .single();

        if (fetchError) return false;

        // Проверяем, не пройден ли уже демон
        if (userData.completed_demons.includes(demonId)) {
            return { success: false, message: 'Демон уже пройден' };
        }

        // Обновляем данные
        const newPoints = userData.points + points;
        let newRank = userData.rank;

        // Расчет ранга
        if (newPoints >= 1000) newRank = 'Легенда';
        else if (newPoints >= 500) newRank = 'Эксперт';
        else if (newPoints >= 100) newRank = 'Продвинутый';

        const { error: updateError } = await supabase
            .from('users')
            .update({
                completed_demons: [...userData.completed_demons, demonId],
                points: newPoints,
                rank: newRank
            })
            .eq('id', user.id);

        if (!updateError) {
            // Обновляем локальные данные
            const updatedUser = { ...user };
            updatedUser.completed_demons = [...userData.completed_demons, demonId];
            updatedUser.points = newPoints;
            updatedUser.rank = newRank;
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            return {
                success: true,
                message: 'Демон добавлен в профиль!',
                points: newPoints,
                rank: newRank
            };
        }

        return { success: false, message: 'Ошибка при обновлении' };
    }

    // Обновление UI в зависимости от статуса авторизации
    updateUIBasedOnAuth(user) {
        const headerControls = document.querySelector('.header-controls');
        const existingAuthBtn = document.querySelector('.auth-btn-header');
        
        if (existingAuthBtn) existingAuthBtn.remove();

        if (user) {
            // Показываем меню пользователя
            const userMenu = document.createElement('div');
            userMenu.className = 'user-menu';
            userMenu.innerHTML = `
                <div class="user-avatar">
                    ${user.username.charAt(0).toUpperCase()}
                </div>
                <div class="user-info">
                    <div style="font-weight: 700;">${user.username}</div>
                    <div style="font-size: 0.8rem; color: var(--accent-green);">${user.points} очков</div>
                    <div style="font-size: 0.8rem;">Ранг: ${user.rank}</div>
                    <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
                        <button onclick="auth.logout()" style="background: none; border: none; color: var(--accent-red); cursor: pointer; width: 100%; text-align: left;">
                            Выйти
                        </button>
                    </div>
                </div>
            `;

            // Добавляем CSS для меню
            const style = document.createElement('style');
            style.textContent = `
                .user-menu {
                    position: relative;
                    cursor: pointer;
                }
                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--accent-red), var(--accent-purple));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: white;
                    font-size: 1.1rem;
                }
                .user-info {
                    display: none;
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: var(--bg-primary);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 1rem;
                    min-width: 220px;
                    box-shadow: var(--dropdown-shadow);
                    z-index: 1000;
                    margin-top: 0.5rem;
                }
                .user-menu:hover .user-info {
                    display: block;
                }
            `;
            document.head.appendChild(style);

            headerControls.insertBefore(userMenu, document.querySelector('.language-toggle'));
        } else {
            // Показываем кнопку входа
            const authBtn = document.createElement('a');
            authBtn.href = 'login.html';
            authBtn.className = 'auth-btn-header';
            authBtn.innerHTML = `
                <button style="background: linear-gradient(135deg, var(--accent-red), var(--accent-purple)); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Войти
                </button>
            `;
            headerControls.insertBefore(authBtn, document.querySelector('.language-toggle'));
        }
    }
}

// Инициализация
const auth = new AuthSystem();
