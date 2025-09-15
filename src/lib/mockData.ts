// Dados mock para todas as tabelas
export interface MockData {
  usuarios: Array<{
    id: number;
    nome: string;
    cpf: string;
    senha: string;
    email: string;
    nivel_acesso: string;
    primeiro_acesso: boolean;
  }>;
  pacientes: Array<{
    id: string;
    nome: string;
    cpf: string;
    telefone: string;
    data_nascimento: string;
    genero: string;
    email: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    created_at: string;
    updated_at: string;
  }>;
  profissionais: Array<{
    id: number;
    nome: string;
    especialidade: string;
    crm_cro: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  servicos: Array<{
    id: number;
    nome: string;
    preco: number;
    duracao_min: number;
  }>;
  agendamentos: Array<{
    id: number;
    paciente_id: number;
    profissional_id: number;
    servico_id: number;
    data: string;
    hora: string;
    status: string;
    observacoes: string;
    pacientes: { nome: string; telefone: string };
    profissionais: { nome: string; especialidade: string };
    servicos: { nome: string; duracao: number; valor: number };
    pagamentos: Array<{
      status: string;
      valor: number;
      forma_pagamento: string;
    }>;
  }>;
}

export const mockData: MockData = {
  usuarios: [
    {
      id: 1,
      nome: 'Administrador',
      cpf: '12345678900',
      senha: 'admin123',
      email: 'admin@clinica.com',
      nivel_acesso: 'admin',
      primeiro_acesso: false,
    },
    {
      id: 2,
      nome: 'Recepcionista',
      cpf: '98765432100',
      senha: 'recep123',
      email: 'recepcao@clinica.com',
      nivel_acesso: 'recepcao',
      primeiro_acesso: false,
    },
    {
      id: 3,
      nome: 'Profissional',
      cpf: '11122233344',
      senha: 'prof123',
      email: 'profissional@clinica.com',
      nivel_acesso: 'profissional',
      primeiro_acesso: false,
    },
    {
      id: 4,
      nome: 'Desenvolvedor Principal',
      cpf: '33333333333',
      senha: '333',
      email: 'dev@clinica.com',
      nivel_acesso: 'desenvolvedor',
      primeiro_acesso: true, // Usuário para testar primeiro acesso
    },
    {
      id: 5,
      nome: 'Desenvolvedor',
      cpf: '55555555555',
      senha: '555',
      email: 'dev@clinica.com',
      nivel_acesso: 'desenvolvedor',
      primeiro_acesso: false,
    },
  ],
  pacientes: [
    {
      id: '1',
      nome: 'João Silva',
      cpf: '123.456.789-00',
      telefone: '(11) 99999-9999',
      data_nascimento: '1990-01-15',
      genero: 'masculino',
      email: 'joao.silva@email.com',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      nome: 'Maria Santos',
      cpf: '987.654.321-00',
      telefone: '(11) 88888-8888',
      data_nascimento: '1985-05-20',
      genero: 'feminino',
      email: 'maria.santos@email.com',
      endereco: 'Av. Paulista, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z',
    },
    {
      id: '3',
      nome: 'Pedro Oliveira',
      cpf: '111.222.333-44',
      telefone: '(11) 77777-7777',
      data_nascimento: '1978-12-03',
      genero: 'masculino',
      email: 'pedro.oliveira@email.com',
      endereco: 'Rua Augusta, 789',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01305-000',
      created_at: '2024-02-01T09:15:00Z',
      updated_at: '2024-02-01T09:15:00Z',
    },
    {
      id: '4',
      nome: 'Ana Costa',
      cpf: '555.666.777-88',
      telefone: '(11) 66666-6666',
      data_nascimento: '1992-08-10',
      genero: 'feminino',
      email: 'ana.costa@email.com',
      endereco: 'Av. Faria Lima, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04538-132',
      created_at: '2024-02-05T16:45:00Z',
      updated_at: '2024-02-05T16:45:00Z',
    },
    {
      id: '5',
      nome: 'Carlos Mendes',
      cpf: '999.888.777-66',
      telefone: '(11) 55555-5555',
      data_nascimento: '1965-03-25',
      genero: 'masculino',
      email: 'carlos.mendes@email.com',
      endereco: 'Rua Oscar Freire, 200',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01426-000',
      created_at: '2024-02-10T11:20:00Z',
      updated_at: '2024-02-10T11:20:00Z',
    },
    {
      id: '6',
      nome: 'Fernanda Lima',
      cpf: '444.333.222-11',
      telefone: '(11) 44444-4444',
      data_nascimento: '1988-11-18',
      genero: 'feminino',
      email: 'fernanda.lima@email.com',
      endereco: 'Rua Bela Cintra, 500',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01415-000',
      created_at: '2024-02-15T13:10:00Z',
      updated_at: '2024-02-15T13:10:00Z',
    },
    {
      id: '7',
      nome: 'Roberto Alves',
      cpf: '777.888.999-00',
      telefone: '(11) 33333-3333',
      data_nascimento: '1975-07-12',
      genero: 'masculino',
      email: 'roberto.alves@email.com',
      endereco: 'Av. Rebouças, 300',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '05402-000',
      created_at: '2024-02-20T08:30:00Z',
      updated_at: '2024-02-20T08:30:00Z',
    },
    {
      id: '8',
      nome: 'Juliana Pereira',
      cpf: '222.111.000-99',
      telefone: '(11) 22222-2222',
      data_nascimento: '1995-04-30',
      genero: 'feminino',
      email: 'juliana.pereira@email.com',
      endereco: 'Rua Haddock Lobo, 150',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01414-000',
      created_at: '2024-02-25T15:45:00Z',
      updated_at: '2024-02-25T15:45:00Z',
    },
  ],
  profissionais: [
    {
      id: 1,
      nome: 'Dr. Carlos Mendes',
      especialidade: 'Cardiologia',
      crm_cro: '12345',
      status: 'ativo',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      nome: 'Dra. Ana Silva',
      especialidade: 'Pediatria',
      crm_cro: '67890',
      status: 'ativo',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 3,
      nome: 'Dr. Pedro Santos',
      especialidade: 'Neurologia',
      crm_cro: '54321',
      status: 'ativo',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
    {
      id: 4,
      nome: 'Dra. Maria Oliveira',
      especialidade: 'Ginecologia',
      crm_cro: '98765',
      status: 'ativo',
      created_at: '2024-01-04T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z',
    },
    {
      id: 5,
      nome: 'Dr. Roberto Lima',
      especialidade: 'Ortopedia',
      crm_cro: '13579',
      status: 'ativo',
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z',
    },
    {
      id: 6,
      nome: 'Dra. Fernanda Costa',
      especialidade: 'Dermatologia',
      crm_cro: '24680',
      status: 'ativo',
      created_at: '2024-01-06T00:00:00Z',
      updated_at: '2024-01-06T00:00:00Z',
    },
    {
      id: 7,
      nome: 'Dr. João Alves',
      especialidade: 'Oftalmologia',
      crm_cro: '11223',
      status: 'ativo',
      created_at: '2024-01-07T00:00:00Z',
      updated_at: '2024-01-07T00:00:00Z',
    },
    {
      id: 8,
      nome: 'Dra. Juliana Pereira',
      especialidade: 'Psicologia',
      crm_cro: '33445',
      status: 'ativo',
      created_at: '2024-01-08T00:00:00Z',
      updated_at: '2024-01-08T00:00:00Z',
    },
  ],
  servicos: [
    { id: 1, nome: 'Consulta Médica', preco: 150.0, duracao_min: 30 },
    { id: 2, nome: 'Consulta Cardiológica', preco: 200.0, duracao_min: 45 },
    { id: 3, nome: 'Consulta Pediátrica', preco: 120.0, duracao_min: 30 },
    { id: 4, nome: 'Consulta Neurológica', preco: 250.0, duracao_min: 60 },
    { id: 5, nome: 'Consulta Ginecológica', preco: 180.0, duracao_min: 40 },
    { id: 6, nome: 'Consulta Ortopédica', preco: 160.0, duracao_min: 30 },
    { id: 7, nome: 'Consulta Dermatológica', preco: 140.0, duracao_min: 25 },
    { id: 8, nome: 'Consulta Oftalmológica', preco: 130.0, duracao_min: 30 },
    { id: 9, nome: 'Sessão de Psicologia', preco: 100.0, duracao_min: 50 },
    { id: 10, nome: 'Exame de Sangue', preco: 80.0, duracao_min: 15 },
    { id: 11, nome: 'Ultrassom', preco: 120.0, duracao_min: 30 },
    { id: 12, nome: 'Raio-X', preco: 90.0, duracao_min: 20 },
    { id: 13, nome: 'Eletrocardiograma', preco: 60.0, duracao_min: 15 },
    { id: 14, nome: 'Teste Ergométrico', preco: 200.0, duracao_min: 60 },
    { id: 15, nome: 'Endoscopia', preco: 300.0, duracao_min: 45 },
  ],
  agendamentos: [
    {
      id: 1,
      paciente_id: 1,
      profissional_id: 1,
      servico_id: 2,
      data: '2024-12-20',
      hora: '09:00',
      status: 'realizado',
      observacoes: 'Consulta de rotina - check-up anual',
      pacientes: { nome: 'João Silva', telefone: '(11) 99999-9999' },
      profissionais: {
        nome: 'Dr. Carlos Mendes',
        especialidade: 'Cardiologia',
      },
      servicos: { nome: 'Consulta Cardiológica', duracao: 45, valor: 200.0 },
      pagamentos: [
        {
          status: 'pago',
          valor: 200.0,
          forma_pagamento: 'Cartão de Crédito',
        },
      ],
    },
    {
      id: 2,
      paciente_id: 2,
      profissional_id: 2,
      servico_id: 3,
      data: '2024-12-20',
      hora: '14:00',
      status: 'realizado',
      observacoes: 'Consulta pediátrica - vacinação',
      pacientes: { nome: 'Maria Santos', telefone: '(11) 88888-8888' },
      profissionais: { nome: 'Dra. Ana Silva', especialidade: 'Pediatria' },
      servicos: { nome: 'Consulta Pediátrica', duracao: 30, valor: 120.0 },
      pagamentos: [{ status: 'pago', valor: 120.0, forma_pagamento: 'PIX' }],
    },
    {
      id: 3,
      paciente_id: 3,
      profissional_id: 3,
      servico_id: 4,
      data: '2024-12-19',
      hora: '10:30',
      status: 'realizado',
      observacoes: 'Avaliação neurológica - dor de cabeça',
      pacientes: { nome: 'Pedro Oliveira', telefone: '(11) 77777-7777' },
      profissionais: {
        nome: 'Dr. Pedro Santos',
        especialidade: 'Neurologia',
      },
      servicos: { nome: 'Consulta Neurológica', duracao: 60, valor: 250.0 },
      pagamentos: [
        { status: 'pago', valor: 250.0, forma_pagamento: 'Dinheiro' },
      ],
    },
    {
      id: 4,
      paciente_id: 4,
      profissional_id: 4,
      servico_id: 5,
      data: '2024-12-19',
      hora: '15:30',
      status: 'realizado',
      observacoes: 'Consulta ginecológica - preventivo',
      pacientes: { nome: 'Ana Costa', telefone: '(11) 66666-6666' },
      profissionais: {
        nome: 'Dra. Maria Oliveira',
        especialidade: 'Ginecologia',
      },
      servicos: { nome: 'Consulta Ginecológica', duracao: 40, valor: 180.0 },
      pagamentos: [
        { status: 'pago', valor: 180.0, forma_pagamento: 'Cartão de Débito' },
      ],
    },
    {
      id: 5,
      paciente_id: 5,
      profissional_id: 5,
      servico_id: 6,
      data: '2024-12-18',
      hora: '08:00',
      status: 'realizado',
      observacoes: 'Consulta ortopédica - dor no joelho',
      pacientes: { nome: 'Carlos Mendes', telefone: '(11) 55555-5555' },
      profissionais: { nome: 'Dr. Roberto Lima', especialidade: 'Ortopedia' },
      servicos: { nome: 'Consulta Ortopédica', duracao: 30, valor: 160.0 },
      pagamentos: [{ status: 'pago', valor: 160.0, forma_pagamento: 'PIX' }],
    },
    {
      id: 6,
      paciente_id: 6,
      profissional_id: 6,
      servico_id: 7,
      data: '2024-12-18',
      hora: '11:00',
      status: 'realizado',
      observacoes: 'Consulta dermatológica - manchas na pele',
      pacientes: { nome: 'Fernanda Lima', telefone: '(11) 44444-4444' },
      profissionais: {
        nome: 'Dra. Fernanda Costa',
        especialidade: 'Dermatologia',
      },
      servicos: { nome: 'Consulta Dermatológica', duracao: 25, valor: 140.0 },
      pagamentos: [
        {
          status: 'pago',
          valor: 140.0,
          forma_pagamento: 'Cartão de Crédito',
        },
      ],
    },
    {
      id: 7,
      paciente_id: 7,
      profissional_id: 7,
      servico_id: 8,
      data: '2024-12-17',
      hora: '16:00',
      status: 'realizado',
      observacoes: 'Consulta oftalmológica - exame de vista',
      pacientes: { nome: 'Roberto Alves', telefone: '(11) 33333-3333' },
      profissionais: {
        nome: 'Dr. João Alves',
        especialidade: 'Oftalmologia',
      },
      servicos: { nome: 'Consulta Oftalmológica', duracao: 30, valor: 130.0 },
      pagamentos: [
        { status: 'pago', valor: 130.0, forma_pagamento: 'Dinheiro' },
      ],
    },
    {
      id: 8,
      paciente_id: 8,
      profissional_id: 8,
      servico_id: 9,
      data: '2024-12-17',
      hora: '14:30',
      status: 'realizado',
      observacoes: 'Sessão de psicologia - ansiedade',
      pacientes: { nome: 'Juliana Pereira', telefone: '(11) 22222-2222' },
      profissionais: {
        nome: 'Dra. Juliana Pereira',
        especialidade: 'Psicologia',
      },
      servicos: { nome: 'Sessão de Psicologia', duracao: 50, valor: 100.0 },
      pagamentos: [{ status: 'pago', valor: 100.0, forma_pagamento: 'PIX' }],
    },
    {
      id: 9,
      paciente_id: 1,
      profissional_id: 1,
      servico_id: 10,
      data: '2024-12-21',
      hora: '08:30',
      status: 'agendado',
      observacoes: 'Exame de sangue - check-up',
      pacientes: { nome: 'João Silva', telefone: '(11) 99999-9999' },
      profissionais: {
        nome: 'Dr. Carlos Mendes',
        especialidade: 'Cardiologia',
      },
      servicos: { nome: 'Exame de Sangue', duracao: 15, valor: 80.0 },
      pagamentos: [],
    },
    {
      id: 10,
      paciente_id: 2,
      profissional_id: 2,
      servico_id: 11,
      data: '2024-12-21',
      hora: '10:00',
      status: 'confirmado',
      observacoes: 'Ultrassom abdominal',
      pacientes: { nome: 'Maria Santos', telefone: '(11) 88888-8888' },
      profissionais: { nome: 'Dra. Ana Silva', especialidade: 'Pediatria' },
      servicos: { nome: 'Ultrassom', duracao: 30, valor: 120.0 },
      pagamentos: [],
    },
    {
      id: 11,
      paciente_id: 3,
      profissional_id: 3,
      servico_id: 12,
      data: '2024-12-22',
      hora: '09:30',
      status: 'agendado',
      observacoes: 'Raio-X do crânio',
      pacientes: { nome: 'Pedro Oliveira', telefone: '(11) 77777-7777' },
      profissionais: {
        nome: 'Dr. Pedro Santos',
        especialidade: 'Neurologia',
      },
      servicos: { nome: 'Raio-X', duracao: 20, valor: 90.0 },
      pagamentos: [],
    },
    {
      id: 12,
      paciente_id: 4,
      profissional_id: 1,
      servico_id: 13,
      data: '2024-12-22',
      hora: '11:30',
      status: 'confirmado',
      observacoes: 'Eletrocardiograma de rotina',
      pacientes: { nome: 'Ana Costa', telefone: '(11) 66666-6666' },
      profissionais: {
        nome: 'Dr. Carlos Mendes',
        especialidade: 'Cardiologia',
      },
      servicos: { nome: 'Eletrocardiograma', duracao: 15, valor: 60.0 },
      pagamentos: [],
    },
    {
      id: 13,
      paciente_id: 5,
      profissional_id: 1,
      servico_id: 14,
      data: '2024-12-23',
      hora: '07:00',
      status: 'agendado',
      observacoes: 'Teste ergométrico - avaliação cardíaca',
      pacientes: { nome: 'Carlos Mendes', telefone: '(11) 55555-5555' },
      profissionais: {
        nome: 'Dr. Carlos Mendes',
        especialidade: 'Cardiologia',
      },
      servicos: { nome: 'Teste Ergométrico', duracao: 60, valor: 200.0 },
      pagamentos: [],
    },
    {
      id: 14,
      paciente_id: 6,
      profissional_id: 4,
      servico_id: 15,
      data: '2024-12-23',
      hora: '14:00',
      status: 'confirmado',
      observacoes: 'Endoscopia digestiva',
      pacientes: { nome: 'Fernanda Lima', telefone: '(11) 44444-4444' },
      profissionais: {
        nome: 'Dra. Maria Oliveira',
        especialidade: 'Ginecologia',
      },
      servicos: { nome: 'Endoscopia', duracao: 45, valor: 300.0 },
      pagamentos: [],
    },
    {
      id: 15,
      paciente_id: 7,
      profissional_id: 2,
      servico_id: 3,
      data: '2024-12-24',
      hora: '08:00',
      status: 'agendado',
      observacoes: 'Consulta pediátrica - acompanhamento',
      pacientes: { nome: 'Roberto Alves', telefone: '(11) 33333-3333' },
      profissionais: { nome: 'Dra. Ana Silva', especialidade: 'Pediatria' },
      servicos: { nome: 'Consulta Pediátrica', duracao: 30, valor: 120.0 },
      pagamentos: [],
    },
  ],
};
