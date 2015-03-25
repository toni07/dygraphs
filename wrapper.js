var DtpDyGraph = {

	/**
	* toggles a special event on a chart, based on the event ID
	*/
	toggleSpecialEvent: function(chartObject, idSpecialEvent, specialEventList){
	
		Ext.each(specialEventList, function(elem) {
			if(elem.id == idSpecialEvent){
				elem.isAssociatedToChart = !elem.isAssociatedToChart;
			}
		});
		chartObject.updateOptions({
		});
	},

	dipslayChart: function(idDiv, dataList, options) {
	
		var divelem = document.getElementById(idDiv);
		var unitLabel = options.unitLabel;
		var annotations = [];
	
		var chartOptions = {
			labels: options.labels,
			legend: 'always',
			nonEmptyLengendOnStartUp: true,
			legendFont: "bold 12px serif",
			legendFontColor: "black",
			legendHeight: 100,
			connectSeparatedPoints: true,	// connecte les points séparés d'un graphe 
			strokeWidth: 1,
			interactionModel: {			
			
				mousedown: function(event, g, context){
					context.initializeMouseDown(event, g, context);					
						if (event.ctrlKey){					
							Dygraph.startPan(event, g, context);
						}
						else{
							Dygraph.startZoom(event, g, context);
						}					
				},
				mousemove: function(event, g, context){
						if (context.isPanning) {
							Dygraph.movePan(event, g, context);
						} else if (context.isZooming) {
						Dygraph.moveZoom(event, g, context);
						}
				},
				mouseup: function(event, g, context){
					if (context.isZooming) {
						Dygraph.endZoom(event, g, context);
						}
				},
				click: function(event, g, context){					
			
					//Dygraph.cancelEvent(event);
				},
				dblclick: function(event, g, context){
					if (event.ctrlKey){
						if (!(event.offsetX && event.offsetY)){
							event.offsetX = event.layerX - event.target.offsetLeft;
							event.offsetY = event.layerY - event.target.offsetTop;
						}

						var percentages = DtpDyGraph.offsetToPercentage(g, event.offsetX, event.offsetY);
						var xPct = percentages[0];
						var yPct = percentages[1];

						if (event.ctrlKey) {
							DtpDyGraph.zoom(g, +.25, xPct, yPct);
						} else {
							DtpDyGraph.zoom(g, +.2, xPct, yPct);
						}

					}
					else {
						g.updateOptions({
							dateWindow: null,
							valueRange: null
						});
					}


				}
			},
			
			showRangeSelector: (null !=options.showRangeSelector) ? options.showRangeSelector: true,	// Affiche la barre de zoom
			rangeSelectorHeight: (null !=options.rangeSelectorHeight) ? options.rangeSelectorHeight: 40,   // hauteur de la barre de zoom 
			rangeSelectorPlotStrokeColor: '#617e2b',
			rangeSelectorPlotFillColor: '#414a4c',
			drawPoints: (null != options.drawPoints) ? options.drawPoints : true,     // affiche des petits cercles sur chaque point de donnees			
			rightGap: (null != options.rightGap) ? options.rightGap : 10,    // largeur a droite du graphe 
			labelsSeparateLines:  (null != options.labelsSeparateLines) ? options.labelsSeparateLines : false, // Permet d'avoir une ligne par label (legende)
			gridLinePattern: (null !=options.gridLinePattern),// Mettre le grid en pointilles, [espacement x, espacement y]		 
			drawXGrid: (null !=options.drawXGrid) ? options.drawXGrid : true,// Affiche, Cache les grilles en arriee plan
			drawYGrid: (null !=options.drawYGrid) ? options.drawYGrid : true,// Affiche, Cache les grilles en arriere plan				
			highlightCircleSize: (null !=options.highlightCircleSize) ? options.highlightCircleSize : 4,				
			drawHighlightPointCallback: function(g, seriesName, context, cx, cy, seriesColor, pointSize, row) {
			
				    context.beginPath();					
					context.strokeStyle = 'grey';					
					context.lineWidth = '1';
					context.moveTo(cx,0);
					context.lineTo(cx,700);								
					context.stroke();
				
					context.beginPath();					
					context.arc(cx, cy, 4, 0, 2 * Math.PI, true);
					context.fillStyle = 'grey';
					context.fill();
					context.lineWidth = 2;
					context.strokeStyle = seriesColor;
					context.stroke();
			
					context.beginPath();					
					context.arc(cx, cy, 3, 0, 2 * Math.PI, true);
					context.fillStyle = 'grey';
					context.fill();
					context.lineWidth = 1;
					context.strokeStyle = 'white';
					context.stroke();			
			},

			pointClickCallback: (null !=options.pointClickCallback) ? options.pointClickCallback :  function (event, p,j,y,u) {
				var annotationCssClass = 'dygraph-annotation';
				var tooltiptextAnnotation = '';
				if (options.isSuiviAndPrevision){		//chartObjJSON.expertShortNameChart == 'Suivi et Prévision'
					annotationCssClass = 'dygraph-annotation-detail';
					tooltiptextAnnotation = 'Afficher le détail de la semaine';
				};
				var ann = {				
					series: p.name,
					x: p.xval,					
					shortText: (null != p.yval) ? p.yval.toFixed(2) : '',
					text: tooltiptextAnnotation,										
					cssClass: annotationCssClass,
					width: 68,	
					height: 24,
					clickHandler: function() {
						if (options.isSuiviAndPrevision){
							var dateEndWeek = g.file_[p.idx][0];		
							var grid = Ext.create('Ext.dtp.pdw.view.chart.grid.DetailsExpertChartGrid', {	
								idOrganisation: options.idOrganisation,
								dateEndWeek: dateEndWeek,
								indicatorObj: options.indicatorObj
							});
							grid.show();			
						}
					}
				};				

				if (p.annotation){			
					for(var i = 0;i<annotations.length ; i ++){
						if ((annotations[i].x === ann.x)&&(annotations[i].shortText === ann.shortText)&&(annotations[i].series === ann.series)){						
							annotations.splice(i,1);					
						} 
			
					}
					g.setAnnotations(annotations);	
				}
				else {			
					annotations.push(ann);
					g.setAnnotations(annotations);
					Ext.getCmp(idDiv+'deletebutton').setVisible(true);
				}
			},
			
			drawPointCallback: Dygraph.Circles.DEFAULT,
			xlabel: (null !=options.xlabel) ? options.xlabel : '',     // label a l'axe des X
			fillGraph: (null !=options.fillGraph) ? options.fillGraph : false,
			ylabel: (null !=options.ylabel) ? options.ylabel : 'AXE 1',
			y2label: (null !=options.y2label) ? options.y2label : 'AXE 2',
			yAxisLabelWidth: (null !=options.yAxisLabelWidth) ? options.yAxisLabelWidth : 60,
			xAxisHeight: (null !=options.xAxisHeight) ? options.xAxisHeight : 50,	// hauteur entre le graphe et le rangeselector					
			dateWindow : options.dateWindow,			
			labelsDiv: options.labelsDiv,
			series : options.series,
			labelFontColor: "black",		    
			xlabel: (null !=options.xlabel) ? options.xlabel : 'Période',
			axes: (null !=options.axes) ? options.axes : {
				x: {
					valueFormatter: function(val, opts, dygraph, p1, p2){

                        var tmpDate = new Date(val);
                        var tmpDay = String('0' + tmpDate.getDate()).slice(-2);
                        var tmpMonth = String('0' + (tmpDate.getMonth() + 1)).slice(-2);
                        var tmpYear = tmpDate.getFullYear();
                        if(null == val){
                            tmpDay = 'xx';
                            tmpMonth = 'xx';
                            tmpYear = 'xxxx';
                        }
                        return '<div style="width:10%;margin:auto;"><u>' + tmpDay + '/' + tmpMonth + '/' + tmpYear + '</u></div>';
                    }
				},
				y: {
					isFullCustomLegend: true,
					valueFormatter: function(val, opts, serieName, graphObj){
						var tmpVal = 'N/A';
						if(null != val){
							tmpVal = val.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
						}
						var shortSerieName = serieName.replace('[##DATE## : ##VALUE## %]',"");
						shortSerieName = shortSerieName.replace('[##DATE## : ##VALUE## Kg]',"");
						shortSerieName=shortSerieName.charAt(0).toUpperCase()+shortSerieName.substring(1).toLowerCase();
						return '<span><span class="legend-square" style="background-color:'+ graphObj.getPropertiesForSeries(serieName).color +  ';">&nbsp;&nbsp;&nbsp;&nbsp;</span>'  + shortSerieName + ': '+ tmpVal + ' '+ unitLabel +' </span>&nbsp;';
					}
				},
				
				y2: {
					isFullCustomLegend: true,
					valueFormatter: function(val, opts, serieName, graphObj){
						var tmpVal = 'N/A';
						if(null != val){
							tmpVal = val.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
						}
						var shortSerieName = serieName.replace('[##DATE## : ##VALUE## %]',"");
						shortSerieName = shortSerieName.replace('[##DATE## : ##VALUE## Kg]',"");
						shortSerieName=shortSerieName.charAt(0).toUpperCase()+shortSerieName.substring(1).toLowerCase();
						return '<span><span style="position:relative;bottom:2px;font-size:60%;width:100px;height:100px;border-radius:2px;background-color:'+ graphObj.getPropertiesForSeries(serieName).color +  ';">&nbsp;&nbsp;&nbsp;&nbsp;    </span>&nbsp;'  + shortSerieName + ': '+ tmpVal + ' '+ '%' +' </span>&nbsp;';
					},
					axisLabelFormatter: function(val, granularity, opts, dygraph){						
						return  val.toFixed(1)+'0';
					}
				},
			},
			
			pointSize: 3,		
			rollPeriod: 1,
			showRoller: false
		};
		if(null != options.colors){
			chartOptions.colors = options.colors;
		}
		if(null != options.underlayCallback){
			chartOptions.underlayCallback = options.underlayCallback;
		}
		if(null != options.drawChartCallback){
			chartOptions.drawChartCallback = options.drawChartCallback;
		}
		if(null != options.plotter){
			chartOptions.plotter = options.plotter;
		}
		if(null != options.customBars){
			chartOptions.customBars = options.customBars;
		}
		chartOptions.strokeWidth = 3;
		
		var g = new Dygraph(divelem, dataList, chartOptions);
       return g;  		
	},


	unzoomGraph:function () {
		g.updateOptions({
		  dateWindow: null,	
		  valueRange: null
		});
	},
	
	/**
   	* @function 
	* Returns a string to use for the ID of the div that contains a chart
   	*/
	computeChartDivId: function(idChart, idOrganisation){
		
		return 'chart_' + idChart + '_' + idOrganisation;
	},
	
	/**
   	* @function 
	* Returns a string to use for the ID of the div that contains a chart legend
   	*/
	computeChartLegendDivId: function(idChart, idOrganisation){
		
		return 'chartlegend_' + idChart + '_' + idOrganisation;
	},
	
	/**
   	* @function 
	* Returns a string to use for the ID of the div that contains a chart <u>event</u> legend
   	*/
	computeChartEventLegendDivId: function(idChart, idOrganisation){
		
		return 'chart-evt-legend-' + idChart + '-' + idOrganisation;
	},
	
	/**
	 * @function 
	 * Returns the value that DyGraph does not show
	*/
	getValueHidden: function(){
	
		return null;
	},
	
	
	barChartPlotter: function(e) {
	
		var ctx = e.drawingContext;
		var points = e.points;
		var y_bottom = e.dygraph.toDomYCoord(0);
		var bar_width = 8;
		if(e.points.length==1){
			bar_width = 1;
		}
		//bar_width=2/3 * (points[1].canvasx - points[0].canvasx);
		ctx.fillStyle = e.color;
		//var barColumn = Prediwaste.ColorGenerator.hexToRgb(e.color);
		//ctx.fillStyle = 'rgba('+ barColumn.r +', '+ barColumn.g +', '+ barColumn.b +', 0.8)';
		// Do the actual plotting.
		for (var i = 0; i < points.length; i++) {
			var p = points[i];
			var center_x = p.canvasx;  // center of the bar 
			ctx.fillRect(center_x - bar_width / 2, p.canvasy, bar_width, y_bottom - p.canvasy);
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = 'black';			
			ctx.strokeRect(center_x - bar_width/2, p.canvasy, bar_width, y_bottom - p.canvasy);
		}
	},

	multiColumnBarPlotter: function (e) {
      // We need to handle all the series simultaneously.
      if (e.seriesIndex !== 0) return;

      var g = e.dygraph;
      var ctx = e.drawingContext;
      var sets = e.allSeriesPoints;
      var y_bottom = e.dygraph.toDomYCoord(0);

      // Find the minimum separation between x-values.
      // This determines the bar width.
      var min_sep = Infinity;
      for (var j = 0; j < sets.length; j++) {
        var points = sets[j];
        for (var i = 1; i < points.length; i++) {
          var sep = points[i].canvasx - points[i - 1].canvasx;
          if (sep < min_sep) min_sep = sep;
        }
      }
      var bar_width = Math.floor(2.0 / 3 * min_sep);

      var fillColors = [];
      var strokeColors = g.getColors();
      for (var i = 0; i < strokeColors.length; i++) {
        var color = new RGBColorParser(strokeColors[i]);
        color.r = Math.floor((255 + color.r) / 2);
        color.g = Math.floor((255 + color.g) / 2);
        color.b = Math.floor((255 + color.b) / 2);
        fillColors.push(color.toRGB());
      }

      for (var j = 0; j < sets.length; j++) {
        ctx.fillStyle = fillColors[j];
        ctx.strokeStyle = strokeColors[j];
        for (var i = 0; i < sets[j].length; i++) {
          var p = sets[j][i];
          var center_x = p.canvasx;
          var x_left = center_x - (bar_width / 2) * (1 - j/(sets.length-1));

          ctx.fillRect(x_left, p.canvasy,
              bar_width/sets.length, y_bottom - p.canvasy);

          ctx.strokeRect(x_left, p.canvasy,
              bar_width/sets.length, y_bottom - p.canvasy);
        }
      }
    },
	
	writeDtpCalendarEventLegend: function(ctx, xPositionStart, labelsY){
		
		var txtEvt = 'Période';
		var txtEvtWidth = ctx.measureText(txtEvt).width;
		var rectWidth = 20;
		var yHeight = labelsY + 20;
		ctx.fillText(txtEvt, xPositionStart, yHeight + 6);
		var cptr = 0;
		xPositionStart = xPositionStart + txtEvtWidth + 10;
		Ext.iterate(Ext.PrediwasteUtils.holidayParams, function(key, elem){
			ctx.fillStyle = '#000000';
			ctx.fillText(elem.text, xPositionStart + cptr*rectWidth * 4, yHeight + 6);
			ctx.fillStyle = elem.color;
			var rectPosX = xPositionStart + 4*cptr*rectWidth + ctx.measureText(elem.text).width + 6;
			ctx.fillRect(rectPosX, yHeight, rectWidth, 10);
			ctx.strokeStyle = '#000000';
			ctx.strokeRect(rectPosX, yHeight, rectWidth, 10);
			cptr++;
		});
	},
	
	writeDtpWeatherEventLegend: function(ctx, xPositionStart, labelsY){
	
		var txtEvt = 'Précipitations (mm)';
		var txtEvtWidth = ctx.measureText(txtEvt).width;
		var rectWidth = 30;
		var yHeight = labelsY + 20;
		ctx.fillText(txtEvt, xPositionStart, yHeight + 6);
		//rainfall colors
		var cptr = 0;
		xPositionStart = xPositionStart + 10;
		Ext.each(Ext.PrediwasteUtils.rainfallColors, function(elem){
			ctx.fillStyle = elem.color;
			ctx.fillRect(xPositionStart + txtEvtWidth + cptr*rectWidth, yHeight, rectWidth, 10);
			cptr++;
		});
		//rainfall labels
		cptr = 0;
		ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
		var newXPosition = 0;
		Ext.each(Ext.PrediwasteUtils.rainfallColors, function(elem){
			newXPosition = xPositionStart + txtEvtWidth + cptr*rectWidth;
			ctx.fillText(elem.values.split('-')[0], newXPosition, yHeight + 24);
			cptr++;
		});
		
		newXPosition = newXPosition + 50;
		txtEvt = 'Température moyenne (°C)';
		txtEvtWidth = ctx.measureText(txtEvt).width;		
		ctx.fillText(txtEvt, newXPosition, yHeight + 6);
		//temperature colors
		var cptr = 0;
		newXPosition = newXPosition + 10;
		Ext.each(Ext.PrediwasteUtils.temperatureColors, function(elem){
			ctx.fillStyle = elem.color;
			ctx.fillRect(newXPosition + txtEvtWidth + cptr*rectWidth, yHeight, rectWidth, 10);
			cptr++;
		});
		//temperature labels
		cptr = 0;
		ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
		Ext.each(Ext.PrediwasteUtils.temperatureColors, function(elem){
			ctx.fillText(elem.values.split('-')[0], newXPosition + txtEvtWidth + cptr*rectWidth, yHeight + 24);
			cptr++;
		});
	},
	
	/**
	 * displays background bars (calendar & rainfall) 
	*/
	showEventBackgroundBar: function(eventData, comboValue, g, canvas, area){
	
		g.dtpEventType = comboValue;
		Ext.each(eventData, function(elem) {
			if(Ext.PrediwasteUtils.EVENT_TYPE_CALENDAR == comboValue && 1 == elem.is_day_off){
				var bottom_left = g.toDomCoords(Ext.PrediwasteUtils.dateAddDays(new Date(elem.timing), -7), -20);
				var top_right = g.toDomCoords(new Date(elem.timing), +20);
				var left = bottom_left[0];
				var right = top_right[0];
				var holidayColor = Prediwaste.ColorGenerator.hexToRgb(Ext.PrediwasteUtils.holidayParams[1].color);
				canvas.fillStyle = 'rgba('+ holidayColor.r+', '+ holidayColor.g+', '+ holidayColor.b+', 0.3)';
				canvas.fillRect(left, area.y, right - left, area.h);
				canvas.fillStyle = "rgba(0, 0, 0, 0.8)";
			}
			else if(Ext.PrediwasteUtils.EVENT_TYPE_WEATHER == comboValue){
				var bottom_left = g.toDomCoords(Ext.PrediwasteUtils.dateAddDays(new Date(elem.timing), -7), -20);
				var top_right = g.toDomCoords(new Date(elem.timing), +20);
				var topRightTemperature = g.toDomYCoord(elem.temperature);
				var left = bottom_left[0];
				var right = top_right[0];
				
				//rainfall
				var tmpHeight1 = 9*area.h/10;
				var tmpHeight2 = area.h/10;
				var rainfallColorRgb = Ext.PrediwasteUtils.getBackgroundRainfallColor(elem.rainfall);
				canvas.fillStyle = 'rgba('+ rainfallColorRgb.r+', '+ rainfallColorRgb.g+', '+ rainfallColorRgb.b+', 0.3)';
				canvas.fillRect(left, area.y, right - left, area.h/*tmpHeight1*/);
			}
		});
	},
	
	/**
	 * displays background points (temperature) 
	*/
	showEventForegroundPoint: function(eventData, comboValue, g, canvas, area){
	
		g.dtpEventType = comboValue;
		Ext.each(eventData, function(elem) {
			if(Ext.PrediwasteUtils.EVENT_TYPE_WEATHER == comboValue){
				var bottom_left = g.toDomCoords(Ext.PrediwasteUtils.dateAddDays(new Date(elem.timing), -7), -20);
				var top_right = g.toDomCoords(new Date(elem.timing), +20);
				var topRightTemperature = g.toDomYCoord(elem.temperature);
				var left = bottom_left[0];
				var right = top_right[0];
				
				//temperature
				var tmpHeight1 = 9*area.h/10;
				var tmpHeight2 = area.h/10;
				var temperatureColorRgb = Ext.PrediwasteUtils.getBackgroundTemperatureColor(elem.temperature);
				var temperatureZeroCelciusPointHeight = Math.floor(area.h*0.7);
				var temperaturePointHeight = temperatureZeroCelciusPointHeight - (elem.temperature * area.h * 0.01);
				canvas.fillStyle = 'rgba('+ temperatureColorRgb.r+', '+ temperatureColorRgb.g+', '+ temperatureColorRgb.b+', 1)';
				canvas.fillRect(left - 4, temperaturePointHeight, 8, 6);
				//canvas.fillRect(left, tmpHeight1, right - left, tmpHeight2);				
			}
		});
	}

};
