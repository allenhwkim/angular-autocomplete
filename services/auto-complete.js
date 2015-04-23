(function(){
  'use strict';
  var $q, $http;

  var defaultStyle = 
    'auto-complete-div.default-style input {'+
    '  outline: none; '+
    '  border: 0;'+
    '  padding: 0;'+
    '  margin: 2px 0 0 3px;'+
    '  background-color: #fff'+
    '}' + 

    'auto-complete-div.default-style ul {'+
    '  background-color: #fff;'+
    '  margin-top: 2px;'+
    '  display : none;'+
    '  width : 100%;'+
    '  overflow-y: auto;'+
    '  list-style-type: none;'+
    '  margin: 0;'+
    '  padding: 0;'+
    '  border: 1px solid #ccc;'+
    '  box-sizing: border-box;'+
    '}' + 

    'auto-complete-div.default-style ul li {'+
    '  padding: 2px 5px;'+
    '  border-bottom: 1px solid #eee;'+
    '}' + 

    'auto-complete-div.default-style ul li:last-child {'+
    '  border-bottom: none;'+
    '}' + 

    'auto-complete-div.default-style ul li:hover {'+
    '  background-color: #ccc;'+
    '}' + 

    'div .auto-complete-repeat {'+
    '  display: inline-block;'+
    '  padding: 3px; '+
    '  background : #fff;'+
    '  margin: 3px;' +
    '  border: 1px solid #ccc;' +
    '  border-radius: 5px;' +
    '}' +

    'div .auto-complete-repeat .delete {'+
    '  margin: 0 3px;' +
    '  text-decoration: none;' +
    '  color: red;' +
    '}' +

    'auto-complete-div[multiple].default-style {'+
    '  position: relative;' +
    '  display: inline-block;' +
    '}' +

    'auto-complete-div[multiple].default-style input {'+
    '  background-color: transparent;'+
    '  border: none;' +
    '  border-radius: 0;' +
    '}' +

    'auto-complete-div[multiple].default-style ul {'+
    '  position: absolute;'+
    '  top: 1.5em;'+
    '  left: 0;'+
    '  width: auto;' +
    '  min-width: 10em;'+
    '}' +
    '';

  // return dasherized from  underscored/camelcased string
  var dasherize = function(string) {
    return string.replace(/_/g, '-').
      replace(/([a-z])([A-Z])/g, function(_,$1, $2) {
        return $1+'-'+$2.toLowerCase();
      });
  };

  // get style string of an element
  var getStyle = function(el,styleProp) {
    return document.defaultView.
      getComputedStyle(el,null).
      getPropertyValue(styleProp);
  };

  var injectDefaultStyleToHead = function() {
    if (!document.querySelector('style#auto-complete-style')) {
      var htmlDiv = document.createElement('div');
      htmlDiv.innerHTML = '<b>1</b>'+ 
        '<style id="auto-complete-style">' +
        defaultStyle +
        '</style>';
      document.getElementsByTagName('head')[0].
        appendChild(htmlDiv.childNodes[1]);
    }
  };

  var getRemoteData = function(source, query, pathToData) {
    var deferred = $q.defer(), httpGet;
    if (typeof source == 'string') {
      var keyValues = []; 
      for (var key in query) { // replace all keyword to value
        var regexp = new RegExp(key, 'g');
        if (source.match(regexp)) {
          source = source.replace(regexp, query[key]);
        } else {
          keyValues.push(key + "=" + query[key]);
        }
      }
      if (keyValues.length) {
        var qs = keyValues.join("&");
        source += source.match(/\?[a-z]/i) ? qs : ('?' + qs);
      }
      httpGet = $http.get(source);
    } else if (source.$promise) { 
      httpGet = source(query).$promise;
    } else if (typeof source == 'function') {
      httpGet = source(query);
    }

    httpGet.success(function(data) {
      console.log('data', data);
      var list = data;
      if (pathToData) {
        var paths = pathToData.split('.');
        paths.forEach(function(el) {
          list = list[el];
        });
      }
      deferred.resolve(list);
    }).error(function(error) {
      deferred.reject(error);
    });

    return deferred.promise;
  };

  angular.module('angular-autocomplete').
    factory('AutoComplete', function(_$q_, _$http_) {
      $q = _$q_, $http = _$http_;
      return {
        defaultStyle: defaultStyle,
        dasherize: dasherize,
        getStyle: getStyle,
        getRemoteData: getRemoteData,
        injectDefaultStyle: injectDefaultStyleToHead
      };
    });
})();
