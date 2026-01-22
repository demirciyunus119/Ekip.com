import { supabase, SUPABASE_TABLES } from './supabaseClient';
import { Member } from '../types';

export const memberService = {
  async getMembers(): Promise<{ data: Member[] | null; error: any }> {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MEMBERS)
      .select('id, name, surname, "phoneNumber", created_at'); // Yeni 'name' ve 'created_at' sütunlarını seçiyoruz
    
    if (data) {
      const mappedData: Member[] = data.map((item: any) => ({
        id: item.id,
        name: item.name, // 'name' alanını eşliyoruz
        surname: item.surname,
        phoneNumber: item.phoneNumber,
        tcId: item.id,
        createdAt: item.created_at, // 'created_at' alanını eşliyoruz
      }));
      return { data: mappedData, error: null };
    }
    return { data: null, error };
  },

  async getMemberById(tcId: string): Promise<{ data: Member | null; error: any }> {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MEMBERS)
      .select('id, name, surname, "phoneNumber", created_at') // Yeni 'name' ve 'created_at' sütunlarını seçiyoruz
      .eq('id', tcId)
      .single(); 
    
    if (data) {
      const mappedData: Member = {
        id: data.id,
        name: data.name, // 'name' alanını eşliyoruz
        surname: data.surname,
        phoneNumber: data.phoneNumber,
        tcId: data.id,
        createdAt: data.created_at, // 'created_at' alanını eşliyoruz
      };
      return { data: mappedData, error: null };
    }
    return { data: null, error };
  },

  async addMember(member: Member): Promise<{ data: Member | null; error: any }> {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MEMBERS)
      .insert({ id: member.tcId, name: member.name, surname: member.surname, phoneNumber: member.phoneNumber }) // 'name' alanını insert ediyoruz
      .select('id, name, surname, "phoneNumber", created_at') // Yeni 'name' ve 'created_at' sütunlarını seçerek geri döndürüyoruz
      .single();

    if (data) {
        const mappedData: Member = {
            id: data.id,
            name: data.name, // 'name' alanını eşliyoruz
            surname: data.surname,
            phoneNumber: data.phoneNumber,
            tcId: data.id,
            createdAt: data.created_at, // 'created_at' alanını eşliyoruz
        };
        return { data: mappedData, error: null };
    }
    return { data: null, error };
  },

  async updateMember(updatedMember: Member): Promise<{ data: Member | null; error: any }> {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MEMBERS)
      .update({
        name: updatedMember.name, // 'name' alanını güncelliyoruz
        surname: updatedMember.surname,
        phoneNumber: updatedMember.phoneNumber,
      })
      .eq('id', updatedMember.tcId)
      .select('id, name, surname, "phoneNumber", created_at') // Yeni 'name' ve 'created_at' sütunlarını seçerek geri döndürüyoruz
      .single();
    
    if (data) {
        const mappedData: Member = {
            id: data.id,
            name: data.name, // 'name' alanını eşliyoruz
            surname: data.surname,
            phoneNumber: data.phoneNumber,
            tcId: data.id,
            createdAt: data.created_at, // 'created_at' alanını eşliyoruz
        };
        return { data: mappedData, error: null };
    }
    return { data: null, error };
  },

  async deleteMember(tcId: string): Promise<{ success: boolean; error: any }> {
    const { error } = await supabase
      .from(SUPABASE_TABLES.MEMBERS)
      .delete()
      .eq('id', tcId);
    return { success: !error, error };
  },
};