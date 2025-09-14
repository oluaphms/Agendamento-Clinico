import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Eye, EyeOff, Shield, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ChangePassword: React.FC = () => {
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem')
      return
    }

    if (senha.length < 3) {
      toast.error('A senha deve ter pelo menos 3 caracteres')
      return
    }

    setIsLoading(true)
    
    try {
      // const result = await changePassword(senha)
      const result = { success: true, message: 'Senha alterada com sucesso!' } // Mock implementation
      
      if (result.success) {
        toast.success(result.message)
        navigate('/dashboard')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleName = (role: string) => {
    const roles = {
      admin: 'Administrador',
      recepcao: 'Recepcionista',
      profissional: 'Profissional de Saúde',
      desenvolvedor: 'Desenvolvedor'
    }
    return roles[role as keyof typeof roles] || role
  }

  return (
    <>
      <Helmet>
        <title>Trocar Senha - Sistema de Clínica</title>
      </Helmet>

      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Primeiro Acesso
              </h2>
              
              <p className="text-gray-600 mb-4">
                Bem-vindo, <span className="font-semibold">{(user as any)?.nome || 'Usuário'}</span>
              </p>
              
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {getRoleName(user?.role || '')}
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Por segurança, você deve alterar sua senha no primeiro acesso.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nova Senha */}
              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite sua nova senha"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 3 caracteres
                </p>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="confirmarSenha"
                    type={mostrarConfirmar ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className={`block w-full pr-10 pl-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      confirmarSenha && senha !== confirmarSenha
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Confirme sua nova senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {mostrarConfirmar ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {confirmarSenha && senha !== confirmarSenha && (
                  <p className="mt-1 text-xs text-red-500">
                    As senhas não coincidem
                  </p>
                )}
                {confirmarSenha && senha === confirmarSenha && (
                  <p className="mt-1 text-xs text-green-500 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Senhas coincidem
                  </p>
                )}
              </div>

              {/* Validações */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos da senha:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={`flex items-center ${senha.length >= 3 ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${senha.length >= 3 ? 'text-green-600' : 'text-gray-300'}`} />
                    Mínimo 3 caracteres
                  </li>
                  <li className={`flex items-center ${confirmarSenha && senha === confirmarSenha ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${confirmarSenha && senha === confirmarSenha ? 'text-green-600' : 'text-gray-300'}`} />
                    Senhas coincidem
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !senha || !confirmarSenha || senha !== confirmarSenha}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Alterando senha...
                  </div>
                ) : (
                  'Alterar Senha'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Após alterar sua senha, você terá acesso completo ao sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChangePassword
