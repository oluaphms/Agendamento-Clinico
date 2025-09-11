const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://xvjjgeoxsvzwcvjihjia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ampnZW94c3Z6d2N2amloamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5ODYwNjQsImV4cCI6MjA3MTU2MjA2NH0.4FRJOc0pk--OnqdJyQDTXGn87doooRKJC7hYELy5sKs';

// Dados para popular as tabelas
const mockData = {
  pacientes: [
    {
      id: 1,
      nome: 'Ana Silva Santos',
      cpf: '123.456.789-01',
      telefone: '(11) 99999-1111',
      email: 'ana.silva@email.com',
      data_nascimento: '1985-03-15',
      observacoes: 'Paciente com histórico de alergias',
      convenio: 'Unimed',
      categoria: 'Particular',
      tags: 'VIP,Alergias',
      favorito: true,
      data_cadastro: '2024-01-15T10:30:00Z',
      ultima_atualizacao: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      nome: 'Carlos Eduardo Oliveira',
      cpf: '987.654.321-02',
      telefone: '(11) 88888-2222',
      email: 'carlos.oliveira@email.com',
      data_nascimento: '1978-07-22',
      observacoes: 'Paciente frequente, sempre pontual',
      convenio: 'Bradesco Saúde',
      categoria: 'Convenio',
      tags: 'Frequente,Pontual',
      favorito: false,
      data_cadastro: '2024-01-20T14:15:00Z',
      ultima_atualizacao: '2024-01-20T14:15:00Z'
    },
    {
      id: 3,
      nome: 'Maria Fernanda Costa',
      cpf: '456.789.123-03',
      telefone: '(11) 77777-3333',
      email: 'maria.costa@email.com',
      data_nascimento: '1992-11-08',
      observacoes: 'Primeira consulta',
      convenio: 'SUS',
      categoria: 'SUS',
      tags: 'Nova',
      favorito: false,
      data_cadastro: '2024-01-25T09:45:00Z',
      ultima_atualizacao: '2024-01-25T09:45:00Z'
    },
    {
      id: 4,
      nome: 'João Pedro Mendes',
      cpf: '789.123.456-04',
      telefone: '(11) 66666-4444',
      email: 'joao.mendes@email.com',
      data_nascimento: '1980-05-12',
      observacoes: 'Paciente com diabetes tipo 2',
      convenio: 'Amil',
      categoria: 'Convenio',
      tags: 'Diabetes,Crônico',
      favorito: true,
      data_cadastro: '2024-01-10T16:20:00Z',
      ultima_atualizacao: '2024-01-10T16:20:00Z'
    },
    {
      id: 5,
      nome: 'Lucia Helena Rodrigues',
      cpf: '321.654.987-05',
      telefone: '(11) 55555-5555',
      email: 'lucia.rodrigues@email.com',
      data_nascimento: '1975-09-30',
      observacoes: 'Paciente idosa, necessita acompanhante',
      convenio: 'NotreDame Intermédica',
      categoria: 'Convenio',
      tags: 'Idosa,Acompanhante',
      favorito: false,
      data_cadastro: '2024-01-05T11:10:00Z',
      ultima_atualizacao: '2024-01-05T11:10:00Z'
    },
    {
      id: 6,
      nome: 'Roberto Alves Pereira',
      cpf: '654.321.789-06',
      telefone: '(11) 44444-6666',
      email: 'roberto.pereira@email.com',
      data_nascimento: '1988-12-03',
      observacoes: 'Paciente atleta, exames regulares',
      convenio: 'Particular',
      categoria: 'Particular',
      tags: 'Atleta,Exames',
      favorito: true,
      data_cadastro: '2024-01-12T13:30:00Z',
      ultima_atualizacao: '2024-01-12T13:30:00Z'
    },
    {
      id: 7,
      nome: 'Fernanda Lima Souza',
      cpf: '147.258.369-07',
      telefone: '(11) 33333-7777',
      email: 'fernanda.lima@email.com',
      data_nascimento: '1995-04-18',
      observacoes: 'Paciente gestante, acompanhamento especial',
      convenio: 'SulAmérica',
      categoria: 'Convenio',
      tags: 'Gestante,Especial',
      favorito: false,
      data_cadastro: '2024-01-18T08:45:00Z',
      ultima_atualizacao: '2024-01-18T08:45:00Z'
    },
    {
      id: 8,
      nome: 'Antonio Carlos Ferreira',
      cpf: '369.258.147-08',
      telefone: '(11) 22222-8888',
      email: 'antonio.ferreira@email.com',
      data_nascimento: '1970-08-25',
      observacoes: 'Paciente com hipertensão',
      convenio: 'Golden Cross',
      categoria: 'Convenio',
      tags: 'Hipertensão,Crônico',
      favorito: false,
      data_cadastro: '2024-01-08T15:00:00Z',
      ultima_atualizacao: '2024-01-08T15:00:00Z'
    }
  ],
  profissionais: [
    {
      id: 1,
      nome: 'Dr. João Silva',
      cpf: '111.222.333-44',
      telefone: '(11) 99999-0001',
      email: 'joao.silva@clinica.com',
      especialidade: 'Cardiologia',
      crm: '123456-SP',
      observacoes: 'Especialista em arritmias',
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 2,
      nome: 'Dra. Maria Santos',
      cpf: '222.333.444-55',
      telefone: '(11) 99999-0002',
      email: 'maria.santos@clinica.com',
      especialidade: 'Dermatologia',
      crm: '234567-SP',
      observacoes: 'Especialista em câncer de pele',
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 3,
      nome: 'Dr. Carlos Oliveira',
      cpf: '333.444.555-66',
      telefone: '(11) 99999-0003',
      email: 'carlos.oliveira@clinica.com',
      especialidade: 'Ortopedia',
      crm: '345678-SP',
      observacoes: 'Especialista em coluna',
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 4,
      nome: 'Dra. Ana Costa',
      cpf: '444.555.666-77',
      telefone: '(11) 99999-0004',
      email: 'ana.costa@clinica.com',
      especialidade: 'Ginecologia',
      crm: '456789-SP',
      observacoes: 'Especialista em reprodução humana',
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 5,
      nome: 'Dr. Pedro Mendes',
      cpf: '555.666.777-88',
      telefone: '(11) 99999-0005',
      email: 'pedro.mendes@clinica.com',
      especialidade: 'Neurologia',
      crm: '567890-SP',
      observacoes: 'Especialista em epilepsia',
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 6,
      nome: 'Dra. Lucia Rodrigues',
      cpf: '666.777.888-99',
      telefone: '(11) 99999-0006',
      email: 'lucia.rodrigues@clinica.com',
      especialidade: 'Pediatria',
      crm: '678901-SP',
      observacoes: 'Especialista em neonatologia',
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 7,
      nome: 'Dr. Roberto Alves',
      cpf: '777.888.999-00',
      telefone: '(11) 99999-0007',
      email: 'roberto.alves@clinica.com',
      especialidade: 'Urologia',
      crm: '789012-SP',
      observacoes: 'Especialista em próstata',
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 8,
      nome: 'Dra. Fernanda Lima',
      cpf: '888.999.000-11',
      telefone: '(11) 99999-0008',
      email: 'fernanda.lima@clinica.com',
      especialidade: 'Psiquiatria',
      crm: '890123-SP',
      observacoes: 'Especialista em ansiedade e depressão',
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    }
  ],
  servicos: [
    {
      id: 1,
      nome: 'Consulta Médica',
      descricao: 'Consulta médica geral',
      duracao_min: 30,
      preco: 150.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 2,
      nome: 'Exame de Sangue',
      descricao: 'Coleta e análise de sangue',
      duracao_min: 15,
      preco: 80.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 3,
      nome: 'Ultrassom',
      descricao: 'Exame de ultrassonografia',
      duracao_min: 45,
      preco: 200.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 4,
      nome: 'Raio-X',
      descricao: 'Exame radiográfico',
      duracao_min: 20,
      preco: 120.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 5,
      nome: 'Eletrocardiograma',
      descricao: 'Exame cardíaco',
      duracao_min: 15,
      preco: 100.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 6,
      nome: 'Endoscopia',
      descricao: 'Exame do sistema digestivo',
      duracao_min: 60,
      preco: 350.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 7,
      nome: 'Mamografia',
      descricao: 'Exame de mama',
      duracao_min: 30,
      preco: 180.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 8,
      nome: 'Tomografia',
      descricao: 'Exame de tomografia computadorizada',
      duracao_min: 45,
      preco: 500.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 9,
      nome: 'Ressonância Magnética',
      descricao: 'Exame de ressonância magnética',
      duracao_min: 90,
      preco: 800.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 10,
      nome: 'Ecocardiograma',
      descricao: 'Exame do coração',
      duracao_min: 40,
      preco: 250.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 11,
      nome: 'Colonoscopia',
      descricao: 'Exame do cólon',
      duracao_min: 75,
      preco: 400.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 12,
      nome: 'Biópsia',
      descricao: 'Coleta de amostra para análise',
      duracao_min: 30,
      preco: 300.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 13,
      nome: 'Fisioterapia',
      descricao: 'Sessão de fisioterapia',
      duracao_min: 60,
      preco: 120.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 14,
      nome: 'Psicoterapia',
      descricao: 'Sessão de psicoterapia',
      duracao_min: 50,
      preco: 200.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    },
    {
      id: 15,
      nome: 'Nutrição',
      descricao: 'Consulta nutricional',
      duracao_min: 45,
      preco: 150.00,
      ativo: true,
      data_cadastro: '2024-01-01T08:00:00Z',
      ultima_atualizacao: '2024-01-01T08:00:00Z'
    }
  ],
  agendamentos: [
    {
      id: 1,
      paciente_id: 1,
      profissional_id: 1,
      servico_id: 1,
      data: '2024-01-15',
      hora: '09:00',
      duracao: 30,
      status: 'Realizado',
      origem: 'Sistema',
      valor_pago: 150.00,
      observacoes: 'Consulta de rotina',
      data_cadastro: '2024-01-10T10:00:00Z',
      ultima_atualizacao: '2024-01-15T09:30:00Z'
    },
    {
      id: 2,
      paciente_id: 2,
      profissional_id: 2,
      servico_id: 2,
      data: '2024-01-16',
      hora: '10:30',
      duracao: 15,
      status: 'Realizado',
      origem: 'Sistema',
      valor_pago: 80.00,
      observacoes: 'Exame de rotina',
      data_cadastro: '2024-01-11T11:00:00Z',
      ultima_atualizacao: '2024-01-16T10:45:00Z'
    },
    {
      id: 3,
      paciente_id: 3,
      profissional_id: 3,
      servico_id: 3,
      data: '2024-01-17',
      hora: '14:00',
      duracao: 45,
      status: 'Agendado',
      origem: 'Sistema',
      valor_pago: 0.00,
      observacoes: 'Primeira consulta',
      data_cadastro: '2024-01-12T12:00:00Z',
      ultima_atualizacao: '2024-01-12T12:00:00Z'
    },
    {
      id: 4,
      paciente_id: 4,
      profissional_id: 4,
      servico_id: 4,
      data: '2024-01-18',
      hora: '16:30',
      duracao: 20,
      status: 'Confirmado',
      origem: 'Sistema',
      valor_pago: 0.00,
      observacoes: 'Exame de rotina',
      data_cadastro: '2024-01-13T13:00:00Z',
      ultima_atualizacao: '2024-01-13T13:00:00Z'
    },
    {
      id: 5,
      paciente_id: 5,
      profissional_id: 5,
      servico_id: 5,
      data: '2024-01-19',
      hora: '08:30',
      duracao: 15,
      status: 'Realizado',
      origem: 'Sistema',
      valor_pago: 100.00,
      observacoes: 'Exame cardíaco',
      data_cadastro: '2024-01-14T14:00:00Z',
      ultima_atualizacao: '2024-01-19T08:45:00Z'
    },
    {
      id: 6,
      paciente_id: 6,
      profissional_id: 6,
      servico_id: 6,
      data: '2024-01-20',
      hora: '11:00',
      duracao: 60,
      status: 'Agendado',
      origem: 'Sistema',
      valor_pago: 0.00,
      observacoes: 'Exame especializado',
      data_cadastro: '2024-01-15T15:00:00Z',
      ultima_atualizacao: '2024-01-15T15:00:00Z'
    },
    {
      id: 7,
      paciente_id: 7,
      profissional_id: 7,
      servico_id: 7,
      data: '2024-01-21',
      hora: '13:30',
      duracao: 30,
      status: 'Confirmado',
      origem: 'Sistema',
      valor_pago: 0.00,
      observacoes: 'Exame de rotina',
      data_cadastro: '2024-01-16T16:00:00Z',
      ultima_atualizacao: '2024-01-16T16:00:00Z'
    },
    {
      id: 8,
      paciente_id: 8,
      profissional_id: 8,
      servico_id: 8,
      data: '2024-01-22',
      hora: '15:00',
      duracao: 45,
      status: 'Agendado',
      origem: 'Sistema',
      valor_pago: 0.00,
      observacoes: 'Exame especializado',
      data_cadastro: '2024-01-17T17:00:00Z',
      ultima_atualizacao: '2024-01-17T17:00:00Z'
    }
  ]
};

// Função para popular uma tabela
async function populateTable(tableName, data) {
  console.log(`\n📊 Populando tabela: ${tableName}`);
  
  try {
    // Limpar tabela existente
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', 0); // Deletar todos os registros
    
    if (deleteError) {
      console.log(`⚠️  Aviso ao limpar ${tableName}:`, deleteError.message);
    } else {
      console.log(`✅ Tabela ${tableName} limpa com sucesso`);
    }
    
    // Inserir novos dados
    const { data: insertedData, error: insertError } = await supabase
      .from(tableName)
      .insert(data);
    
    if (insertError) {
      console.error(`❌ Erro ao inserir em ${tableName}:`, insertError.message);
      return false;
    } else {
      console.log(`✅ ${data.length} registros inseridos em ${tableName}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Erro geral em ${tableName}:`, error.message);
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando configuração do Supabase...');
  console.log(`📡 Conectando em: ${supabaseUrl}`);
  
  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Testar conexão
  try {
    const { data, error } = await supabase.from('pacientes').select('count').limit(1);
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      console.log('💡 As tabelas podem não existir ainda. Vamos tentar criar...');
      
      // Tentar criar as tabelas manualmente via SQL
      console.log('\n📝 Para criar as tabelas, execute o seguinte SQL no Supabase Dashboard:');
      console.log('1. Acesse: https://supabase.com/dashboard');
      console.log('2. Vá para SQL Editor');
      console.log('3. Execute o script do arquivo supabase_schema.sql');
      console.log('4. Depois execute este script novamente');
      
      return;
    }
    console.log('✅ Conexão com Supabase estabelecida');
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    return;
  }
  
  // Popular tabelas
  const tables = ['pacientes', 'profissionais', 'servicos', 'agendamentos'];
  let successCount = 0;
  
  for (const tableName of tables) {
    if (mockData[tableName]) {
      const success = await populateTable(tableName, mockData[tableName]);
      if (success) successCount++;
    }
  }
  
  console.log(`\n🎉 Configuração concluída! ${successCount}/${tables.length} tabelas populadas com sucesso`);
  
  // Verificar dados inseridos
  console.log('\n📊 Verificando dados inseridos...');
  for (const tableName of tables) {
    if (mockData[tableName]) {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Erro ao verificar ${tableName}:`, error.message);
      } else {
        console.log(`✅ ${tableName}: ${count} registros`);
      }
    }
  }
}

// Executar script
main().catch(console.error);
