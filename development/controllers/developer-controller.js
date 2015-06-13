'use strict';

angular
    .module('DeveloperModule')
    .controller('DeveloperController', ['$scope', 'cachedHttp', function($scope, cachedHttp) {

      $scope.data = null;

      function loadResponse(response) {
          $scope.data = response.data;
      }

      function initialize() {
        cachedHttp.request({
            url: "https://api.github.com/users/paulshemmings/repos",
            method: "GET",
            expires: Date.now() + (1000 * 60 * 60)
        }).then(loadResponse);
      }

      initialize();

    }]);
