/**
* breadcrumbs helper
* for umlaut
* by @aravindanve
* https://github.com/aravindanve
**/

$(function () {

    var SITEMAPS_ID = 'sitemap-hgjf32uytdb8cn';
    var DEBUG = false;

    function title(str) {
        str = str || '';
        str = str
            .replace(/\-/g, ' ')
            .replace(/\_/g, ' ')
            .trim();

        if (!str.length) {
            return 'Home';
        }
        if (str.length > 25) {
            str = str.slice(0, 22).trim() + '...';
        }
        return str.charAt(0).toUpperCase() + 
            str.slice(1);
    }

    function traverse(node, parents) {
        parents = parents || [];
        if (typeof node !== 'object') {
            return '';
        }
        var list = [];
        $.each(node, function (key, value) {
            var result = traverse(
                value, parents.concat(key));

            if (result && result.length) {
                list.push(result);
            }
        });
        var str = '';
        if (node.__link === true &&
            !(parents[parents.length - 1] === '' &&
            parents.length === 1)) {

            str += '<a href="%LINK%">%TITLE%</a>'
                .replace(/%LINK%/g, '/' + parents.join('/'))
                .replace(/%TITLE%/g, title(parents[parents.length - 1]));
        }
        if (node.hasOwnProperty('') &&
            node[''].__link === true) {
            str += '<a href="%LINK%">%TITLE%</a>'
                .replace(/%LINK%/g, '/' + parents.join('/'))
                .replace(/%TITLE%/g, title(parents[parents.length - 1]));
        }
        if (list.length) {
            str += '<ul><li>%LIST%</li></ul>'
                .replace(/%LIST%/g, list.join('</li><li>'));
        }
        return str;
    }

    $.get('sitemap.xml', function (res) {
        var $sitemap = $(res);
        var $urls = $sitemap.find('loc');
        var urls = [];

        $urls.each(function () {
            var $elem = $(this);
            var url = ($elem.text()+'').trim();

            url = url.replace(/^https?:\/\/[^\/]+\//gi, '');
            url = url.split(/\//g);
            urls.push(url);
        });

        var tree = {};
        var node;
        for (var i = 0; i < urls.length; i++) {
            node = tree;
            for (var j = 0; j < urls[i].length; j++) {
                node[urls[i][j]] = node[urls[i][j]] || {};
                node = node[urls[i][j]];
            }
            node['__link'] = true;
        }

        if (DEBUG) {
            var pre = document.createElement('pre');
            pre.innerHTML = JSON.stringify(tree, null, 4);
            $('body').append(pre);
        }

        var mkp = traverse(tree);
        var ul = document.createElement('ul');
        ul.innerHTML = mkp;
        ul.id = SITEMAPS_ID;
        ul.style.display = 'none';
        $('body').append(ul);

        $('#breadcrumbs').breadcrumbsGenerator({
            sitemaps: '#' + SITEMAPS_ID,
            index_type: ''
        });
    });

});