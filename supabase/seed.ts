import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Run this script ONLY after setting up your environment variables
// and applying the schema.sql in your Supabase SQL Editor.

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    console.log('--- SEEDING EDU NEXUS DATA ---');

    // 1. Seed Tenants
    const { data: tenants, error: tErr } = await supabase.from('tenants').insert([
        { name: 'Springfield Academy', domain: 'springfield', primary_color: '#10b981', region: 'North District' },
        { name: 'Elite International School', domain: 'elite', primary_color: '#6366f1', region: 'West Metropolitan' }
    ]).select();

    if (tErr) console.error('Tenant Seed Error:', tErr);
    else console.log('Tenants Seeded:', tenants.length);

    // 2. Seed Classrooms
    if (tenants) {
        const { error: cErr } = await supabase.from('classrooms').insert([
            { tenant_id: tenants[0].id, grade: 'SSS1', section: '1', room_number: '101', capacity: 30, stream: 'SCIENCE', school_section: 'SENIOR' },
            { tenant_id: tenants[1].id, grade: 'Grade 10', section: 'B', room_number: '102', capacity: 30, stream: 'GENERAL' }
        ]);
        if (cErr) console.error('Classroom Seed Error:', cErr);
        else console.log('Classrooms Seeded');
    }

    console.log('--- SEEDING COMPLETE ---');
}

seed();
