var sleepJournalChart;

const graphFeatureCfg = {
  delay_to_sleep: {borderColor: '#f44336', unit: 'min'},
  number_times_wake: { borderColor: '#4caf50', unit: 'unit'},
  woke_during_night: { borderColor: '#87ceeb', unit: 'min'},
  hours_slept: { borderColor: '#795548', unit: 'millis'},
  total_time_in_bed: { borderColor: '#f0e68c', unit: 'millis' },
  sleep_efficiency: { borderColor: '#3f51b5', unit: 'perc' }
};

function transformUnits(feature, data) {
  if (graphFeatureCfg[feature].unit == 'millis')
    return data.map(val => val / 3600000);
  if (graphFeatureCfg[feature].unit == 'perc')
    return data.map(val => Math.round(val * 10000)/100);
  
  return data; 
}

function showJournalChart(context, sj, featureToShow=null) {
  let journalDatasets = [];

  if (featureToShow) {
    journalDatasets.push({
        label: sj[featureToShow].label,
        borderColor: graphFeatureCfg[featureToShow].borderColor,
        fill: false,
        data: transformUnits(featureToShow, sj[featureToShow].data)
      });
  }
  else 
    Object.keys(graphFeatureCfg).forEach(feature => {
      journalDatasets.push({
        label: sj[feature].label,
        borderColor: graphFeatureCfg[feature].borderColor,
        fill: false,
        data: transformUnits(feature, sj[feature].data)
      });
    });

  const journalChartDef = {
    type: 'line',
    data: {
      labels: sj.entry_date.data.map(dStr => {
        d = dStr.split('/');
        return new Date(...[d[2], d[1] - 1, d[0]]);
      }),
      datasets: journalDatasets
    },
    options: {
      title: {
        text: 'Variação dos indices no período analisado',
        display: true
      },
      legend: {
        position: 'left'
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'day',
            parser: 'DD/MM/YYYY',
            round: 'day',
            tooltipFormat: 'll'
          },
          scaleLabel: {
            display: true,
            labelString: 'Data'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Valores'
          }
        }]
      },
    }
  };

  cleanChart();
  sleepJournalChart = new Chart(context, journalChartDef);
}

function cleanChart() {
  if (sleepJournalChart)
    sleepJournalChart.destroy();
}
