'''
--- SleepJournal API microservice application ---
Author: Alessandro Martins
Module: sleep_journal
Description: module for the SleepJournal classes and related routines. Complain
documents are passed as JSON objects.
'''
# import json

from flask import Flask, render_template
# request,url_for, redirect, session
# from pymongo import ReturnDocument
# from api_main import api_db

app = Flask(__name__)


@app.route("/", methods=['GET'])
def index():
    return render_template('index.html')
