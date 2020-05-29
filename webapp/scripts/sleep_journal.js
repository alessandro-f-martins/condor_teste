const sleepJournal = {
  total_time_in_bed: [],
  sleep_efficiency: []
};

function getJournalRow(rowNo) {
  let retRow = {};
  for (const colName of Object.getOwnPropertyNames(sleepJournal)) {
    retRow[colName] = sleepJournal[colName][rowNo];
  };
  return retRow;
}

function getToday() {
  const today = new Date();
  return String(today.getDate()).padStart(2, '0') +
    '/' + String(today.getMonth() + 1).padStart(2, '0') +
    '/' + today.getFullYear();
}

function strToDate(strDate) {
  const dVals = strDate.split(/[ \/:]/);
  return new Date(dVals[2], dVals[1] - 1, dVals[0], dVals[3], dVals[4]);
}

function millisToFmtTime(tMillis) {
  const mins = tMillis/60000;
  const hours = Math.floor(mins/60);

  return (hours > 0 ? hours + 'h' : '') + String(mins % 60).padStart(2, '0') + 'm';
}

function insertJournalTableRow() {
  let tableRowToInsert = $('<tr></tr>');
  let valToInsert;
  $('#data-entry').find('.sj-input').toArray().forEach(featureName => {
    valToInsert = $(`#${featureName.id}`).val();
    tableRowToInsert.append($(`<td>${valToInsert}</td>`));

    if (valToInsert.indexOf(':') != -1) {
      valToInsert = strToDate(valToInsert);
    }
    sleepJournal[featureName.id].push(valToInsert);
  });

  const lastEntryIdx = sleepJournal.entry_date.length - 1;
  sleepJournal.total_time_in_bed.push(
    sleepJournal.time_get_up[lastEntryIdx] - sleepJournal.time_to_bed[lastEntryIdx]
  );
  tableRowToInsert.append($(`<td>${millisToFmtTime(sleepJournal.total_time_in_bed[lastEntryIdx])}</td>`)); 
  
  let actualSleptTime = sleepJournal.total_time_in_bed[lastEntryIdx] -
    ((sleepJournal.delay_to_sleep[lastEntryIdx] + sleepJournal.woke_during_night[lastEntryIdx]) * 1000 +
    (sleepJournal.time_get_up[lastEntryIdx] - sleepJournal.time_wake_up[lastEntryIdx]));
  
  sleepJournal.sleep_efficiency.push(actualSleptTime / sleepJournal.total_time_in_bed[lastEntryIdx]);
  tableRowToInsert.append($(`<td>${Math.round(10000 * sleepJournal.sleep_efficiency[lastEntryIdx])/100}%</td>`)); 
  
  $('#entries-table > tbody').append(tableRowToInsert);
  window.scroll(0, $('#entries-div').offset().top - 160);
}


$(document).ready(function() {
  jQuery.datetimepicker.setLocale('pt');

  $('#data-entry').find('.sj-input').toArray().forEach(featureName => {
    sleepJournal[featureName.id] = [];    
  });

  $('#entry_date')
    .val(getToday())
    .datetimepicker({
      format:'d/m/Y',
      timepicker: false
    });

    $('#data-entry').find('[id^="time_"]').datetimepicker({
      format:'d/m/Y H:i'
    });

  $('#include-data-row').click(function() {
    insertJournalTableRow();
  });

  $('#save-data').click(function() {

  });

});
