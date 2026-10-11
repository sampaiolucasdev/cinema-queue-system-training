# Cinema Queue & Ticket Booking System (Concurrency-Safe)

Um sistema de reserva de bilhetes de cinema de alta performance e **seguro contra concorrência (*race conditions*)**, construído para demonstrar arquitetura backend robusta utilizando padrões de engenharia de nível sênior.

---

## Sobre o Projeto

Em plataformas de alta procura (como compra de bilhetes para cinema ou concertos), o maior desafio técnico é evitar a sobreventa (*overselling*) — quando dois ou mais utilizadores tentam comprar o **mesmo assento** exatamente ao mesmo tempo. 

Este projeto resolve este problema combinando uma estratégia de **Lock Distribuído em memória (Redis)** como primeira barreira de controle e **Restrições de Integridade Relacional (PostgreSQL/Prisma)** como camada final de segurança.

---

## Tecnologias e Stack

* **Backend**: [NestJS](https://nestjs.com/) (Node.js & TypeScript)
* **Frontend**: [Next.js](https://nextjs.org/) (React & Tailwind CSS)
* **Base de Dados**: [PostgreSQL](https://www.postgresql.org/) gerido via [Prisma ORM](https://www.prisma.io/)
* **Controle de Concorrência**: [Redis](https://redis.io/) (`ioredis`) para locks atômicos baseados em TTL
* **Testes**: [Vitest](https://vitest.dev/) para testes unitários e de simulação de concorrência

---

## O Que Foi Treinado / Conceitos Aplicados

1. **Prevenção de Race Conditions**: Implementação de bloqueios distribuídos baseados em chaves temporárias no Redis (`SETNX` com tempo de expiração) para serializar tentativas concorrentes sobre o mesmo recurso.
2. **Arquitetura em Camadas (NestJS)**: Separação clara de responsabilidades entre Módulos, Controladores, Serviços e Provedores globais.
3. **Mecanismo de Auto-Setup**: Rotinas inteligentes no backend para detetar e criar automaticamente sessões e filmes de demonstração, facilitando testes imediatos sem fricção de migração manual de dados.
4. **Resiliência e Tratamento de Erros**: Gestão adequada de exceções HTTP (`ConflictException`) e liberação automática de locks (*unlock*) em caso de falha relacional.
5. **Integração Full-Stack**: Comunicação assíncrona entre um cliente Next.js reativo e uma API RESTful em NestJS com CORS habilitado.

---

## Como Clonar e Testar Localmente

Siga os passos abaixo para configurar e rodar o projeto na sua máquina.

### Pré-requisitos
* [Node.js](https://nodejs.org/) (v18+) instalado
* [Docker](https://www.docker.com/) e Docker Compose a correr (para o PostgreSQL e Redis)

### 1. Clonar o Repositório
```bash
git clone https://github.com/o-seu-utilizador/cinema-queue-system.git
cd cinema-queue-system
```

### 2. Subir a Infraestrutura (PostgreSQL & Redis)
Certifique-se de que o Docker está aberto e suba os contentores necessários (ou configure as suas instâncias locais):
```bash
# Caso possua um docker-compose.yml na raiz, ou suba individualmente:
docker run --name cinema-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cinema -p 5432:5432 -d postgres
docker run --name cinema-redis -p 6379:6379 -d redis
```

### 3. Configurar e Iniciar o Backend
Abra um terminal na pasta `backend`:
```bash
cd backend
npm install
```

Configure o arquivo `.env` com a sua string de conexão do PostgreSQL e Redis (exemplo):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cinema?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

Execute as migrações do Prisma e inicie o servidor:
```bash
npx prisma migrate dev --name init
npm run start:dev
```
*(O backend ficará disponível em `http://localhost:3333`)*

#### Executar os testes automatizados do Backend:
```bash
npm run test
```

### 4. Configurar e Iniciar o Frontend
Abra um **novo terminal** na pasta `frontend`:
```bash
cd frontend
npm install
npm run dev
```
*(O frontend ficará disponível em `http://localhost:3000`)*

---

## 🧪 Como Testar o Conflito de Concorrência

1. Abra o navegador em `http://localhost:3000`.
2. Abra **duas abas diferentes** (ou uma aba normal e uma anónima) lado a lado.
3. Na **Aba 1**, mantenha o ID de utilizador como `user-1`. Na **Aba 2**, mude para `user-2`.
4. Escolha um assento fresco (ex: **Assento 7**) e clique nele em ambas as abas **ao mesmo tempo**.
5. **Resultado esperado**: 
   * Uma aba receberá a mensagem de **Sucesso** (`Assento reservado`).
   * A outra aba será imediatamente barrada com uma mensagem de **Conflito/Indisponível**, provando que o lock distribuído do Redis e as regras de negócio funcionam perfeitamente sob carga concorrente.