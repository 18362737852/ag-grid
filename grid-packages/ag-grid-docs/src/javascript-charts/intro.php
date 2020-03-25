<section id="angular-demo" class="mb-3">
    <div class="card">
        <div class="card-header">Quick Look Code Example</div>
        <div class="card-body">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">main.js</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">index.html</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">

<?= createSnippet(<<<SNIPPET
var data = [
    {
        beverage: 'Coffee',
        Q1: 450,
        Q2: 560,
        Q3: 600,
        Q4: 700
    },
    {
        beverage: 'Tea',
        Q1: 270,
        Q2: 380,
        Q3: 450,
        Q4: 520
    },
    {
        beverage: 'Milk',
        Q1: 180,
        Q2: 170,
        Q3: 190,
        Q4: 200
    }
];

var options = {
    container: document.querySelector('#myChart'),
    data: data,
    title: {
        text: 'Beverage Expenses'
    },
    subtitle: {
        text: 'per quarter'
    },
    padding: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40
    },
    series: [{
        type: 'column',
        xKey: 'beverage',
        yKeys: ['Q1', 'Q2', 'Q3', 'Q4']
    }],
    legend: {
        spacing: 40
    }
};

agCharts.AgChart.create(options);
SNIPPET
) ?>
</div>
<div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">

<?= createSnippet(<<<SNIPPET
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>ag-Charts Basic Example</title>
        <script src="https://unpkg.com/ag-charts-community/dist/ag-charts-community.min.js">
        </script>
    </head>
    <body>
        <div id="myChart" style="position: absolute; top: 0; right: 0; bottom: 0; left: 0;"></div>
        <script src="main.js"></script>
    </body>
</html>
SNIPPET
, 'html') ?>
                </div>
            </div>
            <div class="text-right" style="margin-top: -1.5rem;">
                <a class="btn btn-dark" href="https://plnkr.co/edit/OYoLfV7OfOXHyOAOiR86?p=preview" target="_blank">
                    Open in <img src="../images/plunker_logo.png" alt="Open in Plunker" style="height: 34px; width: 34px;"/> Plunker
                </a>
            </div>
        </div>
    </div>
</section>
