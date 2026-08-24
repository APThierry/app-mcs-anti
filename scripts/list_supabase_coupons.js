import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://avwgrdrhwdgdjeqjifyb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2d2dyZHJod2RnZGplcWppZnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTIxMzcsImV4cCI6MjEwMjg4ODEzN30.fiowJ6lNH-rv5u7NZeDncwb47fS-9BCSlspvE9CJMwM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listCoupons() {
  const { data, error } = await supabase.from('coupons').select('*');
  console.log('CUPONS ATUAIS NO SUPABASE:', JSON.stringify(data, null, 2));
}

listCoupons();
