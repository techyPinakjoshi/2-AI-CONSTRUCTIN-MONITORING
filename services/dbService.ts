
import { supabase } from './supabaseClient';
import { AiLogEntry } from '../types';

export const saveProjectData = async (userId: string, projectData: any) => {
  const { data, error } = await supabase
    .from('projects')
    .upsert({ 
      user_id: userId, 
      content: projectData,
      name: projectData.name,
      updated_at: new Date().toISOString() 
    })
    .select();

  if (error) throw error;
  return { success: true, data };
};

export const fetchUserProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
  return data.map((d: any) => ({ ...d.content, id: d.id }));
};

export const logAiAnalysis = async (userId: string, projectId: string, log: AiLogEntry) => {
    const { error } = await supabase.from('ai_logs').insert({ 
        user_id: userId, 
        project_id: projectId, 
        ...log 
    });
    if (error) console.error("Logging error:", error);
};

export const saveChatHistory = async (userId: string, messages: any[], chatId?: string) => {
  const payload = {
    user_id: userId,
    messages: messages,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('chat_history')
    .upsert(chatId ? { ...payload, id: chatId } : payload)
    .select();

  if (error) throw error;
  return data[0];
};

export const fetchChatHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) return [];
  return data;
};
