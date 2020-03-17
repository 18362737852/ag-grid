import { generate } from 'escodegen';
import * as esprima from 'esprima';
import { Events } from '../../../../community-modules/core/src/ts/eventKeys';
import { PropertyKeys } from '../../../../community-modules/core/src/ts/propertyKeys';
import * as $ from 'jquery';
import {
    NodeType,
    recognizedDomEvents,
    collect,
    nodeIsVarWithName,
    nodeIsFunctionWithName,
    nodeIsPropertyWithName,
    nodeIsInScope,
    nodeIsUnusedFunction,
    nodeIsFunctionCall,
    extractEventHandlers,
    extractUnboundInstanceMethods,
} from './parser-utils';

export const templatePlaceholder = '$$GRID$$';

const EVENTS = (<any>Object).values(Events);
const PROPERTIES = PropertyKeys.ALL_PROPERTIES;
const FUNCTION_PROPERTIES = PropertyKeys.FUNCTION_PROPERTIES;

function nodeIsDocumentContentLoaded(node) {
    try {
        return nodeIsFunctionCall(node) &&
            node.expression.arguments[0].type === 'Literal' &&
            node.expression.arguments[0].value === 'DOMContentLoaded';
    } catch (e) {
        console.error('We found something which we do not understand', node);
    }
}

function nodeIsHttpOpen(node) {
    const callee = node.expression && node.expression.callee;
    const calleeObject = callee && callee.object;

    return node.type === NodeType.Expression &&
        calleeObject &&
        calleeObject.name === 'httpRequest' &&
        callee.property.name === 'open';
}

function nodeIsSimpleHttpRequest(node) {
    const calleeObject = node.expression && node.expression.callee && node.expression.callee.object;
    const callee = calleeObject && calleeObject.callee;
    const innerCallee = callee && callee.object;
    const innerProperty = callee && callee.property;

    return innerCallee && innerProperty && innerCallee.name == 'agGrid' && innerProperty.name == 'simpleHttpRequest';
}

function generateWithReplacedGridOptions(node, options?) {
    return generate(node, options)
        .replace(/gridOptions\.api/g, 'this.gridApi')
        .replace(/gridOptions\.columnApi/g, 'this.gridColumnApi');
}

export function parser(js, html, exampleSettings) {
    const domTree = $(`<div>${html}</div>`);

    domTree.find('style').remove();

    const domEventHandlers = extractEventHandlers(domTree, recognizedDomEvents);
    const tree = esprima.parseScript(js, { comment: true });
    const collectors = [];
    const gridOptionsCollectors = [];
    const onReadyCollectors = [];
    const indentOne = { format: { indent: { base: 1 } } };
    const registered = ['gridOptions'];

    // handler is the function name, params are any function parameters
    domEventHandlers.forEach(([_, handler, params]) => {
        if (registered.indexOf(handler) > -1) {
            return;
        }

        registered.push(handler);

        // one of the event handlers extracted earlier (onclick, onchange etc)
        // body replaces gridOptions.api/columnApi with this.gridApi/columnApi
        collectors.push({
            matches: node => nodeIsFunctionWithName(node, handler),
            apply: (bindings, node) => {
                bindings.externalEventHandlers.push({
                    name: handler,
                    params: params,
                    body: generateWithReplacedGridOptions(node)
                });
            }
        });
    });

    // functions marked as "inScope" will be added to "instance" methods, as opposed to (global/unused) "util" ones
    const unboundInstanceMethods = extractUnboundInstanceMethods(tree);
    collectors.push({
        matches: node => nodeIsInScope(node, unboundInstanceMethods),
        apply: (bindings, node) => bindings.instanceMethods.push(generate(node, indentOne))
    });

    // anything not marked as "inScope" and not handled above in the eventHandlers is considered an unused/util method
    collectors.push({
        matches: node => nodeIsUnusedFunction(node, registered, unboundInstanceMethods),
        apply: (bindings, node) => bindings.utils.push(generate(node).replace(/gridOptions/g, 'gridInstance'))
    });

    // anything vars not handled above in the eventHandlers is considered an unused/util method
    collectors.push({
        matches: node => node.type === NodeType.Variable && registered.indexOf(node.declarations[0].id.name) < 0,
        apply: (bindings, node) => bindings.utils.push(generate(node))
    });

    // extract the xmlhttpreq call
    onReadyCollectors.push({
        matches: nodeIsHttpOpen,
        apply: (bindings, node) => {
            const url = node.expression.arguments[1].raw;
            const callback = '{ params.api.setRowData(data); }';

            bindings.data = { url, callback };
        }
    });

    // extract the simpleHttpRequest call
    onReadyCollectors.push({
        matches: nodeIsSimpleHttpRequest,
        apply: (bindings, node) => {
            const url = node.expression.callee.object.arguments[0].properties[0].value.raw;
            const callback = generate(node.expression.arguments[0].body).replace(/gridOptions/g, 'params');

            bindings.data = { url, callback };
        }
    });

    // extract the resizeColumnsToFit
    onReadyCollectors.push({
        matches: node => node.expression &&
            node.expression.callee &&
            node.expression.callee.property &&
            node.expression.callee.property.name == 'sizeColumnsToFit',
        apply: bindings => { bindings.resizeToFit = true; }
    });

    // extract onready
    collectors.push({
        matches: nodeIsDocumentContentLoaded,
        apply: (bindings, node) => collect(node.expression.arguments[1].body.body, bindings, onReadyCollectors)
    });

    // all onXXX will be handled here
    // note: gridOptions = { onGridSizeChanged = function() {}  WILL NOT WORK
    // needs to be a separate function  gridOptions = { onGridSizeChanged = myGridSizeChangedFunc
    // ALSO event must match function name: onColumnPinned: onColumnPinned (not onColumnPinned: someOtherFunc)
    EVENTS.forEach(eventName => {
        const onEventName = 'on' + eventName.replace(/^\w/, w => w.toUpperCase());

        registered.push(onEventName);

        collectors.push({
            matches: node => nodeIsFunctionWithName(node, onEventName),
            apply: (bindings, node) => {
                bindings.eventHandlers.push({
                    name: eventName,
                    handlerName: onEventName,
                    handler: generateWithReplacedGridOptions(node)
                });
            }
        });
    });

    FUNCTION_PROPERTIES.forEach(functionName => {
        registered.push(functionName);
        collectors.push({
            matches: node => nodeIsFunctionWithName(node, functionName),
            apply: (bindings, node) => {
                bindings.instanceMethods.push(generateWithReplacedGridOptions(node, indentOne));
                bindings.properties.push({ name: functionName, value: null });
            }
        });
    });

    PROPERTIES.forEach(propertyName => {
        registered.push(propertyName);

        // grab global variables named as grid properties
        collectors.push({
            matches: node => nodeIsVarWithName(node, propertyName),
            apply: (bindings, node) => {
                try {
                    const code = generate(node.declarations[0].init, indentOne);
                    bindings.properties.push({ name: propertyName, value: code });
                } catch (e) {
                    console.error('We failed generating', node, node.declarations[0].id);
                }
            }
        });

        gridOptionsCollectors.push({
            matches: node => nodeIsPropertyWithName(node, propertyName),
            apply: (bindings, node) => bindings.properties.push({
                name: propertyName,
                value: generate(node.value, indentOne)
            })
        });
    });

    gridOptionsCollectors.push({
        matches: node => nodeIsPropertyWithName(node, 'onGridReady'),
        apply: (bindings, node) => {
            bindings.onGridReady = generate(node.value.body).replace(/gridOptions/g, 'params');
        }
    });

    // gridOptionsCollectors captures all events, properties etc that are related to gridOptions
    collectors.push({
        matches: node => nodeIsVarWithName(node, 'gridOptions'),
        apply: (bindings, node) => collect(node.declarations[0].init.properties, bindings, gridOptionsCollectors)
    });

    /*
     * externalEventHandlers -> onclick, onchange etc in index.html
     * eventHandlers -> grid related events
     * properties -> grid related properties
     * utils -> none grid related methods/variables (or methods that don't reference the gridApi/columnApi) (i.e. non-instance)
     * instanceMethods -> methods that are either marked as "inScope" or ones that reference the gridApi/columnApi
     * onGridReady -> any matching onGridReady method
     * data -> url: dataUrl, callback: callback, http calls etc
     * resizeToFit -> true if sizeColumnsToFit is used
     */
    const bindings = collect(
        tree.body,
        {
            eventHandlers: [],
            properties: [],
            instanceMethods: [],
            externalEventHandlers: [],
            utils: []
        },
        collectors
    );

    const gridElement = domTree.find('#myGrid').replaceWith(templatePlaceholder);
    const inlineClass = gridElement.attr('class');
    const inlineHeight = gridElement.css('height');
    const inlineWidth = gridElement.css('width');

    if (inlineClass) {
        const theme = inlineClass.split(' ').filter(className => className.indexOf('ag-theme') >= 0);
        exampleSettings.theme = theme && theme.length > 0 ? theme[0] : 'ag-theme-balham';
    }

    if (parseInt(inlineHeight)) {
        exampleSettings.height = inlineHeight;
    }

    if (parseInt(inlineWidth)) {
        exampleSettings.width = inlineWidth;
    }

    bindings.template = domTree.html().replace(/<br>/g, '<br />');

    bindings.gridSettings = Object.assign({
        width: '100%',
        height: '100%',
        theme: 'ag-theme-balham'
    }, exampleSettings);

    return bindings;
}

export default parser;
