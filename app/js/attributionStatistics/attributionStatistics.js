var attributionStatisticsModule = angular.module('attributionStatisticsModule', ['gridModule']);
attributionStatisticsModule.controller('attributionStatisticsCtrl',function($scope, $http, $filter, gridServices, httpServices, ModalService){
    $http({
        url:'/device/deviceAction!getDeviceGroup.action',
        method:'POST'
    }).then(function(resp){
        $scope.groupArray = resp.data;
    });
    $scope.citylist = [];
     $http.get('testJson/citylist.json').success(function (data) {
        $scope.citylist = data;
     });

    $scope.query = {
    	province:'0',
        cityId:'0',
        groups: [],
        startTime : '',
        endTime : ''
    };
    $scope.showLoading=false;

    $scope.echartOptions = {
        title : {
            text: '全国各省',
            subtext: '手机归属地占比情况'
        },
        tooltip : {
            trigger: 'item'
        },
        legend: {
            x:'left',
            y:'50',
            orient: 'vertical',
            selectedMode:false,
            data:[]//['北京']
        },
        roamController: {
            show: true,
            x: 'right',
            mapTypeControl: {
                'china': true
            }
        }, 
        toolbox: {
            show : true,
            orient: 'vertical',
            x:'right',
            y:'center',
            feature : {
                mark : {show: true},
                dataView : {show: false, readOnly: false},
                magicType : {show: false, type: ['line', 'bar']}
            }
        },
        series : [
            {
                name: '地区统计数量',
                type: 'map',
                mapType: 'china',
                
                itemStyle:{
                    normal:{label:{show:true}},
                    emphasis:{label:{show:true}}
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function(a){
                        var value =0;
                        if(!isNaN(a.value)){
                            value=a.value
                        }
                        return a.name+"地区统计数量："+value;
                    }
                },
                data:[
                   // {name:'北京', value:0}               
                ]
            },
            {
                name:'归属地占比',
                type:'pie',

                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                center: ['85%', '80%'],
                radius: [40, 60],
                data:[
                   // {name: '北京', value: 0}
                ]
            }
        ],
        animation: true
    };
    $scope.currentMapType='china';

    $scope.changeMapType=function(){
        $scope.currentMapType=$scope.query.province||'china';
    }

    $scope.search = function(){
        //请选择全国地图
        $scope.showLoading=true;
        $scope.query.province=$scope.query.province||{}
        $scope.echartOptions.series[0].mapType = $scope.currentMapType.name||'china'; 

         var data={
                provinceId:$scope.query.province.pid||'0',
                cityId : '0',
                startDate :$filter('date')($scope.query.startTime, 'yyyy-MM-dd HH:mm:ss'),
                closeDate : $filter('date')($scope.query.endTime, 'yyyy-MM-dd HH:mm:ss')

        };
        if ($scope.query.groups.length>0){
            var ids=[];
            for (var i in $scope.query.groups) {
                ids.push($scope.query.groups[i].groupId)
            }
            data.groupId=ids.join(',')
        }
        

        httpServices.promise('/query/query/acquisitionRecordAction!statisticsAttribute.action',
            data).then(function(resp){
            var result=resp.data
            $scope.showLoading=false;
            var  legendData=[];
            var sdata0=[];
            for (var index in result){
                var name=Object.keys(result[index])[0].trim();
                var value=Object.values(result[index])[0];
                legendData.push(name);
                sdata0.push({
                        name:name, 
                        value:value
                    });
            }
            if($scope.currentMapType=='china'){
               $scope.echartOptions.title.text='全国各省'; 
            }else{
                $scope.echartOptions.title.text=$scope.currentMapType.name+'地区';
            }
            
            $scope.echartOptions.legend.data=legendData;
            $scope.echartOptions.series[0].data=sdata0;
            $scope.echartOptions.series[1].data=sdata0;
        });  

    
    };

    $scope.addGroup = function(group) {
        if(!!group){
            if ($scope.query.groups.findIndex(function(a){return a.groupId==group.groupId})>=0){
                return;
            }
            $scope.query.groups.push(group);
        }
    }

    $scope.removeGroup = function(group) {
        var index =$scope.query.groups.findIndex(function(a){return a.groupId==group.groupId})
        $scope.query.groups.splice(index,1); 
    }

});