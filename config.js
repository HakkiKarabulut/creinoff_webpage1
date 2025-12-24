// Supabase Configuration
// Lütfen kendi proje bilgilerinizi buraya girin.
const SUPABASE_URL = 'https://knopwkihctstqkjnqflf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtub3B3a2loY3RzdHFram5xZmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTE5MzYsImV4cCI6MjA4MjA2NzkzNn0.Ye8bhGW2jWNLWdHNxg1Ajj-OM7IWL1zbF4ukb2DuOK8';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
