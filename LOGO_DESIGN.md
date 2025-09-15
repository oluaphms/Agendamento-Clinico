# Logo do Sistema Clínico

## 🎨 Design da Logo

### Conceito

A logo foi criada com base no conceito de um estetoscópio estilizado, símbolo universal da área
médica, combinado com um design moderno e gradiente colorido.

### Elementos Visuais

- **Ícone Principal**: Estetoscópio estilizado com design minimalista
- **Forma**: Círculo com gradiente de cores
- **Cores**: Gradiente azul (#3B82F6) → roxo (#8B5CF6) → rosa (#EC4899)
- **Estilo**: Moderno, limpo e profissional

### Arquivos Criados

#### Logos Principais

- `public/logo.svg` - Logo padrão (64x64px)
- `public/logo-large.svg` - Logo grande (128x128px)

#### Ícones PWA

- `public/icons/icon-192x192.svg` - Ícone 192x192px
- `public/icons/icon-512x512.svg` - Ícone 512x512px
- `public/favicon.ico` - Favicon (baseado na logo)

### Implementação

#### Página de Login

- Logo grande (128x128px) no cabeçalho
- Substitui o ícone anterior do Building2
- Responsiva e otimizada

#### Página de Apresentação

- Logo padrão (64x64px) no cabeçalho
- Logo grande (128x128px) na seção hero
- Substitui os ícones Stethoscope e Heart

#### PWA (Progressive Web App)

- Manifest.json atualizado com novos ícones
- Cores do tema atualizadas para combinar com a logo
- Background color: #1f2937 (cinza escuro)
- Theme color: #3B82F6 (azul)

### Características Técnicas

#### Formato SVG

- Vetorial, escalável sem perda de qualidade
- Pequeno tamanho de arquivo
- Suporte a gradientes
- Compatível com todos os navegadores modernos

#### Responsividade

- Adapta-se a diferentes tamanhos de tela
- Mantém proporções em qualquer resolução
- Otimizada para dispositivos móveis

#### Acessibilidade

- Alt text descritivo
- Contraste adequado
- Funciona bem em modo escuro e claro

### Cores da Marca

#### Gradiente Principal

```css
background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
```

#### Cores de Apoio

- **Azul**: #3B82F6 (cor primária)
- **Roxo**: #8B5CF6 (cor secundária)
- **Rosa**: #EC4899 (cor de destaque)
- **Branco**: #FFFFFF (texto e elementos)

### Uso da Logo

#### Quando Usar

- ✅ Páginas de login e apresentação
- ✅ Favicon do navegador
- ✅ Ícone do PWA
- ✅ Documentação e materiais de marketing
- ✅ Cabeçalhos e rodapés

#### Quando NÃO Usar

- ❌ Em fundos coloridos que conflitem
- ❌ Em tamanhos muito pequenos (menos de 16px)
- ❌ Distorcida ou com proporções alteradas
- ❌ Com cores diferentes das especificadas

### Manutenção

#### Atualizações

- Para alterar cores: editar o gradiente nos arquivos SVG
- Para alterar tamanho: usar CSS ou criar nova versão
- Para alterar elementos: editar o código SVG diretamente

#### Backup

- Manter versões originais dos arquivos
- Documentar mudanças realizadas
- Testar em diferentes dispositivos após alterações

## 📱 Instalação no Mobile

A logo foi configurada para aparecer corretamente quando o usuário instalar o app no mobile:

1. **Ícone do App**: Usa a logo 192x192px
2. **Splash Screen**: Usa a logo 512x512px
3. **Tema**: Cores combinam com a identidade visual
4. **Nome**: "Sistema Clínico" / "Clínica"

### Configuração PWA

```json
{
  "name": "Sistema Clínico",
  "short_name": "Clínica",
  "theme_color": "#3B82F6",
  "background_color": "#1f2937",
  "icons": [
    {
      "src": "/icons/icon-192x192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/icons/icon-512x512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

## 🎯 Resultado Final

A logo criada é:

- ✅ Profissional e moderna
- ✅ Representativa da área médica
- ✅ Responsiva e escalável
- ✅ Otimizada para PWA
- ✅ Compatível com tema escuro
- ✅ Fácil de reconhecer e lembrar
