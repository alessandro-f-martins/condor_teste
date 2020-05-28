'''
--- SleepJournal API application ---
Autor: Alessandro Martins
Módulo: config
Descrição: módulo de configuração para o sistema
'''
import os
from dotenv import load_dotenv

# Loads environment variables to system setup configuration. If they are not
# already set, uses dotenv module to load them from .flaskenv file

BASEDIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(dotenv_path=BASEDIR + '../.flaskenv')


class Config(object):
    ''' Config: global configuration class
    '''
    # === MongoDB setup variables
    # Uncomment MONGO_USERNAME and MONGO_PASSWORD if using password
    # authentication

    # MONGO_USERNAME = os.getenv('DB_USER')
    # MONGO_PASSWORD = os.getenv('DB_PASSWD')
    MONGO_HOST = os.getenv('DB_HOST')
    MONGO_PORT = os.getenv('DB_PORT')
    MONGO_DBNAME = os.getenv('DB_DATABASE')
    MONGO_URI = "mongodb://%s:%s/%s" % (MONGO_HOST, MONGO_PORT, MONGO_DBNAME)

    # === Log activation variables

    API_LOG_ACTIVE = (os.getenv('API_LOG_ACTIVE', '0') == '1')
    API_LOG_FILE = os.getenv('API_LOG_FILE')
