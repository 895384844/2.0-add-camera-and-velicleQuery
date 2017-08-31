var collisionModule = angular.module('collisionModule', ['gridModule']); 
collisionModule.controller('collisionCtrl',function($scope, $http, $filter, gridServices, ModalService, usSpinnerService){

    //实现表格呈现
    // $scope.paginationOptions = {
    //     pageNumber: 1,
    //     pageSize: 20,
    //     sort: null
    // };

    $scope.gridOptions = {
//        paginationPageSizes: [500,1000],
//        paginationPageSize: 20,
//        useExternalPagination: true,
//        enableSorting: false,
//        enableColumnResize: true,
          multiSelect: true,
        rowHeight:35,
        columnDefs : [
            { field: 'imei',displayName: 'IMEI',maxWidth:500,minWidth:150 },
            { field: 'imsi',displayName: 'IMSI',maxWidth:500,minWidth:150 },
            { field: 'totleNum',displayName: '查询结果总数',maxWidth:500,minWidth:150 },
            { field: 'didCount',displayName: '经过设备点位个数',maxWidth:500,minWidth:150 },
            { field: 'dids',displayName: '设备点位详情',maxWidth:500,minWidth:150 },
            { 
                field: 'btnGroup',
                displayName: '查看轨迹',
                maxWidth:500,minWidth:150,
                cellTemplate: '<a class="btnIcon btn-search" href ng-click="grid.appScope.showMap(row.entity)"></a>'
            }
        ]
    };

    $scope.getPage = function(promise){
        promise.then(function(resp){
        $scope.gridOptions.totalItems = resp.data.length;
        if(resp.data.length == 0){alert("没有匹配的结果!");}
        usSpinnerService.stop('spinner-1');
//        console.log(resp.data.length);
//    [{"count":55,"equipment":{"imei":"990006202564904","imsi":"460006598141404"}}]
            var targetArray = [];
            var list = resp.data;
            for(var i=0; i<list.length; i++){
                
                var imei = list[i]['equipment']['imei'];
                var imsi = list[i]['equipment']['imsi'];
                var totleNum = list[i].count;
                var didCount = list[i].didCount;
                var dids = list[i].dids;

                var obj = {
                    imsi : imsi,
                    imei : imei,
                    totleNum : totleNum,
                    didCount : didCount,
                    dids : dids
//                  time : timeArray,
//                  location : location,
//                  deviceName: deviceName,
//                  deviceAddress: deviceAddress,
//                  traceLogs:list[i]['traceLogs']
                };
                targetArray.push(obj);
            }
            $scope.gridOptions.data = targetArray;
        });
        $scope.rows = null;
    };

    $scope.conditionArray = [];
    $scope.btn = {
        status : true
    }

    $scope.$watch(function(){
        return $scope.conditionArray.length
    },function(newValue,oldValue){
        if($scope.conditionArray.length > 1){
            $scope.btn.status = false;
        }else{
            $scope.btn.status = true;
        }
    });

    $scope.showCondition = function(){
        ModalService.showModal({
            templateUrl: 'modals/collisionAnalysis/filter.html',
            controller: 'collisionFilterModalCtrl'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {     
                if(typeof(result) !== 'undefined'){
                    $scope.conditionArray.push(result);
                }
            });
        });
    }

    $scope.removeCondition = function(index){
        $scope.conditionArray.splice(index,1); 
       // angular.element('.grid').trigger('resize')
    }

    $scope.containerHeight = 0; 

    $scope.showMap = function(value) {
        var trackList = [];

        var idArray = [];
        var startTimesArray = [];
        var endTimesArray = [];
        for(var i=0; i<$scope.conditionArray.length; i++){
           var id = $scope.conditionArray[i]['groupId'];
           var startTime = $filter('date')($scope.conditionArray[i]['startTime'], 'yyyy-MM-dd HH:mm');
           var endTime = $filter('date')($scope.conditionArray[i]['endTime'], 'yyyy-MM-dd HH:mm');
           idArray.push(id);
           startTimesArray.push(startTime);
           endTimesArray.push(endTime);
        }
        var post={
            url:'/query/query/traceLogAction!showTraceOnMap.action',
            method:'POST',
            params: {
                imsi: value.imsi,
                groupId : idArray.join(),
                startTimes : startTimesArray.join(),
                endTimes : endTimesArray.join()
            }
        };
        $http(post).then(function(resp){
            var value =resp.data;
            for(var i = 0; i < value.length; i++){
                var obj = {
                    lat : value[i].lat,
                    lon : value[i].lon,
                    startTime: value[i].startTime,
                    endTime: value[i].endTime,
                    device: {
                        name: value[i].deviceName,
                        address: value[i].deviceAddress||'未知'
                    }
                };
                trackList.push(obj);
            }
            ModalService.showModal({
                templateUrl: 'modals/trajectory/showMap.html',
                controller: 'showMapCtrl',
                inputs: { 
                    list: trackList
                }
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                });
            }); 
        });
    };

    $scope.search = function(){
        var idArray = [];
        var startTimesArray = [];
        var endTimesArray = [];
        
        usSpinnerService.spin('spinner-1');
         
        for(var i=0; i<$scope.conditionArray.length; i++){
           var id = $scope.conditionArray[i]['groupId'];
           var startTime = $filter('date')($scope.conditionArray[i]['startTime'], 'yyyy-MM-dd HH:mm');
           var endTime = $filter('date')($scope.conditionArray[i]['endTime'], 'yyyy-MM-dd HH:mm');
           idArray.push(id);
           startTimesArray.push(startTime);
           endTimesArray.push(endTime);
        }
        
        var promise =  gridServices.promiseNew('/query/query/traceLogAction!collisionAnalyze.action',{
            groupId : idArray.join(),
            startTimes : startTimesArray.join(),
            endTimes : endTimesArray.join()
        });
        
        
        $scope.getPage(promise);
       
        //查询后将当前页重新设置为第一页
        //$scope.gridApi.pagination.seek(1);
    };

    $scope.export = function(){
        var idArray = [];
        var startTimesArray = [];
        var endTimesArray = [];
        for(var i=0; i<$scope.conditionArray.length; i++){
           var id = $scope.conditionArray[i]['groupId'];
           var startTime = $filter('date')($scope.conditionArray[i]['startTime'], 'yyyy-MM-dd HH:mm');
           var endTime = $filter('date')($scope.conditionArray[i]['endTime'], 'yyyy-MM-dd HH:mm');
           idArray.push(id);
           startTimesArray.push(startTime);
           endTimesArray.push(endTime);
        }
        var obj = {
            groupId : idArray.join(),
            startTimes : startTimesArray.join(),
            endTimes : endTimesArray.join()
        };

        document.location.href = gridServices.exportAction('/query/query/traceLogAction!exportExcel.action',obj);

    };
    $scope.downLoad = function(){
        $http.get('/system/downloadAction!listFileName.action').then(function(resp){
            if(resp.data){
                ModalService.showModal({
                    templateUrl: 'modals/downLoad.html',
                    controller: 'downLoadCtrlHistory',
                    inputs: { 
                        rows: resp.data 
                    }
                }).then(function(modal) {
                    modal.element.modal();
                    modal.close.then(function(result) {
                    });
                });
            }
        });
    };


});