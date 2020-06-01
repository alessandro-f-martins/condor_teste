var sleepJournal = {
  entry_date: {label: 'Data', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: false},
  time_to_bed: {label: 'Hora em que se deitou', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: false},
  time_lights_out: {label: 'Hora em que se apagaram as luzes', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: false},
  delay_to_sleep: {label: 'Tempo para dormir (min)', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: false},
  number_times_wake: {label: 'Número de vezes que acordou', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: false},
  woke_during_night: {label: 'Tempo total acordado (min)', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: false},
  time_wake_up: {label: 'Hora em que despertou', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: false},
  time_get_up: {label: 'Hora em que se levantou', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: false},
  hours_slept: {label: 'Horas dormidas', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: true},
  total_time_in_bed: {label: 'Tempo total na cama', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: true},
  sleep_efficiency: {label: 'Eficiência do sono', data: [], stats: {min: 0, max: 0, mean: 0, std: 0}, calc: true}
}

function getJournalRow(rowNo) {
  let retRow = {};
  for (const colName of Object.keys(sleepJournal)) {
    retRow[colName] = sleepJournal[colName].data[rowNo];
  };
  return retRow;
}

function updateStats(sj, featureId) {
  sj[featureId].stats.min = Math.min(...sj[featureId].data);
  sj[featureId].stats.max = Math.max(...sj[featureId].data);
  sj[featureId].stats.mean = (sj[featureId].data.reduce((x, y) => x + y) / sj[featureId].data.length).toFixed(2);
  sj[featureId].stats.std = Math.sqrt(
    sj[featureId].data.reduce((x, y) => x + (y - sj[featureId].stats.mean)**2, 0) / sj[featureId].data.length).toFixed(2);
}

function saveToServer() {
  let sjData = {};
  for (let feat of Object.keys(sleepJournal))
    sjData[feat] = sleepJournal[feat].data;

  $.ajax({
    url: '/saveData', type: 'post',
    data: {
      sj: JSON.stringify(sjData)
    }
  })
    .done(ajax_result => {
      alert('Dados salvos com êxito!');
    })
    .fail(() => {
      alert('Houve um problema com a gravação dos dados.');
    })
  
}

function loadFromServer() {
  $.ajax({
    url: '/loadData',
    type: 'get'
  })
    .done(ajax_result => {
      if (ajax_result == 'no_data') {
        alert('Não existem dados salvos.');
        return false;
      }

      const loadResult = JSON.parse(ajax_result);

      Object.keys(loadResult).forEach(feature => {
        if (feature.startsWith('time_'))
          sleepJournal[feature].data = loadResult[feature].map(x => new Date(x));
        else
          sleepJournal[feature].data = loadResult[feature];
        
        updateStats(sleepJournal, feature);
      });

      updateDisplayTable(sleepJournal);
      alert('Dados recuperados com êxito!');
    })
    .fail(() => {
      alert('Houve um problema com a recuperação dos dados.');
    })

}

function generateStatRows(sj, featureId) {
  for (const stat of Object.keys(sj[featureId].stats)) {
    let statToShow = sj[featureId].stats[stat];

    if (featureId.startsWith('time_'))
      statToShow = 'N/A';
    else if (featureId == 'sleep_efficiency')
      statToShow = (Math.round(10000 * statToShow) / 100) + '%';
    else if (featureId == 'total_time_in_bed' || featureId == 'hours_slept')
      statToShow = millisToFmtTime(statToShow);

    $(`#stat-${stat}-row`).append($(`<td class="sj-stat-data">${statToShow}</td>`));
  }
}

function dateToStr(d, withTime=false) {
  let ret =  String(d.getDate()).padStart(2, '0') +
    '/' + String(d.getMonth() + 1).padStart(2, '0') +
    '/' + d.getFullYear();
  if (withTime) {
    ret += ' ' + String(d.getHours()).padStart(2, 0) +
      ':' + String(d.getMinutes()).padStart(2, 0);
  }
  return ret; 
}

function strToDate(strDate) {
  const dVals = strDate.split(/[ \/:]/);
  if (dVals.length == 3)
    return new Date(dVals[2], dVals[1] - 1, dVals[0]);
  return new Date(dVals[2], dVals[1] - 1, dVals[0], dVals[3], dVals[4]);
}

function millisToFmtTime(tMillis) {
  const mins = Math.round(tMillis/60000);
  const hours = Math.floor(mins/60);

  return (hours > 0 ? hours + 'h' : '') + String(mins % 60).padStart(2, '0') + 'm';
}

function getActualSleptTime(rowIdx, totaTimeInBed) {
  const timeBeforeSleep = sleepJournal.time_lights_out.data[rowIdx] - sleepJournal.time_to_bed.data[rowIdx];
  const sleepInterruptions = (sleepJournal.delay_to_sleep.data[rowIdx] + sleepJournal.woke_during_night.data[rowIdx]) * 60000;
  const timeAfterWakeup = (sleepJournal.time_get_up.data[rowIdx] - sleepJournal.time_wake_up.data[rowIdx]);

  return totaTimeInBed - timeBeforeSleep - sleepInterruptions - timeAfterWakeup;
}

function downloadCSV() {
  const saveFileName = 'sleepJournal.csv';
  let csvToDownload = '';
  $('#entries-table > thead > tr').children().toArray().forEach(header => {
    csvToDownload += header.innerText + ',';
  });
  csvToDownload = csvToDownload.slice(0, -1) + '\n';

  let rowToAppend;
  $('#entries-table > tbody').children().toArray().forEach(row => {
    rowToAppend = '';
    $(row).children().toArray().forEach(cell => {
      rowToAppend += cell.innerText + ',';
    });  
    csvToDownload += rowToAppend.slice(0, -1) + '\n';
  });

  if (window.navigator.msSaveOrOpenBlob)
      window.navigator.msSaveOrOpenBlob(csvToDownload, saveFileName);
  else {
    $('#download-ahref')
      .attr('href', URL.createObjectURL(new Blob([csvToDownload], {type: 'text/csv'})))
      .attr('download', saveFileName);
    $('#download-ahref')[0].click();
  }
}

function insertJournalTableRow() {
  let valToInsert;
  let entryDate = $('#entry_date').val();
  let insIdx = sleepJournal.entry_date.data.indexOf(entryDate);
  let replaceValue = 0;

  if (insIdx == -1) {
    for (insIdx = 0;
      insIdx < sleepJournal.entry_date.data.length && strToDate(entryDate) >= strToDate(sleepJournal.entry_date.data[insIdx]); insIdx++);
  }
  else
    replaceValue = 1;

  Object.keys(sleepJournal).forEach(feature => {
    if (!sleepJournal[feature].calc) {
      valToInsert = $(`#${feature}`).val();

      if (valToInsert.indexOf(':') != -1)
        valToInsert = strToDate(valToInsert);
      else if (valToInsert.indexOf('/') == -1)
        valToInsert = parseInt(valToInsert);

      sleepJournal[feature].data.splice(insIdx, replaceValue, valToInsert);
      if (feature !== 'entry_date')
        updateStats(sleepJournal, feature);
    }
  });

  const totaTimeInBed = sleepJournal.time_get_up.data[insIdx] - sleepJournal.time_to_bed.data[insIdx];
  const hoursSlept = getActualSleptTime(insIdx, totaTimeInBed);
  const sleepEfficiency = hoursSlept / totaTimeInBed;

  sleepJournal.total_time_in_bed.data.splice(insIdx, replaceValue, totaTimeInBed);
  sleepJournal.hours_slept.data.splice(insIdx, replaceValue, hoursSlept);
  sleepJournal.sleep_efficiency.data.splice(insIdx, replaceValue, sleepEfficiency);

  ['hours_slept', 'total_time_in_bed', 'sleep_efficiency'].forEach(featureId => {
    updateStats(sleepJournal, featureId);
  });

  updateDisplayTable(sleepJournal);

  console.log('sleepJournal: ');
  console.log(JSON.stringify(sleepJournal));
}

function updateDisplayTable(sj) {

  $('#entries-table > tbody tr').filter(':not([id^="stat"])').remove();
  $('.sj-stat-data').remove();
  let dataRowSet = '';

  sj.entry_date.data.forEach((entry, idx) => {
    let dataRow = '<tr>';
    let cellData;

    Object.keys(sj).forEach(feature => {
      cellData = sj[feature].data[idx];

      if (feature.startsWith('time_'))
        cellData = dateToStr(cellData, true);
      else if (feature == 'hours_slept' || feature == 'total_time_in_bed')
        cellData = millisToFmtTime(cellData);
      else if (feature == 'sleep_efficiency')
        cellData = Math.round(10000 * cellData)/100 + '%';

      dataRow += `<td>${cellData}</td>`;
    });
    dataRowSet += dataRow + '</tr>' 
  });
  
  $('#stat-header-row').before($(dataRowSet));
  Object.keys(sj).forEach(feature => {
    if (feature !== 'entry_date')
      generateStatRows(sj, feature);
  });
  window.scroll(0, $('#entries-div').offset().top - 160);
}


$(document).ready(function() {
  // Inicializa os datetimepickers:
  jQuery.datetimepicker.setLocale('pt');
  $('#entry_date')
    .val(dateToStr(new Date()))
    .datetimepicker({format:'d/m/Y', timepicker: false})
    .change(function() {
      $('#data-entry input').filter(`[id!="entry_date"]`).val('');
      $('#time_to_bed').val($(this).val());
    });
  
  $('#data-entry').find('[id^="time_"]').datetimepicker({format:'d/m/Y H:i'});
  $('#time_to_bed').change(function() {$('#time_lights_out').val($(this).val());});
  $('#time_lights_out').change(function() {$('#time_wake_up').val($(this).val());});
  $('#time_wake_up').change(function() {$('#time_get_up').val($(this).val());});

  let graphableFeatures = Object.keys(graphFeatureCfg);

  Object.keys(sleepJournal).forEach(feature => {
    let headerCol = ($(`<th>${sleepJournal[feature].label}</th>`));
    if (sleepJournal[feature].calc)
      headerCol.css('font-style', 'italic');
    if (graphableFeatures.includes(feature)) {
      headerCol
        .css({textDecoration: 'underline',
          fontFamily: 'bold', cursor: 'pointer'})
        .click(function() {
          showJournalChart($('#lineplot'), sleepJournal, feature);
        });
    }
    $('#entries-table > thead > tr').append(headerCol);
  });

  // Botoes:

  $('#include-data-row').click(function() {insertJournalTableRow();});
  $('#display-charts').click(function() {showJournalChart($('#lineplot'), sleepJournal);});
  $('#save-data').click(function() { saveToServer() });
  $('#load-data').click(function() { loadFromServer() });

  $('#download-button').click(function() {downloadCSV();});
});
