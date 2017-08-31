(function() {
    'use strict';

    angular.module('angular-echarts3', []).directive('mwChart', mwChart);

    function mwChart($window,$http) {
        var directive = {
            restrict: 'E',
            require: 'ngModel',
            template: '<div></div>',
            replace: true,
            link: mwChartLink,
            scope:false
           
        }

        return directive;

        function mwChartLink(scope, el, attr, ngModel) {
            var ndWrapper = el[0];
            var echart = echarts.init(ndWrapper,'macarons');
            scope.registeredMap=['china'];
            scope.$watch('showLoading', function(showLoading) {
                if(!!showLoading){
                    echart.showLoading();
                }else{
                     echart.hideLoading();
                }
            },true);

            scope.$watch('currentMapType', function(curruntMap) {
                if(!curruntMap){
                    return;
                }
                if(curruntMap=='china'){
                    return;
                }
                if(!echart.getOption().series){
                    return;
                }
                if(curruntMap==echart.getOption().series[0].mapType){
                    return;
                }

                if (scope.registeredMap.findIndex(function(a){return a==curruntMap.name})>=0){
                    return;
                }

                $http.get('framework/echarts/map/json/province/'+(curruntMap.sname||'china')+'.json').then(function (resp) {
                    //echart.clear();
                    echarts.registerMap(curruntMap.name, resp.data);
                    scope.registeredMap.push(curruntMap.name);
                });
            },true);
            
            scope.$watch(attr.ngModel, function(option) {
                if(!!option){
                    echart.clear();
                    echart.setOption(option,true);
                    echart.resize(); 
                }
            },true);
            scope.$watch(function() {
                return $window.innerWidth;
            }, function(newValue, oldValue) {
                if (newValue != oldValue) {
                    echart.resize();
                }
            });
            scope.$watch(function() {
                return $window.innerHeight;
            }, function(newValue, oldValue) {
                if (newValue != oldValue) {
                    echart.resize();
                }
            });
        }
    }
})();
