// Serviço para gerenciamento de permissões
import { supabase, checkSupabaseConnection } from '@/lib/supabase';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}

export interface FuncaoPermission {
  funcao: string;
  permissions: Permission[];
  customPermissions: Permission[];
}

export interface UserPermission {
  userId: string;
  userName: string;
  funcao: string;
  customPermissions: Permission[];
  overrides: Record<string, boolean>;
}

export class PermissionService {
  static async saveAllPermissions(
    funcaoPermissions: FuncaoPermission[],
    users: UserPermission[]
  ): Promise<boolean> {
    try {
      console.log('Salvando todas as permissões...');

      const isSupabaseConnected = await checkSupabaseConnection();

      if (isSupabaseConnected && supabase) {
        console.log('Salvando no Supabase...');
        // TODO: Implementar salvamento no Supabase
      } else {
        console.log('Salvando no banco local...');
      }

      // Salvar no localStorage como fallback
      localStorage.setItem(
        'funcaoPermissions',
        JSON.stringify(funcaoPermissions)
      );
      localStorage.setItem('userPermissions', JSON.stringify(users));

      return true;
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      return false;
    }
  }
}

export default PermissionService;
