angular
    .module('angular-local-cached-http-module')
    .service('cachedHttp', [ '$window', '$document', '$http', '$q', function($window, $document, $http, $q) {

      var storage;

      /*
       * Blatently nabbed from: https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage
       */

      function buildCookieBasedLocalStorage() {
        return {
            getItem: function (sKey) {
              if (!sKey || !this.hasOwnProperty(sKey)) { return null; }
              return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
            },
            key: function (nKeyId) {
              return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
            },
            setItem: function (sKey, sValue) {
              if(!sKey) { return; }
              document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
              this.length = document.cookie.match(/\=/g).length;
            },
            length: 0,
            removeItem: function (sKey) {
              if (!sKey || !this.hasOwnProperty(sKey)) { return; }
              document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
              this.length--;
            },
            hasOwnProperty: function (sKey) {
              return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
            }
        };
      }

      function get(key) {
        try {
          return JSON.parse(storage.getItem(key));
        } catch(e) {
          return null;
        }
      }

      /*
       * options [ url, data, method, expires ]
       */

      function request(options) {
        var deferred = $q.defer();
        var stored = get(options.url);
        if (stored != null && stored.expires > Date.now()) {
          deferred.resolve(stored.cached);
        }
        $http(options).then(function(response) {
            storage.setItem(options.url, JSON.stringify({
              cached: response,
              expires: options.expires || Date.now()
            }));
            deferred.resolve(response);
        });
        return deferred.promise;
      };

      function initialize() {
          storage = window.localStorage || buildCookieBasedLocalStorage();
      }

      initialize();

      return {
        request: request
      };

}]);
