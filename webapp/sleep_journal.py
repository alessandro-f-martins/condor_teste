'''
--- SleepJournal API microservice application ---
Author: Alessandro Martins
Module: sleep_journal
Description: module for the SleepJournal classes and related routines. Complain
documents are passed as JSON objects.
'''

import os
import numpy as np
import ujson
import sqlite3
from flask import Flask, request, render_template, g

DATABASE = os.getenv('DB_PATH', './db/sleepJournal.db')
FEATURE_NAMES = ['entry_date', 'time_to_bed', 'time_lights_out',
                 'delay_to_sleep', 'number_times_wake', 'woke_during_night',
                 'time_wake_up', 'time_get_up', 'hours_slept',
                 'total_time_in_bed', 'sleep_efficiency']
STAT_NAMES = ['feature', 'min', 'max', 'mean', 'std']

app = Flask(__name__)


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
    rows = np.array([sj[k] for k in sj.keys()]).T.tolist()

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

    for row in data:
        for idx, feat in enumerate(FEATURE_NAMES):
            if feat not in sj:
                sj[feat] = []
            sj[feat].append(row[idx])

    ret = ujson.dumps(sj)
    print('##DEBUG: rows: %s' % ret)
    return ret


# sqlite> select * from sleep_journal;

# entry_date|time_to_bed|time_lights_out|delay_to_sleep|number_times_wake|woke_during_night|time_wake_up|time_get_up|hours_slept|total_time_in_bed|sleep_efficiency
# 31/05/2020|2020-05-31T02:30:00.000Z|2020-05-31T03:00:00.000Z|30|2|5|2020-05-31T11:00:00.000Z|2020-05-31T11:10:00.000Z|26700000|31200000|0.85576923076923
# 01/06/2020|2020-06-01T03:00:00.000Z|2020-06-01T03:10:00.000Z|40|3|60|2020-06-01T11:10:00.000Z|2020-06-01T11:20:00.000Z|22800000|30000000|0.76

