var options = {
    container: document.getElementById('myChart'),
    data: [
        { label: 'Android', value: 56.9 },
        { label: 'iOS', value: 22.5 },
        { label: 'BlackBerry', value: 6.8 },
        { label: 'Symbian', value: 8.5 },
        { label: 'Bada', value: 2.6 },
        { label: 'Windows', value: 1.9 }
    ],
    series: [{
        type: 'pie',
        angleKey: 'value',
        labelKey: 'label',
        strokeWidth: 3
    }],
    legend: {
        position: 'right'
    }
};

var chart = agCharts.AgChart.create(options);

function updateLegendPosition(value) {
    chart.legend.position = value;
}

function setLegendEnabled(enabled) {
    chart.legend.enabled = enabled;
}
