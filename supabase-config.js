// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://ваш-проект.supabase.co'
const SUPABASE_ANON_KEY = 'ваш-anon-ключ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Класс для работы с БД
class Database {
    // ===== ПОЛЬЗОВАТЕЛИ =====
    async getUsers() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('points', { ascending: false })
        
        if (error) throw error
        return data
    }

    async getUserById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single()
        
        if (error) throw error
        return data
    }

    async updateUserPoints(userId, points) {
        const { data, error } = await supabase
            .from('users')
            .update({ points: points })
            .eq('id', userId)
        
        if (error) throw error
        return data
    }

    async addCompletedDemon(userId, demonId) {
        // Сначала получаем текущего пользователя
        const user = await this.getUserById(userId)
        
        // Добавляем демона, если его еще нет
        if (!user.completed_demons.includes(demonId)) {
            const newDemons = [...user.completed_demons, demonId]
            
            const { data, error } = await supabase
                .from('users')
                .update({ completed_demons: newDemons })
                .eq('id', userId)
            
            if (error) throw error
            return data
        }
        return null
    }

    // ===== ДЕМОНЫ =====
    async getDemons() {
        const { data, error } = await supabase
            .from('demons')
            .select('*')
            .order('position', { ascending: true })
        
        if (error) throw error
        return data
    }

    async getDemonById(id) {
        const { data, error } = await supabase
            .from('demons')
            .select('*')
            .eq('id', id)
            .single()
        
        if (error) throw error
        return data
    }

    async searchDemons(searchTerm) {
        const { data, error } = await supabase
            .from('demons')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,creator.ilike.%${searchTerm}%`)
            .order('position', { ascending: true })
        
        if (error) throw error
        return data
    }

    async getDemonsByTags(tags) {
        const { data, error } = await supabase
            .from('demons')
            .select('*')
            .contains('tags', tags)
            .order('position', { ascending: true })
        
        if (error) throw error
        return data
    }

    // ===== АВТОРИЗАЦИЯ =====
    async register(email, password, username) {
        // Регистрация в Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        })

        if (authError) throw authError

        // Создаем запись в таблице users
        if (authData.user) {
            const { error: dbError } = await supabase
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
                ])

            if (dbError) throw dbError
        }

        return authData
    }

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) throw error
        return data
    }

    async logout() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            // Получаем дополнительные данные из таблицы users
            const userData = await this.getUserById(user.id)
            return { ...user, ...userData }
        }
        return null
    }

    // ===== ЛИДЕРБОРД =====
    async getLeaderboard(limit = 100) {
        const { data, error } = await supabase
            .from('users')
            .select('username, points, rank, completed_demons')
            .order('points', { ascending: false })
            .limit(limit)
        
        if (error) throw error
        return data
    }

    // ===== СТАТИСТИКА =====
    async getDemonStats() {
        const { data: demons, error } = await supabase
            .from('demons')
            .select('tags')
        
        if (error) throw error

        // Собираем статистику по тегам
        const tagStats = {}
        demons.forEach(demon => {
            demon.tags.forEach(tag => {
                tagStats[tag] = (tagStats[tag] || 0) + 1
            })
        })

        return {
            totalDemons: demons.length,
            tagStats: tagStats
        }
    }

    // ===== REALTIME ПОДПИСКИ =====
    subscribeToLeaderboard(callback) {
        return supabase
            .channel('leaderboard-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'users'
                },
                (payload) => {
                    callback(payload)
                }
            )
            .subscribe()
    }

    subscribeToDemons(callback) {
        return supabase
            .channel('demon-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'demons'
                },
                (payload) => {
                    callback(payload)
                }
            )
            .subscribe()
    }
}

export const db = new Database()
