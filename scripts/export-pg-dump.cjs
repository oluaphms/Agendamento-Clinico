const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações do banco
const DB_HOST = 'db.xvjjgeoxsvzwcvjihjih.supabase.co';
const DB_PORT = '5432';
const DB_NAME = 'postgres';
const DB_USER = 'postgres';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || 'SUA_SENHA_DB_AQUI';

console.log('🗄️ Iniciando export via pg_dump...');

if (!DB_PASSWORD || DB_PASSWORD === 'SUA_SENHA_DB_AQUI') {
  console.error('❌ Erro: Configure a senha do banco de dados');
  console.log('📝 Adicione no .env:');
  console.log('SUPABASE_DB_PASSWORD=sua_senha_do_banco_aqui');
  process.exit(1);
}

// Criar diretório de backup
const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Comandos de export
const comandos = [
  {
    nome: 'Schema Completo',
    comando: `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} --schema-only --no-password`,
    arquivo: `schema_${timestamp}.sql`,
  },
  {
    nome: 'Dados Completos',
    comando: `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} --data-only --no-password`,
    arquivo: `data_${timestamp}.sql`,
  },
  {
    nome: 'Backup Completo',
    comando: `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} --no-password`,
    arquivo: `backup_completo_${timestamp}.sql`,
  },
  {
    nome: 'Tabelas Específicas',
    comando: `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -t agendamentos -t pacientes -t profissionais -t servicos --no-password`,
    arquivo: `tabelas_principais_${timestamp}.sql`,
  },
];

function executarComando(comando, arquivo) {
  return new Promise((resolve, reject) => {
    console.log(`📤 ${comando.nome}...`);

    const cmd = `PGPASSWORD=${DB_PASSWORD} ${comando.comando} > ${path.join(backupDir, arquivo)}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erro ao executar ${comando.nome}:`, error.message);
        reject(error);
        return;
      }

      if (stderr) {
        console.warn(`⚠️ Aviso ${comando.nome}:`, stderr);
      }

      const arquivoPath = path.join(backupDir, arquivo);
      if (fs.existsSync(arquivoPath)) {
        const stats = fs.statSync(arquivoPath);
        console.log(
          `✅ ${comando.nome} concluído: ${arquivo} (${(stats.size / 1024).toFixed(2)} KB)`
        );
      }

      resolve();
    });
  });
}

async function executarTodosComandos() {
  try {
    console.log('🚀 Iniciando export via pg_dump...');

    for (const comando of comandos) {
      await executarComando(comando, comando.arquivo);
    }

    console.log('\n📊 RESUMO DO EXPORT:');
    console.log(`📅 Data: ${new Date().toISOString()}`);
    console.log(`📁 Arquivos salvos em: ${backupDir}`);
    console.log(`📋 Arquivos gerados:`);

    const arquivos = fs
      .readdirSync(backupDir)
      .filter(arquivo => arquivo.includes(timestamp))
      .sort();

    arquivos.forEach(arquivo => {
      const stats = fs.statSync(path.join(backupDir, arquivo));
      console.log(`   📄 ${arquivo} (${(stats.size / 1024).toFixed(2)} KB)`);
    });

    console.log('\n✅ Export via pg_dump concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante o export:', error.message);
    process.exit(1);
  }
}

// Executar export
executarTodosComandos();
