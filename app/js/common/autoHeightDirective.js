var autoHeightModule = angular.module('autoHeightModule', []);

autoHeightModule.directive('autoHeight',function(){
	return {
		// container: is a refer element selector like #id, .class 
		// offset: offset number 
		/*
			<div id="container">
				<div id="test">
				</div>
				</div>
				div auto-height container="#container" offset="10">
			</div>				
		*/
        restrict: 'A',
        link: function(scope, element,attrs) {
        	var container =!!attrs.container?attrs.container:'.frame'
        	var offset =!!attrs.offset?Number(attrs.offset):(element.prev().height()+85);

        	var changeTop=function( newHeight, oldHeight ) {
        		var height=angular.element(container).height()-offset;
                element.css('height', height+"px");
            } ;
            
			 scope.$watch( function(){
	           return angular.element(document.body).height();
	         }, changeTop);
        
           
            
        }
    };
}).directive('heightBind',function(){
	return {
		// height-bind: is a refer element selector like #id, .class 
		// container: is a refer element selector like #id, .class 
		/*
			<div id="container" >
				<div  height-bind="#test" container="#container">
				</div>
				<div id="test">
				</div>
			</div>				
		*/

        restrict: 'A',
        link: function(scope, element,attrs) {
        	var container =!!attrs.container?attrs.container:'.frame'
        	//console.info(angular.element(container).height());
        	var changeTop=function( newHeight, oldHeight ) {
        		var height=angular.element(container).height()-element.height()-85;
                angular.element(attrs.heightBind).css('height', height+"px");
            } ;
            
			 scope.$watch(function(){
	           return element.height();
	         }, changeTop);
        }
    };
});

