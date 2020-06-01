# Variaveis de ambiente para a aplicacao Auspex:

ENV_BASE_DIR=${VIRTUAL_ENV}
FLASK_APP=${ENV_BASE_DIR}/../webapp/sleep_journal.py
# FLASK_DEBUG=1
FLASK_ENV=development
FLASK_RUN_PORT=5000
FLASK_RUN_HOST=0.0.0.0

# Variaveis de conexao ao banco de dados:

DB_USER=afmartins
DB_PASSWD=2112Rush
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=teste_auspex

