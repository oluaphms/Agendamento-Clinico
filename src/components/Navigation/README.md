# NavigationManager - Persistência de Navegação

## 📋 Funcionalidade

O `NavigationManager` gerencia a persistência de navegação do sistema, garantindo que:

1. **Usuários logados** sejam redirecionados para a última página que estavam navegando ao atualizar
   a página
2. **Usuários que fizeram logout** sejam redirecionados para a página de apresentação ao atualizar a
   página

## 🔧 Como Funciona

### 1. Salvamento da Última Página

- Quando o usuário navega por páginas do sistema (`/app/*`), a rota atual é salva no `localStorage`
- Rotas de autenticação (`/login`, `/register`, etc.) não são salvas
- A rota base `/app` também não é salva

### 2. Redirecionamento Inteligente

- **Usuário logado + última página salva**: Redireciona para a última página visitada
- **Usuário logado + sem última página**: Redireciona para o dashboard (`/app/dashboard`)
- **Usuário não logado**: Redireciona para a página de apresentação (`/`)

### 3. Controle de Logout

- Quando o usuário faz logout, uma flag é definida no `localStorage`
- Esta flag é limpa quando o usuário navega novamente
- Se a flag estiver presente, o usuário é redirecionado para a apresentação

## 🗂️ Chaves do localStorage

- `lastVisitedPath`: Armazena a última rota visitada pelo usuário
- `userLoggedOut`: Flag que indica se o usuário fez logout

## 📱 Exemplos de Uso

### Cenário 1: Usuário navegando normalmente

1. Usuário acessa `/app/pacientes`
2. Atualiza a página
3. **Resultado**: É redirecionado para `/app/pacientes`

### Cenário 2: Usuário faz logout

1. Usuário está em `/app/agenda`
2. Faz logout
3. Atualiza a página
4. **Resultado**: É redirecionado para `/` (apresentação)

### Cenário 3: Usuário logado sem histórico

1. Usuário faz login pela primeira vez
2. Atualiza a página
3. **Resultado**: É redirecionado para `/app/dashboard`

## 🔄 Integração

O `NavigationManager` é automaticamente incluído no `App.tsx` e funciona de forma transparente, sem
necessidade de configuração adicional.



