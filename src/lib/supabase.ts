import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ SUPABASE ENV VARS MISSING! VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌', 'VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');

    // Show visible error in DOM if env vars are missing
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0a0a0f;color:white;font-family:sans-serif;padding:2rem;text-align:center;">
            <h1 style="color:#ff4d00;font-size:3rem;margin-bottom:1rem;">⚠️ SUPABASE BAĞLANTI HATASI</h1>
            <p style="font-size:1.2rem;color:#888;max-width:600px;">Ortam değişkenleri (Environment Variables) bulunamadı. Vercel Dashboard'dan VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY eklenip yeniden deploy edilmeli.</p>
            <div style="margin-top:2rem;background:#1a1a2e;padding:1rem 2rem;border-radius:1rem;border:1px solid #333;">
                <p>VITE_SUPABASE_URL: <span style="color:${supabaseUrl ? '#00ff00' : '#ff0000'}">${supabaseUrl ? '✅ OK' : '❌ MISSING'}</span></p>
                <p>VITE_SUPABASE_ANON_KEY: <span style="color:${supabaseAnonKey ? '#00ff00' : '#ff0000'}">${supabaseAnonKey ? '✅ OK' : '❌ MISSING'}</span></p>
            </div>
        </div>`;
    }
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

