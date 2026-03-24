
import { createClient } from '@supabase/supabase-js';

// Default configuration provided
const DEFAULT_URL = 'https://usnxlolpdurlxiupoiuk.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbnhsb2xwZHVybHhpdXBvaXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTA5ODYsImV4cCI6MjA4MDQyNjk4Nn0.KtYqa3i-m8jMiRbviwMk56ebN_6hkQcIQ6K9I6x25BI';

const CONFIG_KEY = 'safevoice_supabase_config';

let supabaseUrl = DEFAULT_URL;
let supabaseKey = DEFAULT_KEY;

// Allow override via local storage
const savedConfig = localStorage.getItem(CONFIG_KEY);
if (savedConfig) {
  try {
    const parsed = JSON.parse(savedConfig);
    if (parsed.url && parsed.key) {
      supabaseUrl = parsed.url;
      supabaseKey = parsed.key;
    }
  } catch (e) {
    console.error('Failed to parse saved config');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getSupabaseConfig = () => ({ url: supabaseUrl, key: supabaseKey });

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, key }));
  window.location.reload();
};
