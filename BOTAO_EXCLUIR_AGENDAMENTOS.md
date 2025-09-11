# 🗑️ Botão de Excluir Agendamentos na Lista

## ✅ **Funcionalidade Implementada**

Adicionei um botão de excluir agendamentos na tabela da Lista de Agendamentos com modal de
confirmação.

## 🔧 **Alterações Realizadas**

### **1. Estados Adicionados:**

```typescript
const [showDeleteModal, setShowDeleteModal] = useState(false);
```

### **2. Funções Implementadas:**

#### **handleDeleteAgendamento:**

```typescript
const handleDeleteAgendamento = (agendamento: Agendamento) => {
  setSelectedAgendamento(agendamento);
  setShowDeleteModal(true);
};
```

#### **confirmDeleteAgendamento:**

```typescript
const confirmDeleteAgendamento = async () => {
  if (!selectedAgendamento) return;

  // Verificar permissões
  if (!canAccess(['admin', 'gerente', 'recepcao', 'desenvolvedor'])) {
    toast.error('Você não tem permissão para excluir agendamentos');
    return;
  }

  try {
    setLoading(true);

    const { error } = await supabase.from('agendamentos').delete().eq('id', selectedAgendamento.id);

    if (error) throw error;

    toast.success('Agendamento excluído com sucesso!');
    loadData();
    setShowDeleteModal(false);
    setSelectedAgendamento(null);
  } catch (error: any) {
    console.error('Erro ao excluir agendamento:', error);
    toast.error(error.message || 'Erro ao excluir agendamento');
  } finally {
    setLoading(false);
  }
};
```

### **3. Coluna de Ações Adicionada:**

#### **Cabeçalho da Tabela:**

```tsx
<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
  Ações
</th>
```

#### **Botões de Ação:**

```tsx
{
  /* Ações */
}
<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
  <div className='flex space-x-2'>
    {/* Botão Editar */}
    {canAccess(['admin', 'gerente', 'recepcao', 'desenvolvedor']) && (
      <button
        className='text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50'
        title='Editar'
        onClick={() => handleEditAgendamento(agendamento)}
      >
        <Edit size={16} />
      </button>
    )}

    {/* Botão Excluir */}
    {canAccess(['admin', 'gerente', 'recepcao', 'desenvolvedor']) && (
      <button
        className='text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50'
        title='Excluir'
        onClick={() => handleDeleteAgendamento(agendamento)}
      >
        <XCircle size={16} />
      </button>
    )}
  </div>
</td>;
```

### **4. Modal de Confirmação:**

```tsx
{
  /* Modal Excluir Agendamento */
}
{
  showDeleteModal && selectedAgendamento && (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          onClick={() => setShowDeleteModal(false)}
        ></div>

        <div
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${getCardClasses()}`}
        >
          <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
                <XCircle size={20} className='text-red-600 dark:text-red-200' />
              </div>
              <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>Excluir Agendamento</h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>
                    Tem certeza que deseja excluir este agendamento? Esta ação não pode ser
                    desfeita.
                  </p>
                  <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                    <div className='text-sm text-gray-700'>
                      <p>
                        <strong>Paciente:</strong> {selectedAgendamento.pacientes?.nome}
                      </p>
                      <p>
                        <strong>Profissional:</strong> {selectedAgendamento.profissionais?.nome}
                      </p>
                      <p>
                        <strong>Data:</strong>{' '}
                        {new Date(selectedAgendamento.data).toLocaleDateString('pt-BR')}
                      </p>
                      <p>
                        <strong>Hora:</strong> {selectedAgendamento.hora}
                      </p>
                      <p>
                        <strong>Serviço:</strong> {selectedAgendamento.servicos?.nome}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
            <button
              type='button'
              className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm'
              onClick={confirmDeleteAgendamento}
              disabled={loading}
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </button>
            <button
              type='button'
              className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🎯 **Funcionalidades do Botão de Excluir**

### **✅ Recursos Implementados:**

1. **🔐 Controle de Permissões:**
   - Apenas usuários com permissão podem excluir
   - Roles: admin, gerente, recepcao, desenvolvedor

2. **⚠️ Modal de Confirmação:**
   - Mostra detalhes do agendamento
   - Aviso sobre ação irreversível
   - Botões "Excluir" e "Cancelar"

3. **🔄 Feedback Visual:**
   - Botão fica desabilitado durante exclusão
   - Texto muda para "Excluindo..."
   - Toast de sucesso/erro

4. **📊 Atualização Automática:**
   - Lista é recarregada após exclusão
   - Modal é fechado automaticamente
   - Estado é limpo

### **🎨 Design:**

- **Botão Vermelho** 🔴 - Ícone XCircle
- **Hover Effects** - Cores mais escuras
- **Responsivo** - Funciona em mobile e desktop
- **Acessível** - Tooltips e foco visível

## 📋 **Como Usar**

1. **Acesse a página de Agenda**
2. **Vá para a visualização "Lista"**
3. **Localize o agendamento desejado**
4. **Clique no botão vermelho** (ícone X)
5. **Confirme a exclusão** no modal
6. **Agendamento será removido** permanentemente

## ⚠️ **Avisos Importantes**

- **Ação Irreversível:** Exclusão não pode ser desfeita
- **Permissões:** Apenas usuários autorizados podem excluir
- **Dados Relacionados:** Verificar se não há dependências
- **Backup:** Considerar backup antes de exclusões em massa

## 🔧 **Arquivos Modificados**

- ✅ `src/pages/Agenda/Agenda.tsx` - Funcionalidade principal
- ✅ `BOTAO_EXCLUIR_AGENDAMENTOS.md` - Esta documentação

**O botão de excluir agendamentos está funcionando na Lista de Agendamentos!** 🗑️✨


