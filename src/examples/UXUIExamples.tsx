// ============================================================================
// EXEMPLOS DE UX/UI - Demonstração das Melhorias
// ============================================================================
// Demonstração das melhorias de UX/UI implementadas
// ============================================================================

import { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  Icon,
  Container,
  Grid,
  Flex,
  AnimatedContainer,
  AnimatedText,
} from '@/components/UI';
import { useBreakpoint, useIsMobile, useIsDesktop } from '@/lib/responsive';
import {
  User,
  Mail,
  Phone,
  Search,
  Settings,
  Bell,
  Menu,
  X,
} from 'lucide-react';

// ============================================================================
// EXEMPLO DE RESPONSIVIDADE
// ============================================================================

export function ResponsiveExample() {
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  return (
    <Card className='w-full'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Exemplo de Responsividade</h3>
      </CardHeader>
      <CardBody>
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='bg-blue-100 dark:bg-blue-900 p-4 rounded-lg'>
              <h4 className='font-medium'>Breakpoint Atual</h4>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {breakpoint}
              </p>
            </div>
            <div className='bg-green-100 dark:bg-green-900 p-4 rounded-lg'>
              <h4 className='font-medium'>Dispositivo</h4>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {isMobile ? 'Mobile' : isDesktop ? 'Desktop' : 'Tablet'}
              </p>
            </div>
            <div className='bg-purple-100 dark:bg-purple-900 p-4 rounded-lg'>
              <h4 className='font-medium'>Largura da Tela</h4>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {typeof window !== 'undefined'
                  ? `${window.innerWidth}px`
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2'>
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center'
              >
                Item {item}
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// EXEMPLO DE ANIMAÇÕES
// ============================================================================

export function AnimationExample() {
  const [showAnimations, setShowAnimations] = useState(false);

  return (
    <Card className='w-full'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Exemplo de Animações</h3>
      </CardHeader>
      <CardBody>
        <div className='space-y-6'>
          <Button
            onClick={() => setShowAnimations(!showAnimations)}
            variant='primary'
          >
            {showAnimations ? 'Ocultar' : 'Mostrar'} Animações
          </Button>

          {showAnimations && (
            <div className='space-y-4'>
              <AnimatedContainer animation='fade' delay={0.1}>
                <div className='bg-blue-100 dark:bg-blue-900 p-4 rounded-lg'>
                  <AnimatedText animation='fadeIn' delay={0.2}>
                    Animação de Fade
                  </AnimatedText>
                </div>
              </AnimatedContainer>

              <AnimatedContainer animation='slide' direction='up' delay={0.3}>
                <div className='bg-green-100 dark:bg-green-900 p-4 rounded-lg'>
                  <AnimatedText animation='slideUp' delay={0.4}>
                    Animação de Slide
                  </AnimatedText>
                </div>
              </AnimatedContainer>

              <AnimatedContainer animation='scale' delay={0.5}>
                <div className='bg-purple-100 dark:bg-purple-900 p-4 rounded-lg'>
                  <AnimatedText animation='bounce' delay={0.6}>
                    Animação de Scale
                  </AnimatedText>
                </div>
              </AnimatedContainer>

              <AnimatedContainer animation='stagger' delay={0.7}>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                  {[1, 2, 3].map(item => (
                    <div
                      key={item}
                      className='bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg text-center'
                    >
                      Item {item}
                    </div>
                  ))}
                </div>
              </AnimatedContainer>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// EXEMPLO DE ACESSIBILIDADE
// ============================================================================

export function AccessibilityExample() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const menuItems = [
    { id: 'home', label: 'Início', icon: User },
    { id: 'profile', label: 'Perfil', icon: Settings },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ];

  return (
    <Card className='w-full'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Exemplo de Acessibilidade</h3>
      </CardHeader>
      <CardBody>
        <div className='space-y-4'>
          <div>
            <h4 className='font-medium mb-2'>Menu Acessível</h4>
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls='accessible-menu'
              variant='outline'
            >
              <Icon icon={isMenuOpen ? X : Menu} size='sm' className='mr-2' />
              {isMenuOpen ? 'Fechar' : 'Abrir'} Menu
            </Button>

            {isMenuOpen && (
              <div
                id='accessible-menu'
                role='menu'
                className='mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg'
              >
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    role='menuitem'
                    aria-selected={selectedItem === item.id}
                    onClick={() => {
                      setSelectedItem(item.id);
                      setIsMenuOpen(false);
                    }}
                    className='w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <Flex align='center' gap='sm'>
                      <Icon icon={item.icon} size='sm' />
                      <span>{item.label}</span>
                    </Flex>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className='font-medium mb-2'>Formulário Acessível</h4>
            <form className='space-y-4'>
              <Input
                label='Nome completo'
                placeholder='Digite seu nome'
                aria-describedby='name-help'
                helperText='Digite seu nome completo como aparece no documento'
              />

              <Input
                label='Email'
                type='email'
                placeholder='Digite seu email'
                aria-describedby='email-help'
                helperText='Usaremos este email para contato'
              />

              <Button type='submit' variant='primary'>
                Enviar Formulário
              </Button>
            </form>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// EXEMPLO DE DESIGN SYSTEM
// ============================================================================

export function DesignSystemExample() {
  return (
    <Card className='w-full'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>Exemplo de Design System</h3>
      </CardHeader>
      <CardBody>
        <div className='space-y-6'>
          <div>
            <h4 className='font-medium mb-4'>Botões</h4>
            <Flex wrap='wrap' gap='md'>
              <Button variant='primary' size='sm'>
                Primary
              </Button>
              <Button variant='secondary' size='sm'>
                Secondary
              </Button>
              <Button variant='success' size='sm'>
                Success
              </Button>
              <Button variant='warning' size='sm'>
                Warning
              </Button>
              <Button variant='danger' size='sm'>
                Danger
              </Button>
              <Button variant='outline' size='sm'>
                Outline
              </Button>
            </Flex>
          </div>

          <div>
            <h4 className='font-medium mb-4'>Ícones</h4>
            <Flex wrap='wrap' gap='md'>
              <Icon icon={User} variant='primary' />
              <Icon icon={Mail} variant='success' />
              <Icon icon={Phone} variant='warning' />
              <Icon icon={Search} variant='danger' />
              <Icon icon={Settings} variant='info' />
              <Icon icon={Bell} variant='secondary' />
            </Flex>
          </div>

          <div>
            <h4 className='font-medium mb-4'>Cards</h4>
            <Grid cols={3} gap='md'>
              <Card variant='default' hover>
                <CardBody>
                  <h5 className='font-medium'>Card Padrão</h5>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Este é um card padrão com hover
                  </p>
                </CardBody>
              </Card>

              <Card variant='elevated'>
                <CardBody>
                  <h5 className='font-medium'>Card Elevado</h5>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Este é um card com elevação
                  </p>
                </CardBody>
              </Card>

              <Card variant='outlined'>
                <CardBody>
                  <h5 className='font-medium'>Card Outline</h5>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Este é um card com borda
                  </p>
                </CardBody>
              </Card>
            </Grid>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function UXUIExamples() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
      <Container size='xl'>
        <AnimatedContainer animation='fade' delay={0.1}>
          <h1 className='text-4xl font-bold text-center mb-8'>
            <AnimatedText animation='fadeIn' delay={0.2}>
              Exemplos de UX/UI
            </AnimatedText>
          </h1>
        </AnimatedContainer>

        <div className='space-y-8'>
          <AnimatedContainer animation='slide' direction='up' delay={0.3}>
            <ResponsiveExample />
          </AnimatedContainer>

          <AnimatedContainer animation='slide' direction='up' delay={0.4}>
            <AnimationExample />
          </AnimatedContainer>

          <AnimatedContainer animation='slide' direction='up' delay={0.5}>
            <AccessibilityExample />
          </AnimatedContainer>

          <AnimatedContainer animation='slide' direction='up' delay={0.6}>
            <DesignSystemExample />
          </AnimatedContainer>
        </div>
      </Container>
    </div>
  );
}
