'''
--- SleepJournal API application ---
Autor: Alessandro Martins
Descrição: inicializa o pacote api_main.
'''
from flask import Flask
from flask_restful import Api
from flask_pymongo import PyMongo
from util.config import Config


app = Flask(__name__)
app.config.from_object(Config)
api = Api(app)
api_db = PyMongo(app)

from api_main import api_routes
