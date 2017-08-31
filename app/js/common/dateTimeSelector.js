var dateTimeSelectorModule = angular.module('dateTimeSelectorModule', []);

dateTimeSelectorModule.directive('ngDateTimeSelector',function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs,ngModel) {
                element.on('change',function(){
                     var datetime = element.val();
                        if (attrs.ngDateTimeSelector === 'start' && !!datetime) {
                            ngModel.$setViewValue(datetime + ":00.0");
                        } else if (attrs.ngDateTimeSelector === 'end' && !!datetime) {
                            ngModel.$setViewValue(datetime + ":59.999");
                        } else {

                        }
                });
                element.datetimepicker({
                     format:attrs.ngDateTimeFormat||'Y-m-d H:i',
                     step:attrs.step||1,
                     onClose:function(currentTime){
                        if(currentTime){

                        }
                     }
                });
                $.datetimepicker.setLocale('zh');
            }
    };
});
