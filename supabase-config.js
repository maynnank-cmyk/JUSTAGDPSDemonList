// supabase-config.js
// ВАЖНО: вставьте СВОИ данные из Supabase!

const SUPABASE_URL = 'https://kegcpzeulrbarwyglcsq.supabase.co'; // ← ВСТАВЬТЕ СВОЙ URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlZ2NwemV1bHJiYXJ3eWdsY3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTMzMTEsImV4cCI6MjA4NzE2OTMxMX0.sAQzdqQ1cFhPITd7yC6pDHIj_vIYxX6CLxQ-UPPxm4g'; // ← ВСТАВЬТЕ СВОЙ КЛЮЧ

// Проверяем, что библиотека загружена
if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase библиотека не загружена! Подключаем...');
    // Если не загружена, загружаем динамически
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
        console.log('✅ Supabase библиотека загружена');
        initializeSupabase();
    };
    document.head.appendChild(script);
} else {
    initializeSupabase();
}

function initializeSupabase() {
    // Создаем клиент
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase клиент создан');

    // Тестируем подключение
    testConnection();
}

async function testConnection() {
    try {
        console.log('🔄 Тестируем подключение к Supabase...');
        
        const { data, error } = await window.supabaseClient
            .from('demons')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ Ошибка подключения:', error.message);
            showConnectionError(error);
            return false;
        }
        
        console.log('✅ Подключение к Supabase успешно!');
        return true;
        
    } catch (err) {
        console.error('❌ Критическая ошибка:', err);
        return false;
    }
}

function showConnectionError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(255,71,87,0.3);
    `;
    errorDiv.innerHTML = `
        ❌ Ошибка подключения к БД:<br>
        ${error.message}<br>
        <small>Проверьте URL и anon key в supabase-config.js</small>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}
