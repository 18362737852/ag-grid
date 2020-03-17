<?php
/*
 * WARNING: This page is generated automatically; please do not edit it directly. See generate-pages.js and gallery.json
 */
$pageTitle = 'ag-Charts Gallery: Simple Area';
$pageDescription = 'ag-Charts is a highly performant charting library with a clean API to effortlessly create beautiful visualizations.';
$pageKeywords = 'Javascript Grid Charting';
$pageGroup = 'feature';
include '../documentation-main/documentation_header.php';
define('skipInPageNav', true);
?>

<h1 class="heading">ag-Charts Gallery: Simple Area</h1>

<p class="lead">
    Area charts plot series using a line with the area below the line filled. They are useful to show changes over time, and are easy to interpret.
</p>

<?= chart_example('Simple Area', 'simple-area', 'generated', ['exampleHeight' => '60vh']) ?>

<div class="chart-navigation">
    <a class="chart-navigation__left" href="./bubble-with-negative-values.php">❮&nbsp;&nbsp;Bubble With Negative Values</a>
    <a class="chart-navigation__right" href="./stacked-area.php">Stacked Area&nbsp;&nbsp;❯</a>
</div>

<?php include '../documentation-main/documentation_footer.php'; ?>