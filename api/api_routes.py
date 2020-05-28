'''
--- SleepJournal API application ---
Author: Alessandro Martins
Module: api_routes
Description: routing module for the application. Adds the resource-related
classes to the REST API listener and performs initialization routines.
'''
from api_main import app, api
from sleep_journal import SleepJournal, SleepJournalList

# Adding resource classes to the listener

api.add_resource(SleepJournal, '/sj')
api.add_resource(SleepJournalList, '/sj/<int:journal_entry_date>')


if __name__ == '__main__':
    app.run()
