<?php
$pageTitle = "ag-Grid Examples: Angular with Material Design Components";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This page demostrates Angular with Material Design Components.";
$pageKeywords = "ag-Grid angular features third party material design component";
$pageGroup = "examples";
include '../documentation-main/documentation_header.php';
?>


    <h1>ag-Grid Angular Examples with Material Design Components</h1>

    <h2>ag-Grid with Material Design Components - Set 1</h2>
    <p>This example uses the Material Design components as part of Editor Components.</p>

    <?= grid_example('Material Design Components #1', 'material-design-1', 'angular', ['onlyShow' => 'angular', 'showImportsDropdown' => false, 'exampleHeight' => '350', 'extras' => ['materialdesign']]) ?>

    <h2>ag-Grid with Material Design Components - Set 2</h2>
    <p>This example uses the Material Design components as part of Editor Components, as well as an example
        of using a Material Design component in the Header.</p>

    <?= grid_example('Material Design Components #2', 'material-design-2', 'angular', ['onlyShow' => 'angular', 'showImportsDropdown' => false, 'exampleHeight' => '350', 'extras' => ['materialdesign']]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
