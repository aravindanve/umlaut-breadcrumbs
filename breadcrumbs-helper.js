/**
* breadcrumbs helper
* for umlaut
* by @aravindanve
* https://github.com/aravindanve
**/

$(function () {

    var DEBUG = true;
    var BREADCRUMBS_SELECTOR = '[data-breadcrumbs]';
    var BREADCRUMBS_OVERRIDE = '__BREADCRUMBS_OVERRIDE';
    var SITEMAP_URL = '/sitemap.xml';
    var SITEMAP_ID = 'sitemap-hgjf32uytdb8cn';

    function gettitle(str) {
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
            var nextParents = typeof node.__link === 'string'?
                (node.__link.match(/^\//g)? 
                    [node.__link.replace(/^\//g, ''), key] :
                        parents
                            .slice(0, -1)
                            .concat(node.__link)
                            .concat(key)) : parents.concat(key);

            var result = traverse(value, nextParents);

            if (result && result.length) {
                list.push(result);
            }
        });
        var str = '';
        if (node.__link &&
            !(parents[parents.length - 1] === '' &&
            parents.length === 1)) {

            var link = typeof node.__link === 'string'?
                node.__link : '/' + parents.join('/');

            var title = typeof node.__title === 'string'?
                node.__title : gettitle(parents[parents.length - 1]);

            str += '<a href="%LINK%">%TITLE%</a>'
                .replace(/%LINK%/g, link)
                .replace(/%TITLE%/g, title);
        }
        if (node.hasOwnProperty('') &&
            node[''].__link === true) {
            str += '<a href="%LINK%">%TITLE%</a>'
                .replace(/%LINK%/g, '/' + parents.join('/'))
                .replace(/%TITLE%/g, gettitle(parents[parents.length - 1]));
        }
        if (list.length) {
            str += '<ul><li>%LIST%</li></ul>'
                .replace(/%LIST%/g, list.join('</li><li>'));
        }
        return str;
    }

    function override(node, target, root, parents) {
        root = root || node;
        parents = parents || [];
        if (typeof target !== 'object') {
            return;
        }
        $.each(target, function (key, value) {
            if (key === '__move') return;
            node[key] = node[key] || {};
            override(node[key], value, root, parents.concat(key));
        });
        if (target.__link) {
            node.__link = target.__link;
        }
        if (target.__move) {
            // copy node reference
            var path = target.__move.split(/\//g);
            var item = root;
            for (var i = 0; i < (path.length - 1); i++) {
                item[path[i]] = item[path[i]] || {};
                item = item[path[i]];
            }
            item[path[path.length - 1]] = node;
            // delete old node reference
            var item = root;
            for (var i = 0; i < (parents.length  - 1); i++) {
                item = item[parents[i]];
            }
            delete item[parents[parents.length - 1]];
        }
    }

    function generate(tree) {
        var mkp = '<li>%MKP%</li>'
            .replace(/%MKP%/g, traverse(tree));

        var ul = document.createElement('ul');
        ul.innerHTML = mkp;
        ul.id = SITEMAP_ID;
        if (!DEBUG) ul.style.display = 'none';

        $('body').append(ul);

        $(BREADCRUMBS_SELECTOR).breadcrumbsGenerator({
            sitemaps: '#' + SITEMAP_ID,
            index_type: ''
        });
    }

    $.get(SITEMAP_URL, function (res) {
        var $sitemap = $(res);
        var $urls = $sitemap.find('loc');
        var urls = [];

        $urls.each(function () {
            var $elem = $(this);
            var url = ($elem.text()+'').trim();

            url = url
                .replace(/^https?:\/\/[^\/]+\//gi, '')
                .replace(/\/$/, '')
                .split(/\//g);

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

        override(tree, window[BREADCRUMBS_OVERRIDE] || {});

        if (DEBUG) {
            var pre = document.createElement('pre');
            pre.innerHTML = JSON.stringify(tree, null, 4);
            $('body').append(pre);
        }

        generate(tree);
    });

});

