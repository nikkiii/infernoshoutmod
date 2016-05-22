// ==UserScript==
// @name		   InfernoShoutMod Dev
// @namespace	  http://rune-server.org/
// @include     *.rune-server.org/forum.php
// @include     *.rune-server.org/infernoshout.php?do=detach
// @version		1.1
// ==/UserScript==

var scriptNode = document.createElement("script");
scriptNode.setAttribute("type", "text/javascript");
scriptNode.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.14/require.min.js");
scriptNode.setAttribute("data-main", "https://nikkii.us/sbmod/loader.js");
scriptNode.setAttribute("async", true);
document.getElementsByTagName("head")[0].appendChild(scriptNode);
