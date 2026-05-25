#!/bin/bash
# Importa o JSON para a base de dados jogostabuleiro
mongoimport --host localhost --db jogostabuleiro --collection jogos --type json --file /docker-entrypoint-initdb.d/jogos.json --jsonArray