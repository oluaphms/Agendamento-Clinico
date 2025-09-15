// Script para limpar configurações de tema e garantir tema claro por padrão
console.log('🧹 Limpando configurações de tema...');

// Limpar localStorage do tema
localStorage.removeItem('theme');
localStorage.removeItem('user-preferences');

// Aplicar tema claro por padrão
document.documentElement.classList.remove('dark');
document.body.classList.remove('dark-theme');
document.body.classList.add('light-theme');
document.documentElement.setAttribute('data-theme', 'light');

console.log('✅ Tema claro aplicado por padrão');
console.log('📱 Recarregue a página para aplicar as mudanças');
