// // src/middleware.ts

// import { getToken } from 'next-auth/jwt';
// import { NextRequest, NextResponse } from 'next/server';

// export async function middleware(request: NextRequest) {
//   // A chave secreta para decodificar o token JWT. Deve ser a mesma do seu [...nextauth].ts
//   const secret = process.env.NEXTAUTH_SECRET;

//   // Pega o token da requisição para verificar se o usuário está logado.
//   // O token existe se o usuário fez login e o cookie de sessão é válido.
//   const token = await getToken({ req: request, secret });
//   const isLoggedIn = !!token;

//   // Pega a URL da requisição atual
//   const { nextUrl } = request;
//   const pathname = nextUrl.pathname;

//   // --- Definição das Rotas ---
//   const publicRoutes = ['/']; // Adicione outras rotas públicas aqui, ex: '/sobre'
//   const authRoutes = ['/auth/auth1/login', '/auth/error']; // Rotas de autenticação
//   const apiAuthPrefix = '/api/auth'; // Prefixo das rotas de API do NextAuth

//   // --- Checagens de Tipo de Rota ---
//   const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
//   const isPublicRoute = publicRoutes.includes(pathname);
//   const isAuthRoute = authRoutes.includes(pathname);

//   // O middleware não deve interferir com as rotas internas do NextAuth.
//   if (isApiAuthRoute) {
//     NextResponse.next()
//   }

//   // --- Lógica de Roteamento de Erros ---
//   const error = nextUrl.searchParams.get('error');
//   if (isAuthRoute && error) {
//     // Se a requisição para uma rota de autenticação já contém um erro,
//     // redirecionamos para a página de erro dedicada.
//     const errorPageUrl = new URL('/auth/error', request.url);
//     errorPageUrl.searchParams.set('error', error);
//     return NextResponse.redirect(errorPageUrl);
//   }

//   // --- Lógica de Controle de Acesso ---

//   // 1. Se o usuário está logado e tenta acessar uma rota de autenticação (ex: /login),
//   //    redirecionamos para a página principal ou um dashboard.
//   if (isLoggedIn && isAuthRoute) {
//     return NextResponse.redirect(new URL('/', request.url));
//   }

//   // 2. Se o usuário NÃO está logado e tenta acessar uma rota protegida,
//   //    redirecionamos para a página de login, guardando a URL que ele queria acessar.
//   if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
//     // Codifica a URL de destino para ser passada como parâmetro
//     const callbackUrl = encodeURIComponent(pathname);
//     return NextResponse.redirect(
//       new URL(`/auth/auth1/login?callbackUrl=${callbackUrl}`, request.url)
//     );
//   }

//   // Se nenhuma das condições acima for atendida, permite que a requisição continue.
//   return NextResponse.next();
// }

// // O 'matcher' define em quais rotas este middleware será executado.
// // Esta regex otimizada exclui arquivos estáticos, imagens e as rotas da API do NextAuth.
// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };