#!/bin/bash
# Importa o JSON para a base de dados readinglist
mongoimport --host localhost --db readinglist --collection livros --type json --file /docker-entrypoint-initdb.d/livros.json --jsonArray