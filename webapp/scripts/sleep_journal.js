const sleepJournal = {
  total_time_in_bed: [],
  sleep_efficiency: []
};

function getJournalRow(rowNo) {
  let retRow = {};
  for (colName of Object.getOwnPropertyNames(sleepJournal)) {
    retRow[colName] = sleepJournal[colName][rowNo];
  };
  return retRow;
}

function getToday() {
  const today = new Date();
  return String(today.getDate()).padStart(2, '0')
    + '/' + String(today.getMonth() + 1).padStart(2, '0')
    + '/' + today.getFullYear();
}

$(document).ready(function() {

  $('#data-entry').find('.sj-input').toArray().forEach(featureName => {
    sleepJournal[featureName.id] = [];    
  });

  $('#entry_date')
    .val(getToday())
    .datepicker({
      dateFormat: 'dd/mm/yy',
      dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'],
      dayNamesMin: ['D','S','T','Q','Q','S','S','D'],
      dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
      monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
      monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      nextText: 'Próximo',
      prevText: 'Anterior'
    });

  $('#include-data-row').click(function() {
    let tableRowToInsert = $('<tr></tr>');
    $('#data-entry').find('.sj-input').toArray().forEach(featureName => {
      let valToInsert = $(`#${featureName.id}`).val();
      tableRowToInsert.append($(`<td>${valToInsert}</td>`)); 
      sleepJournal[featureName.id].push(valToInsert);
    });

    const lastEntryIdx = sleepJournal.entry_date.length - 1;
    sleepJournal.total_time_in_bed.push(
      sleepJournal.time_get_up[lastEntryIdx] - sleepJournal.time_to_bed[lastEntryIdx]
    );
    tableRowToInsert.append($(`<td>${sleepJournal.total_time_in_bed[lastEntryIdx]}</td>`)); 
    
    sleepJournal.sleep_efficiency.push(
      sleepJournal.total_time_in_bed[lastEntryIdx] - sleepJournal.time_to_sleep[lastEntryIdx]
      - sleepJournal.woke_during_night[lastEntryIdx]
      - (sleepJournal.time_get_up[lastEntryIdx] - sleepJournal.time_wake_up[lastEntryIdx])
    );
    tableRowToInsert.append($(`<td>${sleepJournal.sleep_efficiency[lastEntryIdx]}</td>`)); 
    
    $('#entries-table > tbody').append(tableRowToInsert);

  });

  $('#save-data').click(function() {

  });


});
