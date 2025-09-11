const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://xvjjgeoxsvzwcvjihjih.supabase.co';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'SUA_CHAVE_SERVICE_ROLE_AQUI';

console.log('🗄️ Iniciando export do banco de dados Supabase...');

if (
  !SUPABASE_SERVICE_KEY ||
  SUPABASE_SERVICE_KEY === 'SUA_CHAVE_SERVICE_ROLE_AQUI'
) {
  console.error(
    '❌ Erro: Configure a chave SUPABASE_SERVICE_ROLE_KEY no arquivo .env'
  );
  console.log('📝 Adicione no .env:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Lista de tabelas para exportar
const tabelas = [
  'agendamentos',
  'pacientes',
  'profissionais',
  'servicos',
  'usuarios',
  'perfis',
  'permissoes',
  'roles',
];

async function exportarTabela(nomeTabela) {
  try {
    console.log(`📤 Exportando tabela: ${nomeTabela}...`);

    const { data, error } = await supabase.from(nomeTabela).select('*');

    if (error) {
      console.error(`❌ Erro ao exportar ${nomeTabela}:`, error.message);
      return null;
    }

    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Salvar como JSON
    const jsonFile = path.join(backupDir, `${nomeTabela}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));

    // Salvar como CSV
    const csvFile = path.join(backupDir, `${nomeTabela}.csv`);
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers
            .map(header => {
              const value = row[header];
              if (value === null || value === undefined) return '';
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
              }
              return value;
            })
            .join(',')
        ),
      ].join('\n');

      fs.writeFileSync(csvFile, csvContent);
    }

    console.log(`✅ ${nomeTabela}: ${data?.length || 0} registros exportados`);
    console.log(`   📄 JSON: ${jsonFile}`);
    console.log(`   📊 CSV: ${csvFile}`);

    return data;
  } catch (error) {
    console.error(`❌ Erro ao exportar ${nomeTabela}:`, error.message);
    return null;
  }
}

async function exportarTodasTabelas() {
  console.log('🚀 Iniciando export de todas as tabelas...');

  const resultados = {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  for (const tabela of tabelas) {
    const dados = await exportarTabela(tabela);
    if (dados) {
      resultados[tabela] = dados;
    }
  }

  // Salvar resumo do export
  const resumoFile = path.join(
    __dirname,
    '..',
    'backups',
    `resumo_export_${timestamp}.json`
  );
  const resumo = {
    timestamp: new Date().toISOString(),
    totalTabelas: Object.keys(resultados).length,
    tabelas: Object.keys(resultados).map(tabela => ({
      nome: tabela,
      registros: resultados[tabela].length,
    })),
    estatisticas: {
      totalRegistros: Object.values(resultados).reduce(
        (acc, dados) => acc + dados.length,
        0
      ),
    },
  };

  fs.writeFileSync(resumoFile, JSON.stringify(resumo, null, 2));

  console.log('\n📊 RESUMO DO EXPORT:');
  console.log(`📅 Data: ${resumo.timestamp}`);
  console.log(`📋 Tabelas exportadas: ${resumo.totalTabelas}`);
  console.log(`📈 Total de registros: ${resumo.estatisticas.totalRegistros}`);
  console.log(
    `📁 Arquivos salvos em: ${path.join(__dirname, '..', 'backups')}`
  );
  console.log(`📄 Resumo: ${resumoFile}`);

  return resultados;
}

// Executar export
exportarTodasTabelas()
  .then(() => {
    console.log('\n✅ Export concluído com sucesso!');
  })
  .catch(error => {
    console.error('\n❌ Erro durante o export:', error);
    process.exit(1);
  });
