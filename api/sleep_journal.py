'''
--- Complain API microservice application ---
Author: Alessandro Martins
Module: sleep_journal
Description: module for the SleepJournal classes and related routines. Complain
documents are passed as JSON objects.
'''
import re
import json
from flask_restful import Resource, abort, reqparse
from pymongo import ReturnDocument
from api_main import api_db


# Adding fields to the request parser
parser = reqparse.RequestParser()
parser.add_argument('journal_entry')


class SleepJournal(Resource):
    ''' SleepJournal: journal class for object-referencing URIs (GET obj_id,
        DELETE obj_id)
    '''
    def get(self, journal_entry_date):
        ret = api_db.db.sleep_journal.find_one(
            {'journal_entry_date': journal_entry_date},
            projection={'_id': False})
        if not ret:
            abort(404, message='Dia %s não encontrado' % journal_entry_date)

        return ret

    def delete(self, journal_entry_date):
        result = api_db.db.sleep_journal.delete_one(
            {'journal_entry_date': journal_entry_date})

        # An error is issued if no matching documents were found.
        if not result.deleted_count:
            abort(404, message='Complain %s not found' % journal_entry_date)

        return 'Complaint id# %s deleted' % journal_entry_date

    def put(self, journal_entry_date):
        return 'Not implemented'

    def patch(self, journal_entry_date):
        return 'Not implemented'


class SleepJournalList(Resource):
    ''' SleepJournalList: journal class for non-object-referencing URIs
        (GET, GET <query>, POST)
    '''
    def get(self):
        ret = []
        args = parser.parse_args()

        return ret

    def post(self):
        ''' post(): inserts a new complaint document.
        '''
        new_entry_args = json.loads(parser.parse_args()['journal_entry'])

        # Inserts the new complaint document in the database
        api_db.db.sleep_journal.insert_one(new_entry_args)

        return 'OK'
