# 🫀 Menu Cardíaco Horizontal - Sistema Inovador de Navegação

## Visão Geral

O **Menu Cardíaco Horizontal** é um componente de navegação inovador e temático para o Sistema de Gestão de
Clínica, inspirado em monitores cardíacos e equipamentos médicos. Ele oferece uma experiência de
usuário única com uma linha ECG horizontal que percorre a tela da esquerda para direita, liberando botões conforme avança.

## ✨ Características Principais

### 🎬 Animação de Abertura Horizontal

- **Linha de ECG Horizontal**: Percorre a tela da esquerda para direita
- **Tamanho Impactante**: Ocupa 80% da largura e 25% da altura da tela
- **Cor Azul Claro**: #00e0ff com efeito de brilho neon
- **Animação stroke-dasharray**: Linha é desenhada progressivamente em ~2s
- **Botões Liberados**: Aparecem conforme a linha alcança suas posições específicas

### 🎯 Botões do Menu

- **Agenda** 📅 - Gerenciamento de agendamentos (acima do 1º pico)
- **Pacientes** 👤 - Gestão de pacientes (abaixo do 1º pico)
- **Analytics** 📊 - Análises e métricas (acima do 2º pico)
- **Relatórios** 📑 - Relatórios do sistema (abaixo do 2º pico)
- **Notificações** 🔔 - Central de notificações (acima do 3º pico)
- **Usuários** 👥 - Gestão de usuários (abaixo do 3º pico)
- **Permissões** 🛡️ - Controle de acesso (acima do 4º pico)
- **Configurações** ⚙️ - Configurações do sistema (abaixo do 4º pico)

### 🎨 Design Visual

- **Fundo**: Semi-transparente escurecido com blur (bg-black/60)
- **Linha ECG**: Horizontal, centralizada, com picos pré-definidos
- **Botões Circulares**: w-16 h-16 rounded-full com ícones e labels
- **Posicionamento**: Botões alternam acima/abaixo da linha nos picos
- **Cores**: Azul claro (#00e0ff) para ECG, fundo escuro semi-transparente para botões
- **Efeitos**: Hover com brilho azul e escala 110%
- **Labels**: Nome do botão aparece abaixo do ícone
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## 🚀 Como Usar

### 1. Botão no Header

O menu pode ser acessado através do botão "Cardíaco" no cabeçalho da aplicação:

```tsx
// O botão já está integrado no Header.tsx
<button onClick={() => setIsCardiacMenuOpen(true)}>
  <Heart /> Cardíaco
</button>
```

### 2. Botão Flutuante

Alternativamente, use o botão flutuante no canto inferior direito:

```tsx
import { CardiacMenuButton } from '@/components/MenuCardiaco';

<CardiacMenuButton onClick={() => setIsCardiacMenuOpen(true)} />;
```

### 3. Implementação Completa

```tsx
import MenuCardiaco from '@/components/MenuCardiaco';

const [isCardiacMenuOpen, setIsCardiacMenuOpen] = useState(false);

<MenuCardiaco isOpen={isCardiacMenuOpen} onClose={() => setIsCardiacMenuOpen(false)} />;
```

## 🔧 Configuração

### Personalização das Cores

O menu usa as seguintes cores por padrão:

- **ECG Base**: `#00e0ff` (azul claro neon)
- **Picos Cardíacos**: `#00e0ff` (azul claro neon)
- **Botões Ativos**: Gradiente azul para ciano
- **Botões Inativos**: Fundo escuro semi-transparente (bg-black/50)
- **Bordas**: Branco/azul semi-transparente

### Ajuste de Timing

Para modificar o timing das animações:

```tsx
// No MenuCardiaco.tsx, linha ~60
const timer = setTimeout(() => {
  setEcgComplete(true);
  setShowButtons(true);
}, 1500); // Altere este valor (em ms)
```

## 📱 Responsividade

O menu é totalmente responsivo e se adapta a:

- **Desktop**: Layout centralizado com botões em coluna
- **Tablet**: Ajuste automático de tamanhos
- **Mobile**: Botões otimizados para toque

## 🎭 Animações

### Sequência de Abertura

1. **0.0s**: Overlay aparece com fade-in
2. **0.0s**: Linha de ECG começa a ser desenhada da esquerda para direita
3. **0.24s**: Primeiro botão (Agenda) aparece acima do 1º pico
4. **0.24s**: Segundo botão (Pacientes) aparece abaixo do 1º pico
5. **0.56s**: Terceiro botão (Analytics) aparece acima do 2º pico
6. **0.56s**: Quarto botão (Relatórios) aparece abaixo do 2º pico
7. **0.88s**: Quinto botão (Notificações) aparece acima do 3º pico
8. **0.88s**: Sexto botão (Usuários) aparece abaixo do 3º pico
9. **1.2s**: Sétimo botão (Permissões) aparece acima do 4º pico
10. **1.2s**: Oitavo botão (Configurações) aparece abaixo do 4º pico
11. **2.0s**: Linha ECG completa
12. **2.5s**: Título "Menu Cardíaco" aparece

### Efeitos de Hover

- **Escala**: Botões crescem 10% no hover (scale-110)
- **Brilho**: Efeito neon azul nos ícones
- **Labels**: Nome do botão aparece permanentemente abaixo do ícone
- **Sombra**: Sombra azul suave no hover
- **Posicionamento**: Botões alternam acima/abaixo da linha nos picos

## 🔒 Permissões

O menu respeita o sistema de permissões existente:

```tsx
const menuItems: MenuItem[] = [
  {
    icon: <Calendar size={24} />,
    label: 'Agenda',
    path: '/app/agenda',
    roles: ['admin', 'gerente', 'recepcao', 'profissional'],
  },
  // ... outros itens
];
```

## 🎨 Customização Avançada

### Modificar o SVG do ECG

```tsx
// No MenuCardiaco.tsx, linha ~230
<svg viewBox='0 0 1200 200' className='w-full h-full'>
  {/* Modifique o path para alterar a forma do ECG */}
  <path
    d='M50,100 L150,100 L200,60 L250,140 L300,100...'
    stroke='#00e0ff'
    strokeWidth='5'
    strokeDasharray='1200'
    strokeDashoffset={1200 - (ecgProgress * 12)}
    // ... resto da configuração
  />
</svg>
```

### Adicionar Novos Botões

```tsx
const menuItems: MenuItem[] = [
  // ... itens existentes
  {
    icon: <NovoIcone size={20} />,
    label: 'Novo Item',
    path: '/app/novo-item',
    roles: ['admin'],
    position: { x: 75, y: 'above' }, // Posição na linha e lado
  },
];
```

## 🐛 Solução de Problemas

### Menu não aparece

- Verifique se o estado `isCardiacMenuOpen` está sendo controlado corretamente
- Confirme se o componente está sendo renderizado no DOM

### Animações não funcionam

- Verifique se o Framer Motion está instalado
- Confirme se as dependências estão atualizadas

### Botões não respondem

- Verifique se as rotas estão configuradas corretamente
- Confirme se o React Router está funcionando

## 📈 Performance

O menu foi otimizado para:

- **Lazy Loading**: Componentes carregados sob demanda
- **Animações Suaves**: 60fps com Framer Motion
- **Memória**: Cleanup automático de timers e listeners
- **Bundle Size**: Mínimo impacto no tamanho final

## 🔮 Futuras Melhorias

- [ ] Temas personalizáveis
- [ ] Sons de equipamentos médicos
- [ ] Mais tipos de animações de ECG
- [ ] Integração com dados em tempo real
- [ ] Modo de acessibilidade aprimorado

---

**Desenvolvido com ❤️ para o Sistema de Gestão de Clínica**
