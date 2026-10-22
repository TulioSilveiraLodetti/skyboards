# SkyBoard's · Surf Skate Shop

E-commerce completo de uma skate shop (tênis, chinelos e mochilas Vans e Nike SB), com catálogo, carrinho, cupons de promoção, área do usuário e painel administrativo.

Projeto feito com base visual na loja real SkyBoard's, usando os produtos reais no catálogo.

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Front  | React + Vite + Tailwind CSS (JavaScript), GSAP para animações, React Router, Axios |
| Back   | Java Spring Boot, MySQL, JWT, Swagger |

## Estrutura

```
skyboardsPronto/
├── front/   # aplicação React (Vite)
└── back/    # API Spring Boot
```

## Funcionalidades

- Catálogo com filtros por categoria, busca e ordenação
- Página de produto com seleção de tamanho
- Carrinho e checkout com cupom de desconto
- Autenticação JWT (login e cadastro)
- Área do usuário: dados da conta, troca de senha, histórico de pedidos e favoritos
- Painel admin: CRUD de produtos, promoções (cupons), pedidos e usuários
- Animações impactantes (hero GSAP, parallax, reveals no scroll), respeitando `prefers-reduced-motion`

## Como rodar

### Pré-requisitos
- Node 18+
- Java 17+
- MySQL rodando em `localhost:3306`

### Back (API)

```bash
cd back
cp .env.example .env   # preencha DB_USER, DB_PASSWORD, JWT_SECRET
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8090`. O banco `skyboards` e os dados iniciais (produtos, usuários e cupons) são criados automaticamente.

### Front

```bash
cd front
npm install
npm run dev
```

O front sobe em `http://localhost:5180` e consome a API via `VITE_API_URL` (padrão `http://localhost:8090`).

## Logins de teste

| Perfil  | E-mail                   | Senha      |
|---------|--------------------------|------------|
| Admin   | admin@skyboards.com      | admin123   |
| Cliente | cliente@skyboards.com    | cliente123 |

## Segurança

Credenciais (banco, JWT, e-mail) ficam em `back/.env`, que **não** é versionado. Use o `back/.env.example` como modelo.
