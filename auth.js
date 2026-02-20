// auth.js - ВЕРСИЯ ДЛЯ SUPABASE

class AuthSystem {
    constructor() {
        this.init();
    }

    async init() {
        console.log('🔄 Инициализация AuthSystem...');
        
        // Ждем загрузки supabase
        await this.waitForSupabase();
        
        // Проверяем текущую сессию
        await this.checkSession();
        
        // Слушаем изменения авторизации
        if (window.supabaseClient) {
            window.supabaseClient.auth.onAuthStateChange((event, session) => {
                console.log('🔄 Auth state changed:', event);
                if (event === 'SIGNED_IN') {
                    this.loadUserProfile(session.user.id);
                } else if (event === 'SIGNED_OUT') {
                    this.clearUserData();
                }
            });
        }
    }

    async waitForSupabase() {
        let attempts = 0;
        while (!window.supabaseClient && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.supabaseClient) {
            console.error('❌ Supabase client not found after waiting');
        } else {
            console.log('✅ Supabase client found');
        }
    }

    async checkSession() {
        try {
            if (!window.supabaseClient) {
                console.error('❌ Supabase client not available');
                return;
            }

            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            
            if (error) {
                console.error('❌ Ошибка получения сессии:', error);
                return;
            }
            
            if (session) {
                console.log('✅ Активная сессия найдена');
                await this.loadUserProfile(session.user.id);
            } else {
                console.log('ℹ️ Нет активной сессии');
                this.clearUserData();
            }
        } catch (err) {
            console.error('❌ Ошибка проверки сессии:', err);
        }
    }

    async loadUserProfile(userId) {
        try {
            if (!window.supabaseClient) return;

            const { data: userData, error } = await window.supabaseClient
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('❌ Ошибка загрузки профиля:', error);
                return;
            }

            if (userData) {
                console.log('✅ Профиль пользователя загружен:', userData.username);
                localStorage.setItem('currentUser', JSON.stringify(userData));
                this.updateUI(userData);
            }
        } catch (err) {
            console.error('❌ Ошибка:', err);
        }
    }

    clearUserData() {
        localStorage.removeItem('currentUser');
        this.updateUI(null);
    }

    async register(username, email, password) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            console.log('🔄 Регистрация пользователя:', email);
            
            const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (authError) throw authError;

            console.log('✅ Auth регистрация успешна');

            if (authData.user) {
                const { error: dbError } = await window.supabaseClient
                    .from('users')
                    .insert([
                        {
                            id: authData.user.id,
                            username: username,
                            email: email,
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
            console.error('❌ Ошибка регистрации:', error);
            return {
                success: false,
                message: error.message || 'Ошибка при регистрации'
            };
        }
    }

    async login(email, password) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            console.log('🔄 Попытка входа:', email);
            
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            console.log('✅ Вход успешен');
            
            if (data.user) {
                await this.loadUserProfile(data.user.id);
                return {
                    success: true,
                    message: 'Вход выполнен успешно'
                };
            }

        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            return {
                success: false,
                message: error.message || 'Ошибка при входе'
            };
        }
    }

    async logout() {
        try {
            if (!window.supabaseClient) return;

            console.log('🔄 Выход из системы...');
            
            const { error } = await window.supabaseClient.auth.signOut();
            
            if (error) throw error;
            
            console.log('✅ Выход успешен');
            this.clearUserData();
            window.location.reload();
            
        } catch (error) {
            console.error('❌ Ошибка выхода:', error);
        }
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated() {
        return !!this.getCurrentUser();
    }

    updateUI(user) {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu');
        
        if (!loginBtn || !userMenu) {
            return;
        }

        if (user) {
            loginBtn.style.display = 'none';
            userMenu.style.display = 'block';
            
            const avatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            const userPoints = document.getElementById('userPoints');
            const userRank = document.getElementById('userRank');
            
            if (avatar) avatar.textContent = user.username.charAt(0).toUpperCase();
            if (userName) userName.textContent = user.username;
            if (userPoints) userPoints.textContent = user.points;
            if (userRank) userRank.textContent = user.rank;
        } else {
            loginBtn.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }
}

// Создаем глобальный экземпляр ТОЛЬКО если его еще нет
if (!window.auth) {
    window.auth = new AuthSystem();
}
