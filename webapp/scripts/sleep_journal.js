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

// function generateStats(colName) {
//   const 

// }

function insertJournalTableRow() {
  let tableRowToInsert = $('<tr></tr>');
  let valToInsert;
  let insIdx = sleepJournal.entry_date.indexOf($('#entry_date').val());

  if (insIdx == -1)
    insIdx = sleepJournal.entry_date.length;
  else {
    $('#entries-table > tbody')
      .find(`td:contains("${sleepJournal.entry_date[insIdx]}")`)
      .parent().remove();
  }

  $('#data-entry').find('.sj-input').toArray().forEach(featureName => {
    valToInsert = $(`#${featureName.id}`).val();
    tableRowToInsert.append($(`<td>${valToInsert}</td>`));

    if (valToInsert.indexOf(':') != -1)
      valToInsert = strToDate(valToInsert);
    else if (valToInsert.indexOf('/') == -1)
      valToInsert = parseInt(valToInsert);

    sleepJournal[featureName.id][insIdx] = valToInsert;    
  });

  sleepJournal.total_time_in_bed[insIdx] =
    sleepJournal.time_get_up[insIdx] - sleepJournal.time_to_bed[insIdx];

  tableRowToInsert.append(
    $(`<td>${millisToFmtTime(sleepJournal.total_time_in_bed[insIdx])}</td>`)
  ); 
  
  let actualSleptTime = sleepJournal.total_time_in_bed[insIdx] -
    ((sleepJournal.delay_to_sleep[insIdx] + sleepJournal.woke_during_night[insIdx]) * 1000 +
    (sleepJournal.time_get_up[insIdx] - sleepJournal.time_wake_up[insIdx]));
  
  sleepJournal.sleep_efficiency.push(
    actualSleptTime / sleepJournal.total_time_in_bed[insIdx]
  );

  tableRowToInsert.append(
    $(`<td>${Math.round(10000 * sleepJournal.sleep_efficiency[insIdx])/100}%</td>`)
  );
 
  $('#entries-table > tbody').prepend(tableRowToInsert);
  window.scroll(0, $('#entries-div').offset().top);
}


$(document).ready(function() {
  jQuery.datetimepicker.setLocale('pt');

  $('#data-entry').find('.sj-input').toArray().forEach(featureName => {
    sleepJournal[featureName.id] = [];    
  });

  $('#entry_date')
    .val(getToday())
    .datetimepicker({format:'d/m/Y', timepicker: false});

  $('#data-entry').find('[id^="time_"]').datetimepicker({format:'d/m/Y H:i'});

  $('#include-data-row').click(function() {
    insertJournalTableRow();
  });

  $('#save-data').click(function() {

  });

});
