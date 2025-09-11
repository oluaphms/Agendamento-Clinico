// =====================================================
// VERIFICAÇÃO DE SEGURANÇA DOS USUÁRIOS PADRÃO
// =====================================================
// Este script verifica especificamente a seção de segurança

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase (substitua pelas suas)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSeguranca() {
  try {
    console.log('========================================');
    console.log('VERIFICAÇÃO DE SEGURANÇA');
    console.log('========================================');
    
    // Verificar usuários padrão
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('nome, cpf, senha_hash, primeiro_acesso, status')
      .in('cpf', ['111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44'])
      .order('cpf');
    
    if (error) {
      console.log('Erro ao consultar usuários:', error.message);
      console.log('');
      console.log('Possíveis soluções:');
      console.log('1. Verifique se as credenciais do Supabase estão corretas');
      console.log('2. Execute primeiro o script setup-usuarios-padrao-completo.sql');
      console.log('3. Verifique se a tabela usuarios existe');
      return;
    }
    
    if (!usuarios || usuarios.length === 0) {
      console.log('⚠ Nenhum usuário padrão encontrado');
      console.log('');
      console.log('Para criar os usuários padrão, execute:');
      console.log('\\i scripts/setup-usuarios-padrao-completo.sql');
      return;
    }
    
    console.log(`Usuários encontrados: ${usuarios.length} de 4`);
    console.log('');
    
    // Verificar cada usuário
    usuarios.forEach(usuario => {
      const statusSenha = usuario.senha_hash && usuario.senha_hash.startsWith('$2') 
        ? '✓ Senha criptografada (bcrypt)' 
        : '⚠ Senha não criptografada';
      
      console.log(`Usuário: ${usuario.nome}`);
      console.log(`CPF: ${usuario.cpf}`);
      console.log(`Status da Senha: ${statusSenha}`);
      console.log(`Primeiro Acesso: ${usuario.primeiro_acesso ? 'Sim' : 'Não'}`);
      console.log(`Status: ${usuario.status}`);
      console.log('----------------------------------------');
    });
    
    // Verificações de segurança
    const senhasCriptografadas = usuarios.filter(u => u.senha_hash && u.senha_hash.startsWith('$2')).length;
    const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length;
    const primeiroAcessoConfigurado = usuarios.filter(u => !u.primeiro_acesso).length;
    const totalUsuarios = usuarios.length;
    
    console.log('');
    console.log('RESUMO DE SEGURANÇA:');
    console.log(`Senhas criptografadas: ${senhasCriptografadas}/${totalUsuarios}`);
    console.log(`Usuários ativos: ${usuariosAtivos}/${totalUsuarios}`);
    console.log(`Primeiro acesso configurado: ${primeiroAcessoConfigurado}/${totalUsuarios}`);
    console.log('');
    
    // Verificações de integridade
    if (senhasCriptografadas === totalUsuarios) {
      console.log('✅ Todas as senhas estão criptografadas corretamente');
    } else {
      console.log('⚠ Algumas senhas não estão criptografadas');
    }
    
    if (usuariosAtivos === totalUsuarios) {
      console.log('✅ Todos os usuários estão ativos');
    } else {
      console.log('⚠ Alguns usuários não estão ativos');
    }
    
    if (primeiroAcessoConfigurado === totalUsuarios) {
      console.log('✅ Primeiro acesso configurado corretamente para todos');
    } else {
      console.log('⚠ Primeiro acesso não configurado para alguns usuários');
    }
    
    console.log('');
    console.log('========================================');
    console.log('VERIFICAÇÃO DE SEGURANÇA CONCLUÍDA');
    console.log('========================================');
    
  } catch (error) {
    console.log('Erro na verificação:', error.message);
    console.log('');
    console.log('Para executar este script:');
    console.log('1. Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY');
    console.log('2. Ou edite este arquivo com suas credenciais do Supabase');
    console.log('3. Execute: node scripts/verificar-seguranca.js');
  }
}

// Executar verificação
verificarSeguranca();
