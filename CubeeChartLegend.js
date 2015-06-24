/**
 * Class used for the chart legends
 * @author toni07 24/06/2015
*/
"use strict";
var CubeeChartLegend = function(options){

	var me = this;

	this.resetContent = function(chartInstance){
		
		me.globalDiv.innerHTML = '';
		console.log('##me.legendElementList', me.legendElementList);
		for(var i in me.legendElementList){
			//console.log('##me.i', i, me.legendElementList[i]);
			me.globalDiv.appendChild(me.legendElementList[i]);
		}
	};
	
	
	this.createLegend = function(chartInstance, p, selectedPoints, isInit){
	
		if(null == isInit){
			isInit = false;
		}
		//console.log('##in createLegendFunction', chartInstance, chartInstance.maindiv_.id);
		//var chartLegend = chartInstance.chartLegend;
		if(isInit){
			//me.addChartReference(chartInstance);
			me.legendElementList[chartInstance.maindiv_.id] = null;
		}
		var u,s,m;
		var z = chartInstance.getLabels();
		var A = chartInstance.optionsViewForAxis_("x");
		var valueFormatterFunction = A("valueFormatter");
		var isFullCustomLegendX = A('isFullCustomLegend');
		
		var v = [];
		var j = chartInstance.numAxes();
		for(u=0; u<j; u++){
			v[u] = chartInstance.optionsViewForAxis_("y"+(u?1+u:""));
		}
		
		var result = document.createElement('div');
		if(typeof(p)==="undefined"){	//called when the mouse goes out of the chart			
			
			var nonEmptyLengendOnStartUp = chartInstance.getOption('nonEmptyLengendOnStartUp');	//modif aep
			
			if(nonEmptyLengendOnStartUp){		//do the same thing as if a point was selected -- !TODO: factorize this code!
				result.appendChild(chartInstance.xAxisConfiguration.legendDomElement(null, chartInstance));	//add date legend
			}
			for(u=0; u<chartInstance.series.length; u++){
				var e = chartInstance.series[u].legendDomElement(null, chartInstance.series[u], u, chartInstance);
				result.appendChild(e);	//add value legend
			}
			me.legendElementList[chartInstance.maindiv_.id] = result;
			return;
		}
		
		result.appendChild(chartInstance.xAxisConfiguration.legendDomElement(p, chartInstance));	//add date legend
		var k = chartInstance.getOption("labelsShowZeroValues");
		var B = chartInstance.getHighlightSeries();
		//console.log('##selectedPoints', selectedPoints);
		var seriesNamesSelected = [];
		var seriesNamesValues = [];
		for(u = 0; u < selectedPoints.length; u++){
			var t = selectedPoints[u];
			seriesNamesSelected.push(t.name);			
			seriesNamesValues[t.name] = t;
		}
		for(u=0; u<chartInstance.series.length;u++){
			var serie = chartInstance.series[u];
			var currentValue = null;
			if(-1 != seriesNamesSelected.indexOf(serie.label)){
				currentValue = seriesNamesValues[serie.label].yval;
			}
			var e = serie.legendDomElement(currentValue, serie, u, chartInstance);
			result.appendChild(e);	//add value legend
		}
		me.legendElementList[chartInstance.maindiv_.id] = result;
		me.resetContent(chartInstance);
		//return result;
	};
		
	////////////////////////////////////////////////////////////////////////////////////////////////
	////////////// constructor body ///////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////
	this.constructor = function(){
	
		me.globalDiv = options.globalDiv;
		//me.chartReferenceList = new Array();
		me.legendElementList = {};
	};
	
	this.constructor();
	
};