
import bcrypt from 'bcrypt';
import { supabase } from './shared/supabase';

async function createAdminUser() {
  try {
    // Hash da senha "1234"
    const passwordHash = await bcrypt.hash('1234', 10);
    
    // Inserir usuário admin
    const { data, error } = await supabase
      .from('financas_users')
      .insert({
        username: 'admin',
        password_hash: passwordHash
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar usuário admin:', error);
      return;
    }
    
    console.log('Usuário admin criado com sucesso:', data);
    
    // Criar configurações padrão para o usuário admin
    const settingsResult = await supabase
      .from('financas_settings')
      .insert({
        user_id: data.id,
        currency_symbol: 'R$',
        user_name_display: 'Admin',
        theme: 'dark'
      });
    
    if (settingsResult.error) {
      console.error('Erro ao criar configurações:', settingsResult.error);
    } else {
      console.log('Configurações criadas com sucesso');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

createAdminUser();
