
import { ProjectStage, AiLogEntry } from '../types';

/**
 * DATABASE ARCHITECTURE:
 * We use a relational structure where every project is linked to a 'user_id'.
 * This ensures that when a customer logs in, they only see THEIR projects.
 */

// Placeholder for Supabase Client - In real app: import { supabase } from './supabaseClient'
const supabase: any = (window as any).supabase; 

export const saveProjectData = async (userId: string, projectData: any) => {
  console.log(`[DB] Upserting project for ${userId}`);
  
  if (!supabase) {
    // Fallback for local storage if DB not connected yet
    const key = `projects_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [...existing, { ...projectData, id: Date.now().toString(), updatedAt: new Date().toISOString() }];
    localStorage.setItem(key, JSON.stringify(updated));
    return { success: true, data: updated };
  }

  const { data, error } = await supabase
    .from('projects')
    .upsert({ 
      user_id: userId, 
      content: projectData,
      updated_at: new Date().toISOString() 
    });

  if (error) throw error;
  return { success: true, data };
};

export const fetchUserProjects = async (userId: string) => {
  if (!supabase) {
    const key = `projects_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId);

  if (error) return [];
  return data;
};

export const logAiAnalysis = async (userId: string, projectId: string, log: AiLogEntry) => {
    if (!supabase) return;
    await supabase.from('ai_logs').insert({ 
        user_id: userId, 
        project_id: projectId, 
        ...log 
    });
};
