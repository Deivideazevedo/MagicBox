// 🎯 Importa configuração global do Zod para o servidor
// Aplica customErrorMap em todas as validações da API
import '@/lib/zod-config';

// Mock apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  import('./mock').then(({ default: mock }) => {
    mock.onAny().passThrough();
  });
}
