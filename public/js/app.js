_.mixin({
  'sortKeysBy': function (obj, comparator) {
      var keys = _.sortBy(_.keys(obj), function (key) {
          return comparator ? comparator(obj[key], key) : key;
      });
  
      return _.object(keys, _.map(keys, function (key) {
          return obj[key];
      }));
  }
});

var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

var app = angular.module('app6', ['ngRoute', 'ui.bootstrap', 'chart.js', 'underscore']);

//http://jsfiddle.net/3my3tybq/
// app.directive('editableInput',function(){
//   return{
//     restrict:"EA",
//     replace:true,
//     scope:{
//       abc:"=",
//       showing:"="
//     },
//     template:
//       '<div>'+
//       '<div ng-hide="showing" ng-click="click()" >{{abc}}</div>'+
//       '<input type="text" ng-model="abc" ng-blur="done()" ng-show="showing"/><br>'+
//       '<!--<button ng-click="done()" ng-show="showing">Save</button></div>-->'+
//       '</div>',
//     link:function(scope,elem,attr)
//     {
//       scope.abc = "text";
//       scope.done=function()
//       {
//         scope.showing=false;
//       };
//       scope.click=function()
//       {
//         scope.showing=true;
//       };
//       }
//   }
// });

app.run(function($pouchDB, $window, $rootScope) {
  $pouchDB.setDatabase("pkranich-test");
  console.log("init database");

  //https://stackoverflow.com/questions/16242389/how-to-check-internet-connection-in-angularjs
  $rootScope.online = navigator.onLine;
  $window.addEventListener("offline", function() {
    $rootScope.$apply(function() {
      $rootScope.online = false;
    });
  }, false);

  $window.addEventListener("online", function() {
    $rootScope.$apply(function() {
      $rootScope.online = true;
    });
  }, false);

});

app.controller('NavigationController', function($scope, $location, AppAlert){
  $scope.isCollapsed = true;

  $scope.isActive = function(viewLocation){
    return viewLocation === $location.path();
  };

  $scope.getCurrentPath = function()
  {
    return $location.path();
  };

  $scope.addAlert = function(msg){
    AppAlert.add("warning", msg);
  };

});

app.controller('GlobalAlertController', function($scope, $rootScope, AppAlert, $sce){
  this.alerts = [];

  this.closeAlert = function(index) {
    AppAlert.closeAlertIdx(index);
  };

  this.alerts = $rootScope.alerts;

  var ctrl = this;
});

app.factory('AppAlert', ['$rootScope', function($rootScope) {
    var alertService;
    $rootScope.alerts = [];

    return alertService = {
      add: function(type, msg) {
        return $rootScope.alerts.push({
          type: type,
          msg: msg,
          close: function() {
            return alertService.closeAlert(this);
          }
        });
      },
      closeAlert: function(alert) {
        return this.closeAlertIdx($rootScope.alerts.indexOf(alert));
      },
      closeAlertIdx: function(index) {
        return $rootScope.alerts.splice(index, 1);
      }
    };
  }
]);

app.config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/modal', { template: '', controller: 'ModalController as base'})
    .when('/list', { templateUrl: '/list.html', controller: 'ListController as base'})
    .when('/static', { templateUrl: '/static.html'})
    .when('/test', { templateUrl: '/test.html', controller: 'TestController as base'})
    .when('/tanken', { templateUrl: '/tanken.html', controller: 'TankenController as base'})
    .when('/wetter', { templateUrl: '/wetter.html', controller: 'WetterController as base'})
    .when('/wetterstats', { templateUrl: '/wetterstats.html', controller: 'WetterStatsController as base'})
    //.when('/fahrzeug/:id?', { templateUrl: '/fahrzeug.html', controller: 'FahrzeugController as base'})
    .when('/about', { template: 'über unsere Pizzeria' })
    .when('/item/:documentId?/:documentRevision?', { templateUrl: '/item.html', controller: 'ItemController as base' })
    .otherwise({ redirectTo: '/list'});
    //http://plnkr.co/edit/5qrD7hB6i8vQEqa8jZ1G?p=preview + https://stackoverflow.com/questions/35386273/angularjs-open-route-page-on-modal
  // $stateProvider.state('myModalState', {
  //     'url': '/fahrzeug/:id?',
  //     'onEnter': [
  //       '$uibModal', function($uibModal){
  //         $uibModal.open({
  //           templateUrl:'/fahrzeug.html',
  //           controller: 'FahrzeugController as base'
  //         }).result.then(
  //             function closed (item) {
  //               // Executed when uibModalInstance is closed, returns value
  //           },
  //           function dismissed () {
  //               // Executed when modal is dismissed/canceled
  //           }
  //         );
  //       }
  //     ]
  //   });
}]);

app.controller('TestController', function($scope, $rootScope, $sce){
  this.alerts = [
    { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
    { type: 'success', msg: 'Well done! You successfully read this important alert message.' },
    { type: 'warning', msg: 'Well done! You successfully read this important alert message.' },
    { type: 'info', html: $sce.trustAsHtml('<strong>Well done! You successfully read this important alert message.</strong>') }
  ];

  this.addAlert = function() {
    ctrl.alerts.push({msg: 'Another alert!'});
  };

  this.closeAlert = function(index) {
    ctrl.alerts.splice(index, 1);
  };

  var ctrl = this;
});

app.controller('WetterController', function($scope, $rootScope, WetterService, $uibModal, AppAlert){

  var ctrl = this;
  this.viewby = 12;
  this.itemsPerPage = 12;
  this.maxSize = 5; // Limit number for pagination size.
  this.bigCurrentPage = 1; //Current page number. First page is 1.
  this.myValues = [6,12,24,50,100];

  this.setItemsPerPage = function(num) {
    ctrl.viewby = num;
    ctrl.itemsPerPage = num;
    ctrl.bigCurrentPage = 1; //reset to first page
  }
  this.click = function()
  {
    this.setItemsPerPage(3);
    console.log("3");
  }

  $rootScope.isLoading = true;
  WetterService.getWetter()
    .then(function(data){
      ctrl.allwetter = data;
      ctrl.bigTotalItems = data.length;
      console.log("data");
    }).finally(function (){
      $rootScope.isLoading = false;
    });
  
  this.showWetter = function(id)
  {
    console.log("wetterid: " + id);
    var modalInstance = $uibModal.open({
      templateUrl:'/wettermodal.html',
      controller: 'WetterModalController as base',
      resolve: {
        wetterId: function () {
          return {id: id};
        }
       }
    });
    modalInstance.result.then(function(result){
      console.log("resultstring: " + result.result);
    });
    modalInstance.closed.then(function() {
      ctrl.fahrzeuge = {};
      console.log("closed modal");
      //AppAlert.add("info", "closed modal");
    });
    }
});

app.controller('WetterStatsController', function($scope, $rootScope, WetterService, CacheController, _){

  var ctrl = this;

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getDateFormat(date)
  {
    return date.getFullYear()+ "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-"+ ("0" + date.getDate()).slice(-2);
  }

  $rootScope.isLoading = true;
  
  WetterService.getLastWetterForecast()
    .then(function(data){
      ctrl.forecast = data;
    });

    WetterService.getOneWetter('latest')
    .then(function(data){
  	  ctrl.actual = data;
    });
     
 // WetterService.getAllWetterStatsCache()
    WetterService.getAllWetterStats()
    .then(function(data){
      ctrl.allwetter = data;
            
      var grouped = _.groupBy(data, function(item) { return item.todaycond;});
            
      var groupedArray = [];
      groupedArray["Other"] = 0;
      _.each(grouped, function(value, key, list){
        if(value.length >= 10){
          groupedArray[key] = value.length;
        }else{
          groupedArray["Other"] += value.length;
        }
      });

      $scope.doughnut = {}
      $scope.doughnut.data = _.values(groupedArray);
      $scope.doughnut.labels = _.keys(groupedArray);
      $scope.doughnut.options = {legend: {display: true, position: 'left'}};

      var d = new Date();
      var yd = addDays(d, -1);

      var yesterdaydatestringDay = getDateFormat(yd);
      var todaydatestringDay =  getDateFormat(d);
      
      ctrl.today = d;
      ctrl.yesterday = yd;
      
      var yesterdayTemperatur = _.sortBy(_.filter(data, function(item){return item.date.startsWith(yesterdaydatestringDay);}), '_id');
      var todayTemperatur = _.sortBy(_.filter(data, function(item){return item.date.startsWith(todaydatestringDay);}), '_id');
      
      //Prozentangabe in Tooltip: https://stackoverflow.com/questions/37257034/chart-js-2-0-doughnut-tooltip-percentages
      $scope.line = {}
      
      $scope.line.labels = _.map(yesterdayTemperatur, function(item){ 
        var date = new Date(item.date);
        return date.getUTCHours()+":00 Uhr";
      });
      
      $scope.line.series = ["heute", "gestern"];
      var dataYdString =  _.pluck(yesterdayTemperatur,'currenttemp');
      var dataYdNumber = dataYdString.map(Number);
      
      var dataTdString =  _.pluck(todayTemperatur,'currenttemp');
      var dataTdNumber = dataTdString.map(Number);
      
      $scope.line.data = [ dataTdNumber, dataYdNumber];
      
      $scope.onClick = function (points, evt) {
        console.log(points, evt);
      };
      $scope.line.datasetOverride = [{ yAxisID: 'y-axis-1' },{ yAxisID: 'y-axis-2'}];
      $scope.line.options = {
        scales: {
          yAxes: [
            {
              id: 'y-axis-1',
              type: 'linear',
              display: true,
              position: 'left',
              ticks: {
                suggestedMin: _.min(dataYdNumber.concat(dataTdNumber))-1,
                suggestedMax: _.max(dataYdNumber.concat(dataTdNumber))+1
              }
             }
          ]
        }
      };
    }).finally(function (){
      $rootScope.isLoading = false;
    });
});

app.controller('WetterModalController', function($scope, $rootScope, $uibModal,
   $uibModalInstance, WetterService, TankenService, CacheController, wetterId) {

  var ctrl = this;

  this.editId = wetterId; 

  $rootScope.isLoading = true;

  console.log(CacheController.get(this.editId.id));
  if(CacheController.get(this.editId.id) != null)
  {
    ctrl.wetter = CacheController.get(this.editId.id)
    console.log("from cache");
    $rootScope.isLoading = false;
  }else
  {
    console.log("not in cache");
    WetterService.getOneWetter(this.editId.id)
    .then(function(data){
      ctrl.wetter = data;
      //ctrl.wetter = JSON.stringify(data, null, 2);
      console.log(ctrl.wetter);
      //CacheService.put(data._id, data);
      CacheController.put(data._id, data);
      console.log("to  cache");
    }).finally(function (){
      $rootScope.isLoading = false;
    });
  }
  this.ok = function () {
    console.log("click ok");
    $uibModalInstance.close({ result: 42 });
  };

  this.cancel = function () {
    console.log("click cancel");
    $uibModalInstance.dismiss('cancel-string');
  };
});

app.controller('FahrzeugController', function($scope, $rootScope, TankenService, $routeParams){

  var ctrl = this;
  var id = $routeParams.id;
  console.log("search id "+ id);
  
  TankenService.getFahrzeug(id)
    .then(function(data){
      ctrl.fahrzeug = data;
      console.log(ctrl.fahrzeug);
    });
    
});

app.controller('TankenController', function($scope, $rootScope, TankenService, $uibModal, AppAlert){

  var ctrl = this;

  this.delete = function(id) {
    console.log("delete " + id);
    TankenService.deleteFahrzeug(id)
    .then(function(data){
      ctrl.fahrzeuge = {};
      console.log("data " + data);
      refreshFahrzeuge();
    });
  };

  this.addModal = function () {
    console.log("open ad modal");
    var modalInstance = $uibModal.open({
      templateUrl:'/addtankenmodal.html',
      controller: 'AddTankenModalController as base',
      resolve: {
       }
    }).closed.then(function() {
      ctrl.fahrzeuge = {};
      console.log("closed modal");
      refreshFahrzeuge();
      AppAlert.add("info", "closed modal");
    });
  }
    refreshFahrzeuge = function()
    {
      //https://stackoverflow.com/questions/16855836/angularjs-http-get-then-and-binding-to-a-list
      TankenService.getFahrzeuge()
      .then(function(data){
        ctrl.fahrzeuge = data;
        console.log(ctrl.fahrzeuge);
      });
    }

    refreshFahrzeuge();
});

app.controller('ItemController', function($scope, $rootScope, $pouchDB, $location, $routeParams){

  var ctrl = this;

  this.savebuttonText = "Add";

  this.placeholderNewItem = {
    liter: 40,
    preisProLiter: 1.69,
    kmStand: 123456,
  }

  if($routeParams.documentId){
    this.message = "Edit";
    this.savebuttonText = "Save";
    $pouchDB
      .get($routeParams.documentId)
      .then(function(result) {
      ctrl.newItem = result;
      ctrl.newItem.date = new Date(result.date);
      console.log(result);
      $scope.$apply();
    });

  }else{
    this.message = "Add";
    this.newItem = {
      date: new Date(),
      kmTyp: "kmtotal"
    }
  }

  this.save = function(date, kmStand, liter, preisProLiter)
  {
    console.log(date + ":" + kmStand + " "+ liter + " "+ preisProLiter)
    var insert = {
      date: date, kmStand: kmStand, liter: liter, preisProLiter: preisProLiter, preis: preisProLiter*liter
    };
    if($routeParams.documentId){
      insert._id = $routeParams.documentId;
      insert._rev = $routeParams.documentRevision;
    }
    $pouchDB.save(insert)

    //this.allItems.push(insert);
    this.newItem = {
      date: new Date(),
      liter: liter,
      preisProLiter: preisProLiter,
      kmStand: kmStand
    };
    $location.path('/list');
  };
});

app.controller('AddTankenModalController', function($scope, $uibModal, $uibModalInstance, TankenService) {

  var ctrl = this;
  this.submitted = false;
  this.currentYear = new Date().getFullYear();
  this.formData = {};

  this.addFahrzeug = function(isvalid){
    this.submitted = true;
    console.log("submit: " + this.submitted);
    console.log("valid: " + isvalid);
    if(isvalid)
    {
      TankenService.addFahrzeug(this.formData);
      console.log(this.formData);
      this.formData = {};
      $uibModalInstance.close();
    }
  };

  this.ok = function () {
    console.log("click ok");
    $uibModalInstance.close();
  };

  this.cancel = function () {
    console.log("click cancel");
    $uibModalInstance.dismiss('cancel');
  };
});

app.controller('ModalController', function($scope, PouchLogicManager, $pouchDB, $uibModal, $uibModalInstance, editId) {

  var ctrl = this;

  this.editId = editId;
  this.newCommentText = '';

  var getItem  = PouchLogicManager.getItem(editId.id);
  ctrl.item = getItem;
  console.log("open for edit: " + ctrl.item);
  if(!getItem.comments)
  {
    getItem.comments = [];
    console.log("comments was empty");
  }

  $scope.$watch(function() { return PouchLogicManager.getItem(editId.id)}, function(newValue, oldValue){
    console.log("new rev: " + newValue._rev)
    ctrl.item = newValue;
  }, true);

   this.addComment = function (text, author) {
    this.item.comments.push({text: text, author:author, creationdate:new Date()});
    $pouchDB.save(ctrl.item);
  }

  this.ok = function () {
    console.log("click ok");
    $uibModalInstance.close();
  };

  this.cancel = function () {
    console.log("click cancel");
    $uibModalInstance.dismiss('cancel');
  };
});

app.controller('ListController', function($scope, $rootScope, $pouchDB, PouchLogicManager, $uibModal){

  this.items = PouchLogicManager.items;

  this.delete = function(id, rev) {
    $pouchDB.delete(id, rev);
  }

  this.editModal = function (id, rev) {
    var modalInstance = $uibModal.open({
      templateUrl:'/modal.html',
      controller: 'ModalController as base',
      resolve: {
        editId: function () {
          return {id: id, rev: rev};
        }
      }
    });
  }

  /*
  getLastObject = function(){
    var length = Object.keys(this.allItems).length;

  };

  getMaxKmStand = function() {
    return Math.max.apply(Math,this.allItems.map(function(o){return o.kmStand;}));
  }

  this.compactDatabase = function(){
    $pouchDB.compact();
    console.log("after compact database")
  }

   this.destroy = function(id, rev) {
    $pouchDB.destroy();
    console.log("destroy database");
  }
  */

});

app.factory("WetterService", ["$http", function ($http){

  return {
    getAllWetterStatsCache: function(){
      return $http.get("js\\wetter.json")
        .then(function (response){
          return response.data})
        .catch(function(err){ console.log(err.data)});
    },
    getLastWetterForecast: function(){
      return $http.get("https://wt-4df3e1263ec5ab864236cbda1f52133e-0.run.webtask.io/DEV_express/forecast")
        .then(function (response){
          return response.data})
        .catch(function(err){ console.log(err.data)});
    },
    getAllWetterStats: function(){
      return $http.get("https://wt-4df3e1263ec5ab864236cbda1f52133e-0.run.webtask.io/DEV_express/all")
        .then(function (response){
          return response.data})
        .catch(function(err){ console.log(err.data)});
    },
    getWetter: function(){
      return $http.get("https://wt-4df3e1263ec5ab864236cbda1f52133e-0.run.webtask.io/DEV_express")
        .then(function (response){
          console.log(response.data);
          return response.data})
        .catch(function(err){ console.log(err.data)});
    },
    getOneWetter: function(id){

        return $http.get("https://wt-4df3e1263ec5ab864236cbda1f52133e-0.run.webtask.io/DEV_express/"+id)
        .then(function (response){
          console.log(response.data);
          return response.data;
        })
        .catch(function(err){ console.log(err.data)});     
    }
  }
}]);

app.factory("TankenService", ["$http", function ($http){
  return {
    getFahrzeuge: function(){
      return $http.get("/api/fahrzeuge/")
        .then(function (response){return response.data})
        .catch(function(err){ console.log(err.data)});
    },
    getFahrzeug: function(id){
      return $http.get("/api/fahrzeuge/"+id)
        .then(function (response){return response.data})
        .catch(function(err){ console.log(err.data)});
    },
    addFahrzeug: function(fahrzeug){
      return $http.post("/api/fahrzeuge/", fahrzeug)
        .then(function (response){return response.data})
        .catch(function(err){ console.log(err.data)});
    },
    deleteFahrzeug: function(id){
      return $http.delete("/api/fahrzeuge/"+id)
        .then(function (response){
          console.log("resp " + response);
          return response.data})
        .catch(function(err){ console.log(err.data)});
    }
  }
}]);

app.factory('CacheService', ['$cacheFactory', function ($cacheFactory) {
  return $cacheFactory('CacheService');
}]);

app.factory('CacheController',['$cacheFactory', function($cacheFactory){
   keys = [];
   cache = $cacheFactory('wetterCache');

   return {
    get: function(id){
      if (angular.isUndefined(cache.get(id)))
      {
        return null;
      }
      return cache.get(id);
    },
    put : function(id, value){
      if (angular.isUndefined(cache.get(id)))
      {
        keys.push(id);
      }
      cache.put(id, value);
    }
  }
}]);

app.service("PouchLogicManager", ["$rootScope", "$q", "$pouchDB", function($rootScope, $q, $pouchDB) {
  var ctrl = this;

  this.items = {};

  $pouchDB.startListening();

  ctrl.getItem = function(id){
    return ctrl.items[id];
  }

  var cleanUpChangeFunc = $rootScope.$on("$pouchDB:change", function(event, data) {
    console.log("onchange id/rev: " + data.doc._id + "/"+ data.doc._rev);
    ctrl.items[data.doc._id] = data.doc;
    $rootScope.$apply();
  });

  var cleanUpDelFunc = $rootScope.$on("$pouchDB:delete", function(event, data) {
    console.log("ondelete id:" + data.doc._id);
    delete ctrl.items[data.doc._id];
    $rootScope.$apply();
  });
}]);

app.service("$pouchDB", ["$rootScope", "$q", function($rootScope, $q) {

  var database;
  var changeListener;
  var URL = "https://penessimookedgiveryinest:7b4eae6a867106313e5a8d229a02795af7738472@philikran.cloudant.com/angulartest";
  //Key:akingeretheizentookinute
  //Password:93db63ff63ff2648fbbeba72fe4eebfcec83fd25
  //Please make a note of the password. For security reasons, we will not store it for you to retrieve in the future.

  //Key:penessimookedgiveryinest
  //Password:7b4eae6a867106313e5a8d229a02795af7738472

  this.setDatabase = function(databaseName) {
    database = new PouchDB(databaseName);
    database.sync(URL, { live: true });
  }

  this.enableSync = function(live){
    database.sync(URL, { live: live });
  }

  this.startListening = function() {
    changeListener = database.changes({
      live: true,
      include_docs: true
    }).on("change", function(change) {
      if(!change.deleted) {
        $rootScope.$broadcast("$pouchDB:change", change);
      } else {
        $rootScope.$broadcast("$pouchDB:delete", change);
      }
    });
  }

  this.stopListening = function() {
    if(changeListener)
    {
      changeListener.cancel();
      console.log('stop');
    }
  }

  this.sync = function(remoteDatabase) {
    database.sync(remoteDatabase, {live: true, retry: true});
  }

  this.save = function(jsonDocument) {
    var deferred = $q.defer();
    if(!jsonDocument._id) {
      database.post(jsonDocument).then(function(response) {
        deferred.resolve(response);
      }).catch(function(error) {
        deferred.reject(error);
      });
    } else {
      database.put(jsonDocument).then(function(response) {
        deferred.resolve(response);
      }).catch(function(error) {
        deferred.reject(error);
      });
    }
    return deferred.promise;
  }

  this.delete = function(documentId, documentRevision) {
    return database.remove(documentId, documentRevision);
  }

  this.get = function(documentId) {
    return database.get(documentId);
  }

  this.destroy = function() {
    database.destroy();
  }

  this.compact = function() {
    database.compact().then(function (info) {
      // compaction complete
      console.log(info);
    }).catch(function (err) {
      // handle errors
    });
  }

}]);