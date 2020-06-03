'''
--- SleepJournal API microservice application ---
Author: Alessandro Martins
Module: sleep_journal
Description: module for the SleepJournal classes and related routines. Complain
documents are passed as JSON objects.
'''

import os
import ujson
import sqlite3
from flask import Flask, request, render_template, g

DATABASE = os.getenv('DB_PATH', './db/sleepJournal.db')
FEATURE_NAMES = ['entry_date', 'time_to_bed', 'time_lights_out',
                 'delay_to_sleep', 'number_times_wake', 'woke_during_night',
                 'time_wake_up', 'time_get_up', 'hours_slept',
                 'total_time_in_bed', 'sleep_efficiency']

app = Flask(__name__)


def convert_transpose(dic):
    new_m = []
    keys = list(dic.keys())
    rows = len(dic[keys[0]])
    for i in range(rows):
        new_m.append([])
        for j in range(len(keys)):
            new_m[-1].append(dic[keys[j]][i])

    return new_m


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route("/", methods=['GET'])
def index():
    return render_template('index.html')


@app.route("/saveData", methods=['POST'])
def save_data():
    sj = ujson.loads(request.form.get('sj'))
    rows = convert_transpose(sj)

    db = get_db()
    cur = db.cursor()
    cur.execute(f'''DELETE FROM sleep_journal WHERE entry_date IN ({
','.join(map(lambda s: '"' + s + '"', sj['entry_date']))
                })''')
    db.commit()

    cur.executemany(
        'INSERT INTO sleep_journal VALUES(?,?,?,?,?,?,?,?,?,?,?);', rows)
    db.commit()

    db.close()

    return 'insert_OK'


@app.route("/loadData", methods=['GET'])
def load_data():
    sj = {}
    db = get_db()
    cur = db.cursor()
    cur.execute('SELECT * FROM sleep_journal')
    data = cur.fetchall()

    db.close()

    if not len(data):
        return 'no_data'

    for row in data:
        for idx, feat in enumerate(FEATURE_NAMES):
            if feat not in sj:
                sj[feat] = []
            sj[feat].append(row[idx])

    return ujson.dumps(sj)
