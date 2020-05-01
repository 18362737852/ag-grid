<?php
$pageTitle = "Server-Side Row Model - Filtering";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. There are four available Row Models, the Server-Side Row Model is arguably the most powerful giving the ultimate 'big data' user experience. Users navigate through very large data sets using a mixture of server-side grouping and aggregation while using infinite scrolling to bring the data back in blocks to the client.";
$pageKeywords = "ag-Grid Server-Side Row Model";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading-enterprise">Server-Side Filtering</h1>

<p class="lead">
    This section covers Server-Side Filtering using the Server-Side Row Model.
</p>

<h2>Enabling Filtering</h2>

<p>
    Filtering is enabled in the grid via the <code>filter</code> column definition attribute. Some example column
    definitions with filtering enabled are shown below:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    columnDefs: [
        // sets the 'number' filter
        { field: 'country', filter: 'agNumberColumnFilter' },

        // use the default 'set' filter
        { field: 'year', filter: true },

        // no filter (unspecified)
        { field: 'sport' }
    ],

    // other options
}
SNIPPET
) ?>

<p>
    For more details on filtering configurations see the section on <a href="../javascript-grid-filtering/">Column Filtering</a>.
</p>

<h2>Filtering on the Server</h2>

<p>
    The actual filtering of rows is performed on the server when using the Server-Side Row Model. When a filter is applied
    in the grid a request is made for more rows via <code>getRows(params)</code> on the
    <a href="../javascript-grid-server-side-model-datasource/#datasource-interface">Server-Side Datasource</a>. The
    supplied params includes a request containing filter metadata contained in the <code>filterModel</code> property.
</p>

<p>
    An example of the contents contained in the <code>filterModel</code> is shown below:
</p>

<?= createSnippet(<<<SNIPPET
// IServerSideGetRowsRequest
{
    filterModel: {
        athlete: {
            filterType: 'text',
            type: 'contains',
            filter: 'fred'
        },
        year: {
            filterType: 'number',
            type: 'greaterThan',
            filter: 2005,
            filterTo: null
        }
    },

    // other properties
}
SNIPPET
) ?>

<p>
    Notice in the snippet above that the <code>filterModel</code> object contains a <code>'text'</code> and <code>'number'</code> filter. This filter
    metadata can be used by the server to perform the actual filtering.
</p>
<p>
    For more details on properties and values used in these filters see the section on
    <a href="../javascript-grid-filter-provided-simple/">Simple Column Filters</a>.
</p>

<h3>Example: Simple Column Filters</h3>

<p>
    The example below demonstrates server-side filtering using
    <a href="../javascript-grid-filter-provided-simple/">Simple Column Filters</a>. Notice the following:
</p>

<ul class="content">
    <li>
        <b>Athlete</b> column has a <code>'text'</code> filter defined using <code>filter: 'agTextColumnFilter'</code>.
    </li>
    <li>
        <b>Year</b> column has a <code>'number'</code> filter defined using <code>filter: 'agNumberColumnFilter'</code>.
    </li>
    <li>
        The server uses the metadata contained in the <code>filterModel</code> to filter the rows.
    </li>
    <li>
        Open the browser's dev console to view the <code>filterModel</code> supplied in the request to the datasource.
    </li>
</ul>

<?= grid_example('Simple Column Filters', 'simple-column-filters', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside', 'menu']]) ?>

<h2>Filtering with the Set Filter</h2>

<p>
    The <a href="../javascript-grid-filter-set/">Set Filter</a> is the default filter used if <code>filter: true</code>.
</p>

<p>
    Entries in the <code>filterModel</code> have a different format to the
    <a href="../javascript-grid-filter-provided-simple/">Simple Column Filters</a>.
    An example of the contents contained in the <code>filterModel</code> for the Set Filter is shown below:
</p>

<?= createSnippet(<<<SNIPPET
// IServerSideGetRowsRequest
{
    filterModel: {
        country: {
            filterType: 'set',
            values: ['Australia', 'Belgium']
        }
    },

    // other properties
}
SNIPPET
) ?>

<p>The snippet above shows the <code>filterModel</code> for a single column with a Set Filter where two items are selected.</p>

<p>
    When using the Server-Side Row Model it is necessary to supply the values as the grid does not have all rows loaded.
    This can be done either synchronously or asynchronously using the <code>values</code> filter param as shown below:
</p>

<?= createSnippet(<<<SNIPPET
// colDef with Set Filter values supplied synchronously
{
    field: 'country',
    filter: 'agSetColumnFilter',
    filterParams: {
        values: ['Australia', 'China', 'Sweden']
    }
}

// colDef with Set Filter values supplied asynchronously
{
    field: 'country',
    filter: 'agSetColumnFilter',
    filterParams: {
        values: function(params) {
            // simulating async delay
            setTimeout(() => {
                params.success(['Australia', 'China', 'Sweden'])
            }, 500);
        }
    }
}
SNIPPET
) ?>

<p>
    For more details on setting values refer to the <a href="../javascript-grid-filter-set/">Set Filter</a> documentation.
</p>

<h3>Example: Set Filter</h3>

<p>
    The example below demonstrates server-side filtering using the Set Filter. Notice the following:
</p>

<ul class="content">
    <li>
        <b>Country</b> column has a Set Filter defined using <code>filter: 'agSetColumnFilter'</code>.
    </li>
    <li>
        Set Filter values are fetched asynchronously and supplied via the <code>params.success(values)</code> callback.
    </li>
    <li>
        The server uses the metadata contained in the <code>filterModel</code> to filter the rows.
    </li>
    <li>
        Open the browser's dev console to view the <code>filterModel</code> supplied in the request to the datasource.
    </li>
</ul>

<?= grid_example('Set Filter', 'set-filter', 'generated', ['enterprise' => true, 'extras' => ['alasql'], 'modules' => ['serverside', 'setfilter', 'menu']]) ?>

<!--<h2>Set Filter with Complex Object</h2>-->
<!---->
<?//= grid_example('Set Filter with Complex Object', 'set-filter-complex-object', 'generated', ['enterprise' => true, 'extras' => ['alasql']]) ?>

<h2>Next Up</h2>

<p>
    Continue to the next section to learn about
    <a href="../javascript-grid-server-side-model-grouping/">Server-Side Row Grouping</a>.
</p>

<?php include '../documentation-main/documentation_footer.php';?>
