Teste: ENGWEB2026-Normal

Resumo
Este repositorio contem dois exercicios:

1. ex1: API de dados sobre jogos de tabuleiro (MongoDB + Express + Swagger).
2. ex2: Engenharia reversa da Reading List (MongoDB + Express + Nginx).

Exercicio 1 - Persistencia de dados

- SGBD: MongoDB
- Base de dados: jogostabuleiro
- Colecao: jogos
- Dataset: jogos.json (na raiz do repositorio)
- Modelo: esquema flexivel (strict: false) com campo id explicito.

Importacao automatica (Docker)

- Script: ex1/mongo-init/import.sh
- Mongo Dockerfile: ex1/Dockerfile.mongo
- Comando usado:
  mongoimport --host localhost --db jogostabuleiro --collection jogos --type json --file /docker-entrypoint-initdb.d/jogos.json --jsonArray

Queries (warm-up)

- As queries pedidas estao em: ex1/queries.txt

API de dados (ex1)

- Servico: ex1/server.js
- Porta: 17000
- Swagger: http://localhost:17000/api-docs

Rotas implementadas:

- GET /jogos
- GET /jogos/:id
- GET /jogos?editora=EEEE
- GET /autores
- GET /categorias
- POST /jogos
- PUT /jogos/:id
- DELETE /jogos/:id

Como executar (ex1)

1. cd ex1
2. docker compose up -d --build
3. API: http://localhost:17000/jogos
4. Swagger: http://localhost:17000/api-docs

Exercicio 2 - Persistencia de dados (Reading List)

- SGBD: MongoDB
- Base de dados: readinglist
- Colecao: livros
- Dataset: ex2/livros.json
- Modelo: ex2/server.js (titulo, autor, paginas, genero, lido)

Importacao automatica (Docker)

- Script: ex2/mongo-init/import.sh
- Mongo Dockerfile: ex2/Dockerfile.mongo

API de dados (ex2)

- Servico: ex2/server.js
- Porta: 19020
- Rotas:
  - GET /api/livros?search=X
  - POST /api/livros
  - PUT /api/livros/:id
  - DELETE /api/livros/:id

Interface Web (ex2)

- Servida por Nginx
- Porta: 19021

Como executar (ex2)

1. cd ex2
2. docker compose up -d --build
3. API: http://localhost:19020/api/livros
4. Frontend: http://localhost:19021
