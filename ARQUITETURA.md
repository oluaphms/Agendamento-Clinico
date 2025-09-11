# 🏗️ Arquitetura do Sistema Clínico

## 📋 Visão Geral

Este documento descreve a arquitetura implementada no sistema clínico, seguindo as melhores práticas
de desenvolvimento React com TypeScript.

## 🎨 Padronização de Estilos

### Design Tokens

- **Localização**: `src/lib/design-tokens.ts`
- **Função**: Centraliza todas as constantes de design (cores, tipografia, espaçamentos, etc.)
- **Benefícios**: Consistência visual, manutenibilidade, facilidade de temas

### Tailwind CSS

- **Configuração**: `tailwind.config.js`
- **Tema**: Escuro como padrão [[memory:6664099]]
- **Customizações**: Cores personalizadas, animações, breakpoints
- **Status**: ✅ Totalmente implementado (sem dependências do Bootstrap)

## 🔄 Gerenciamento de Estado

### Context API Centralizado

- **AppContext**: `src/contexts/AppContext.tsx`
- **Funcionalidades**:
  - Estado global da aplicação
  - Notificações
  - Modais
  - Sidebar
  - Breadcrumb
  - Filtros
  - Configurações

### Zustand (Mantido)

- **AuthStore**: `src/stores/authStore.ts` - Autenticação
- **ThemeStore**: `src/stores/themeStore.ts` - Tema
- **MenuContext**: `src/contexts/MenuContext.tsx` - Menu

### Estrutura Híbrida

```
Estado Global
├── AppContext (Context API) - Estado da aplicação
├── AuthStore (Zustand) - Autenticação
├── ThemeStore (Zustand) - Tema
└── MenuContext (Context API) - Menu
```

## 🧩 Componentes Reutilizáveis

### Biblioteca UI

- **Localização**: `src/components/UI/`
- **Estrutura**:
  ```
  UI/
  ├── Button/ - Botões padronizados
  ├── Input/ - Campos de entrada
  ├── Card/ - Cards com header/body/footer
  ├── Modal/ - Modais reutilizáveis
  └── Loading/ - Indicadores de carregamento
  ```

### Características dos Componentes

- **TypeScript**: Tipagem completa
- **Acessibilidade**: Suporte a ARIA
- **Tema**: Suporte a tema claro/escuro
- **Animações**: Framer Motion integrado
- **Responsividade**: Mobile-first

## 🪝 Hooks Customizados

### Biblioteca de Hooks

- **Localização**: `src/hooks/`
- **Hooks Implementados**:
  - `useLocalStorage` - Gerenciamento de localStorage
  - `useDebounce` - Debounce de valores e callbacks
  - `useAsync` - Operações assíncronas
  - `useForm` - Gerenciamento de formulários

### Exemplo de Uso

```typescript
// useForm
const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues: { name: '', email: '' },
  validationRules: {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  },
  onSubmit: values => console.log(values),
});

// useAsync
const { data, loading, error, execute } = useAsync(fetchData, {
  immediate: true,
  onSuccess: data => console.log('Success:', data),
});
```

## 📁 Estrutura de Pastas

```
src/
├── components/
│   ├── UI/ - Componentes reutilizáveis
│   ├── Layout/ - Layout da aplicação
│   ├── Auth/ - Componentes de autenticação
│   └── ...
├── contexts/ - Contexts do React
├── hooks/ - Hooks customizados
├── lib/ - Utilitários e configurações
├── pages/ - Páginas da aplicação
├── stores/ - Zustand stores
└── ...
```

## 🎯 Padrões Implementados

### 1. Design System

- Design tokens centralizados
- Componentes padronizados
- Tema consistente

### 2. Gerenciamento de Estado

- Context API para estado global
- Zustand para estado específico
- Hooks customizados para lógica comum

### 3. Componentes

- Composição sobre herança
- Props tipadas
- Acessibilidade integrada

### 4. Hooks

- Lógica reutilizável
- Separação de responsabilidades
- TypeScript nativo

## 🚀 Benefícios da Arquitetura

### ✅ Consistência

- Design system unificado
- Padrões de código consistentes
- Experiência do usuário uniforme

### ✅ Manutenibilidade

- Código organizado e modular
- Fácil localização de funcionalidades
- Refatoração simplificada

### ✅ Escalabilidade

- Componentes reutilizáveis
- Estado gerenciado centralmente
- Hooks para lógica comum

### ✅ Performance

- Lazy loading de componentes
- Otimizações de re-render
- Debounce em operações custosas

### ✅ Developer Experience

- TypeScript para tipagem
- Hooks para lógica reutilizável
- Componentes bem documentados

## 🎨 **Melhorias de UX/UI Implementadas**

### ✅ **Design System Consistente**

- **Design Tokens**: Sistema centralizado de constantes
- **Componentes UI**: Biblioteca completa de componentes
- **Ícones**: Sistema padronizado de ícones
- **Layout**: Componentes de grid e flexbox responsivos

### ✅ **Responsividade Avançada**

- **Hooks Responsivos**: `useBreakpoint`, `useIsMobile`, `useIsDesktop`
- **Componentes Adaptativos**: Grid e Flex com breakpoints
- **CSS Responsivo**: Classes utilitárias para diferentes telas
- **Mobile-First**: Abordagem mobile-first em todos os componentes

### ✅ **Acessibilidade Completa**

- **ARIA**: Suporte completo a atributos ARIA
- **Navegação por Teclado**: Suporte a navegação por teclado
- **Screen Readers**: Compatibilidade com leitores de tela
- **Contraste**: Validação de contraste de cores
- **Foco Visível**: Indicadores de foco claros

### ✅ **Sistema de Animações**

- **Framer Motion**: Animações suaves e performáticas
- **Variants**: Configurações reutilizáveis de animação
- **Transições**: Sistema de transições padronizado
- **Hooks de Animação**: Hooks para gerenciar animações
- **Reduced Motion**: Respeita preferências de movimento

## 🔧 Próximos Passos

1. **Testes**: Implementar testes unitários e de integração
2. **Storybook**: Documentação interativa dos componentes
3. **PWA**: Funcionalidades de Progressive Web App
4. **Internacionalização**: Suporte a múltiplos idiomas
5. **Performance**: Otimizações de performance e bundle size

## 📚 Recursos Adicionais

- [Design Tokens](src/lib/design-tokens.ts)
- [Componentes UI](src/components/UI/)
- [Hooks Customizados](src/hooks/)
- [Contexts](src/contexts/)
- [Configuração Tailwind](tailwind.config.js)
