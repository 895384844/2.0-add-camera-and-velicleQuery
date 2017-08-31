var homeModule = angular.module('homeModule', ['gridModule']);
homeModule.controller('homeCtrl',function($scope, $interval, $http, gridServices){

    function getLineChart(type){
        return {
            color: ['#7cb5ec'],
            title: {
                text: type.title
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: type.data
            }],
            yAxis: [{
                type: 'value'
            }],
            series: [{
                name: type.seriesName,
                type: 'line',
                //stack: '总量',
                label: {
                    normal: {
                        show: false,
                        position: 'top'
                    }
                },
                areaStyle: { normal: {} },
                data : type.seriesData
            }]
        };
    }

    $http({
        url : '/realtime/systemStatus!getMemUsage.action',
        method : 'POST'
    }).then(function(resp){
        var list = resp.data.data;
        var xData = [];
        var fData = []; 
        for(var i=0; i<list.length; i++){
            var xItem = list[i]['date'];
            var fItem = list[i]['Memory'];
            xData.push(xItem);
            fData.push(fItem);
        }

        var ram = {
            title : '内存使用情况',
            data : xData,
            seriesName : '内存使用情况',
            seriesData : fData
        };

        $scope.optionRam = getLineChart(ram);
    });

    $http({
        url : '/realtime/systemStatus!getCpuUsage.action',
        method : 'POST'
    }).then(function(resp){
        var list = resp.data.data;
        var xData = [];
        var fData = []; 
        for(var i=0; i<list.length; i++){
            var xItem = list[i]['date'];
            var fItem = list[i]['Cpu'];
            xData.push(xItem);
            fData.push(fItem);
        }

        var cpu = {
            title : 'CPU使用情况',
            data : xData,
            seriesName : 'CPU使用情况',
            seriesData : fData,
        };

        $scope.optionCpu = getLineChart(cpu);
    });


    var timer = $interval(function(){

        $http({
            url : '/realtime/systemStatus!getMemUsage.action',
            method : 'POST'
        }).then(function(resp){
            var list = resp.data.data;
            var xData = [];
            var fData = []; 
            for(var i=0; i<list.length; i++){
                var xItem = list[i]['date'];
                var fItem = list[i]['Memory'];
                xData.push(xItem);
                fData.push(fItem);
            }
            $scope.optionRam.xAxis[0].data = xData;
            $scope.optionRam.series[0].data = fData;
        });

        $http({
            url : '/realtime/systemStatus!getCpuUsage.action',
            method : 'POST'
        }).then(function(resp){
           var list = resp.data.data;
            var xData = [];
            var fData = []; 
            for(var i=0; i<list.length; i++){
                var xItem = list[i]['date'];
                var fItem = list[i]['Cpu'];
                xData.push(xItem);
                fData.push(fItem);
            }
            $scope.optionCpu.xAxis[0].data = xData;
            $scope.optionCpu.series[0].data = fData;
        }); 

        $scope.$on('$destroy', function() {
            $scope.stop();
        });

    },5000);

    $scope.stop = function() {
        $interval.cancel(timer);
    };



    function getType(value){
        if(value <= 25){
            return 'success';
        }else if(25 < value && value <= 50){
            return 'info';
        }else if(50 < value && value <= 75){
            return 'warning';
        }else {
           return 'danger'; 
        } 
    }

    $scope.progressArray = [];

    $http({
        url:'/realtime/systemStatus!getDiskUsage.action',
        method:'POST'
    }).then(function(resp){

        for(var i in resp.data){
            var obj = {
                value : resp.data[i],
                type : getType(resp.data[i])
            };
            if(i == 'diskMysqlUsage'){
                obj.name = 'Mysql分区';
            }else if(i == 'diskVarUsage'){
                obj.name = 'Var分区';
            }else{
                obj.name = 'Root分区';
            }
            $scope.progressArray.push(obj);
        }

    });

    
    function getStatus(value){
        if(value == 0){
            return {
                background : 'bg-danger',
                icon : 'glyphicon glyphicon-remove',
                text : '异常'
            };
        }
        return {
            background : 'bg-success',
            icon : 'glyphicon glyphicon-ok',
            text : '正常'
        };
    }

    $scope.statusArry = [];

    $http({
        url:'/realtime/systemStatus!getServiceStatus.action',
        method:'POST'
    }).then(function(resp){
        for(var i in resp.data){
            var obj = getStatus(resp.data[i]);
            if(i == 'tomcatStatus'){
                obj.name = 'Tomcat运行状态';
            }else if(i == 'mysqlStatus'){
                obj.name = 'Mysql运行状态';
            }else if(i == 'redisStatus'){
                obj.name = 'Redis运行状态';
            }else if(i == 'ngnixStatus'){
                obj.name = 'Httpd运行状态';
            }else{
                obj.name = 'EFS服务进程状态';
            }
            $scope.statusArry.push(obj);
        }
    });

    $scope.gridOptions = {
        enableSorting: false,
        multiSelect: true,
        rowHeight : 35
    };

    $scope.promise = gridServices.promiseNew('/realtime/systemStatus!realtimeQuery.action',{
        page: 1,
        rows: 200,
        sort: 'id',
        order: 'desc'
    });

    $scope.gridOptions.columnDefs = [
        { field: 'device_number',displayName: '采集设备编号',maxWidth:400,minWidth:200 },
        { field: 'report_time',displayName: '上报时间',maxWidth:400,minWidth:200 },
        { field: 'imei',displayName: '被监测IMEI',maxWidth:400,minWidth:200 },
        { field: 'imsi',displayName: '被监测IMSI',maxWidth:400,minWidth:200 },
        { field: 'phone_number',displayName: '手机号码',maxWidth:400,minWidth:200 },
    ];

    $scope.getPage = function(promise){
        promise.then(function(resp){
            $scope.gridOptions.data = resp.data.rows;
        });
    };

    $scope.getPage($scope.promise);

    var timer2 = $interval(function(){
        $scope.promise = gridServices.promiseNew('/realtime/systemStatus!realtimeQuery.action',{
            page: 1,
            rows: 200,
            sort: 'id',
            order: 'desc'
        });
        $scope.getPage($scope.promise);
        
        $scope.$on('$destroy', function() {
            $scope.stop2();
        });
    },5000);

    $scope.stop2 = function(){
        $interval.cancel(timer2);
    }

});