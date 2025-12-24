// Supabase Configuration
// Lütfen kendi proje bilgilerinizi buraya girin.
window.SUPABASE_URL = 'https://knopwkihctstqkjnqflf.supabase.co';
window.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtub3B3a2loY3RzdHFram5xZmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTE5MzYsImV4cCI6MjA4MjA2NzkzNn0.Ye8bhGW2jWNLWdHNxg1Ajj-OM7IWL1zbF4ukb2DuOK8';

// Initialize Supabase
if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    // Legacy support for admin scripts
    window.supabase = window.supabaseClient;
    console.log('Supabase initialized successfully');
} else {
    console.error('Supabase library not loaded before config.js');
}
