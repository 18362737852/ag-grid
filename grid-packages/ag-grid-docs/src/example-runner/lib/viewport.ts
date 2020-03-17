import * as jQuery from 'jquery';

const win = jQuery(window);
const contentEl = document.getElementsByClassName('page-content')[0];

function getCurrentViewPort() {
    const viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft(),
        right: NaN,
        bottom: NaN
    };

    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    return viewport;
}

function getRect(element) {
    const bounds = element.offset();
    bounds.right = bounds.left + element.outerWidth();
    bounds.bottom = bounds.top + element.outerHeight();
    return bounds;
}

export function whenInViewPort(element, callback) {
    function comparePosition() {
        const viewPort = getCurrentViewPort();
        const box = getRect(element);
        if (viewPort.bottom >= box.top) {
            contentEl.removeEventListener('scroll', comparePosition);
            callback();
            // window.setTimeout(callback, 2000);
        }
    }

    comparePosition();
    contentEl.addEventListener('scroll', comparePosition);
}

export function trackIfInViewPort(element, callback) {
    function comparePosition() {
        const viewPort = getCurrentViewPort();
        const box = getRect(element);
        var inViewPort = viewPort.bottom >= box.top && viewPort.top <= box.bottom;

        callback(inViewPort);
    }

    comparePosition();
    contentEl.addEventListener('scroll', comparePosition);
}

document.addEventListener('DOMContentLoaded', function () {
    const link = document.querySelector('a[href="' + location.hash + '"]');
    if (link && link.scrollIntoView) {
        link.scrollIntoView();
    }
});
