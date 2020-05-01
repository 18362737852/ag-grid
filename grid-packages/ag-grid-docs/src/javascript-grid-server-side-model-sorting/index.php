<?php
$pageTitle = "Server-Side Row Model - Sorting";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Sorting</h1>

<p class="lead">
    This section covers Server-Side Sorting using the Server-Side Row Model.
</p>

<h2>Enabling Sorting</h2>

<p>
    Sorting is enabled in the grid via the <code>sortable</code> column definition attribute. Some example column
    definitions with sorting enabled are shown below:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    columnDefs: [
        { field: 'country', sortable: true },
        { field: 'year', sortable: true },
        { field: 'sport' },
    ],

    // other options
}
SNIPPET
) ?>

<p>
    For more details on sorting configurations see the section on <a href="../javascript-grid-sorting/">Row Sorting</a>.
</p>

<h2>Sorting on the Server</h2>

<p>
    The actual sorting of rows is performed on the server when using the Server-Side Row Model. When a sort is applied
    in the grid a request is made for more rows via <code>getRows(params)</code> on the
    <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-Side Datasource</a>. The
    supplied params includes a request containing sort metadata contained in the <code>sortModel</code> property.
</p>

<p>
    An example of the contents contained in the <code>sortModel</code> is shown below:
</p>

<?= createSnippet(<<<SNIPPET
//IServerSideGetRowsRequest
{
    sortModel: [
        { colId: 'country', sort: 'asc' },
        { colId: 'year', sort: 'desc' },
    ],

    // other properties
}
SNIPPET
) ?>

<p>
    Notice in the snippet above that the <code>sortModel</code> contains an array of models for each column that has
    active sorts in the grid. The column ID and sort type can then be used by the server to perform the actual sorting.
</p>

<h3>Example: Server-Side Sorting</h3>

<p>
    The example below demonstrates server-side sorting. Notice the following:
</p>

<ul class="content">
    <li>Try single / multi column (using <code>Shift</code> key) sorting by clicking on column headers.</li>
    <li>All columns have sorting enabled using the <code>defaultColDef</code> grid options property with
        <code>sortable=true</code>.
    </li>
    <li>The server uses the metadata contained in the <code>sortModel</code> to sort the rows.</li>
    <li>Open the browser's dev console to view the <code>sortModel</code> supplied in the request to the datasource.</li>
</ul>

<?= grid_example('Server-Side Sorting', 'sorting', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside']]) ?>

<note>
    <p><strong>Fake Server Implementation</strong></p>
    <p>
        Most of the Server-Side Row Model examples include a fake server that generates SQL to imitate how a real server
        might use the requests sent from the grid. These examples use <a href="http://alasql.org/">AlaSQL</a> which is a
        JavaScript SQL database that works in browsers.
    </p>
    <p>
        However, note that the Server-Side Row Model does not impose any restrictions on the server-side technologies used.
    </p>
</note>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
    <a href="../javascript-grid-server-side-model-filtering/">Server-Side Filtering</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
