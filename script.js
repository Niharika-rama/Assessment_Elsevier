// Code goes here

var app = angular.module('myApp', []);

app.service("PatientService", ["$http", "$q", function($http, $q) {

  var config = {
    headers:  {
        'Accept': 'application/json+fhir'
    }
  };

  this.getPatientDetails = function() {
    var deferred = $q.defer();
    
    $http.get("https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/Patient/4342012", config).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    })
    return deferred.promise;
  };
  
  this.getPatientConditions = function() {
    var deferred = $q.defer();
    
    $http.get("https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/Condition?patient=4342012&clinicalstatus=active", config).then(function(data) {
      deferred.resolve(data);
    }, function(err) {
      deferred.reject(err);
    })
    return deferred.promise;
  };

}]);


app.controller("PatientCtrl",["PatientService","$scope",function(PatientService,$scope){
  
  $scope.Patient = {};
  $scope.conditions = [];
  $scope.sortType = 'condition';
  $scope.sortReverse  = false;
  $scope.loading = true;
  
  $scope.sortData = function(column) {
    $scope.sortReverse = ($scope.sortType == column) ? !$scope.sortReverse: false;
    $scope.sortType = column;
  }

  $scope.getSortClass = function(column) {
      if($scope.sortType == column) {
        return $scope.sortReverse ? 'fa fa-caret-down': 'fa fa-caret-up';
      }
      return '';
  }

  var data = PatientService.getPatientDetails();

  data.then(function(details){
    $scope.Patient = details.data;
    var conditionData = PatientService.getPatientConditions();
    conditionData.then(function(conditions) {
      //console.log(JSON.stringify(conditions.data.entry));
      for(entry in conditions.data.entry) {
        if(conditions.data.entry[entry].resource.clinicalStatus && conditions.data.entry[entry].resource.clinicalStatus == 'active') {
          $scope.conditions.push({
            condition: conditions.data.entry[entry].resource.code.text,
            date: conditions.data.entry[entry].resource.dateRecorded,
            url : "https://www.ncbi.nlm.nih.gov/pubmed/?term=" + conditions.data.entry[entry].resource.code.text
          })
        }
      }
      $scope.loading = false;
    })
  });

}]);