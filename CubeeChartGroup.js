/**
 * Class used to manage a group of charts working together
 * @author toni07 24/06/2015
*/
"use strict";
var CubeeChartGroup = function(chartInstanceList, options){

	var me = this;
		
	////////////////////////////////////////////////////////////////////////////////////////////////
	////////////// constructor body ///////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////
	this.constructor = function(){
	
		me.chartInstanceList = chartInstanceList;
		
		for(var i=0; i<me.chartInstanceList.length; i++){
			var currentChart = me.chartInstanceList[i];
			//console.log('##currentChart', currentChart);
			currentChart.updateOptions({
				highlightCallback : function(e, x, pts, row) {
					for(var j=0; j<me.chartInstanceList.length; j++){
						var innerCurrentChart = me.chartInstanceList[j];
						if(innerCurrentChart != currentChart){
							innerCurrentChart.setSelection(row);
						}
					}
				},
				zoomCallback: function(p1, p2, p3, chartInstance, p5){
					console.log('##zoomed', p1, p2, p3, chartInstance, p5, this);
					var range = chartInstance.xAxisRange();
					for(var j=0; j<me.chartInstanceList.length; j++){
						var innerCurrentChart = me.chartInstanceList[j];
						if(innerCurrentChart != currentChart){
							innerCurrentChart.updateOptions({
								dateWindow : range
							});
						}
					}
				}/*,
				drawCallback : function(me2, initial) {
					var range = me2.xAxisRange();
					for(var j=0; j<me.chartInstanceList.length; j++){
						var innerCurrentChart = me.chartInstanceList[j];
						if(innerCurrentChart != currentChart){
							innerCurrentChart.updateOptions({
								dateWindow : range
							});
						}
					}
				}*/
			});
		}
	};
	
	this.constructor();
	
};