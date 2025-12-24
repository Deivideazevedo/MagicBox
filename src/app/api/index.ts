// 🎯 Importa configuração global do Zod para o servidor
// Aplica customErrorMap em todas as validações da API
import '@/lib/zod-config';

import mock from './mock';

mock.onAny().passThrough();
