var rsu = angular.module('RsuApp', []);

rsu.controller('RsuListCtrl', ['$scope', '$http', function ($scope, $http) {

  $scope.genEmptyGrant = function() {
    return {
      'date': new Date(),
      'amount': 0,
      'value_at_grant_date': 0
    }
  }


  $scope.grants = [ $scope.genEmptyGrant() ];

  $scope.loadGrants = function() {
    grants = JSON.parse(document.cookie.split('=')[1]);
    // console.log('Load');
    $scope.grants = grants;
  }

  $scope.stock_values = {
  };

  $scope.currency_convert = {
    'ILS': 4
  };

  $scope.stockValue = function(grant) {
    if ($scope.stock_value) {
      return $scope.stock_value;
    } else {
      return $scope.stock_values[grant.stock_symbol];
    }
  }

  $scope.methods = {
    'grant_value': function(grant) {
      return grant.amount * $scope.stockValue(grant);
    },
    'grantMustInFullTax': function(grant) {
      return grant.amount * grant.value_at_grant_date
    },
    'calcGrantMustInFullTaxValue': function(grant) {
      return $scope.methods.grantMustInFullTax(grant) * (0.64);
    },
    'grantNotMustInFullTaxValue': function(grant) {
      return $scope.methods.grant_value(grant) - $scope.methods.calcGrantMustInFullTaxValue(grant);
    },
    'calcGrantNotMustInFullTaxValue': function(grant) {
      return $scope.methods.grantNotMustInFullTaxValue(grant) * (1 - 0.25);
    },
    'grant_taxed': function(grant) {
      return $scope.methods.calcGrantNotMustInFullTaxValue(grant) + $scope.methods.calcGrantMustInFullTaxValue(grant);
    },
    'currencyConvert': function(currency, amount) {
      return amount * $scope.currency_convert[currency];
    }
  }

  $scope.addGrant = function() {
    $scope.grants.push($scope.genEmptyGrant());
  }
  $scope.saveGrants = function(){
    // console.log('Save');
    document.cookie = 'grants=' + JSON.stringify($scope.grants);
  }

  $scope.loadStockValues = function() {
    $http.get('http://finance.google.com/finance/info?client=ig&q=FB,MSFT,GOOG,AAPL,RHT').
    success(function(data, status, headers, config){
      data = JSON.parse(data.replace(/\/\//, ''));
        data.forEach(function(item) {
        $scope.stock_values[item.t] = parseFloat(item.l_cur);
      });
    });
    $http.jsonp('http://rate-exchange.appspot.com/currency?from=USD&to=ILS&callback=JSON_CALLBACK').
    success(function(data, status, headers, config){
      $scope.currency_convert[data.to] = data.rate;
    }).
    error(function(data, status, headers, config){
      console.log('Error!', data, status, headers(), config);
    });
  }

  $scope.init = function() {
    $scope.loadGrants();
    $scope.loadStockValues();
    setInterval(function(){
      $scope.loadStockValues();
      console.log("Reloaded! " + new Date());
    }, 5000);
  }
}]);

