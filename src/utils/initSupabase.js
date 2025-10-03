import { supabase } from '../supabase';

/**
 * Supabaseの初期データを作成
 */
export async function initializeSupabase() {
  try {
    // 既存データを確認
    const { data: existingData, error: selectError } = await supabase
      .from('app_data')
      .select('*')
      .eq('id', 1)
      .single();

    if (existingData) {
      console.log('初期データは既に存在します');
      return { success: true, message: '初期データは既に存在します' };
    }

    // 初期データを挿入
    const { error: insertError } = await supabase
      .from('app_data')
      .insert({
        id: 1,
        staff: [],
        tasks: [],
        meetings: [],
        reports: [],
        shifts: [],
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('初期化エラー:', insertError);
      return { success: false, message: insertError.message };
    }

    console.log('初期データを作成しました');
    return { success: true, message: '初期データを作成しました' };
  } catch (err) {
    console.error('初期化エラー:', err);
    return { success: false, message: err.message };
  }
}
