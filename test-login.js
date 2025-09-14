// Teste simples para verificar o login
console.log('=== TESTE DE LOGIN ===');

// Simular dados mockados
const mockData = {
  usuarios: [
    {
      id: 4,
      nome: 'Desenvolvedor Principal',
      cpf: '33333333333',
      senha: '333',
      email: 'dev@clinica.com',
      nivel_acesso: 'desenvolvedor',
      primeiro_acesso: false,
    }
  ]
};

// Simular função de login
function testLogin(cpf, password) {
  console.log(`Testando login: CPF=${cpf}, Senha=${password}`);
  
  const cpfLimpo = cpf.replace(/[.\-\s]/g, '');
  console.log(`CPF limpo: ${cpfLimpo}`);
  
  const usuario = mockData.usuarios.find(u => u.cpf === cpfLimpo);
  console.log(`Usuário encontrado:`, usuario);
  
  if (!usuario) {
    console.log('❌ Usuário não encontrado');
    return false;
  }
  
  const senhaValida = usuario.senha === password;
  console.log(`Senha válida: ${senhaValida}`);
  
  if (senhaValida) {
    console.log('✅ Login bem-sucedido!');
    return true;
  } else {
    console.log('❌ Senha incorreta');
    return false;
  }
}

// Testar diferentes formatos de CPF
console.log('\n--- Teste 1: CPF com pontos e traços ---');
testLogin('333.333.333-33', '333');

console.log('\n--- Teste 2: CPF sem formatação ---');
testLogin('33333333333', '333');

console.log('\n--- Teste 3: CPF com espaços ---');
testLogin('333 333 333 33', '333');

console.log('\n--- Teste 4: Senha incorreta ---');
testLogin('333.333.333-33', '123');

console.log('\n--- Teste 5: CPF incorreto ---');
testLogin('123.456.789-00', '333');
