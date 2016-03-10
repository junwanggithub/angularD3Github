define([ "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/UniqueClientsWidget.html",
    "dojo/store/Memory",
    "dojox/grid/DataGrid",
    "ah/util/AHGrid",
    "dojox/grid/enhanced/plugins/IndirectSelection",
    "dojo/data/ObjectStore",
    "dojo/on",
    "dojo/_base/lang",
    "ah/app/DataMgr",
    "dojo/i18n!i18n/comp/dashboard/nls/DashboardPage",
    "ah/util/AHComponent",
    "ah/util/dojocover/AHRouter",
    "dojo/dom-class"], function(declare, _WidgetBase, _TemplatedMixin,
                                _WidgetsInTemplateMixin, template, Memory, DataGrid, AHGrid, IndirectSelection, ObjectStore, on,
                                lang,DataMgr, Msgs, AHComponent,router,domClass) {
    return declare("ah/comp/dashboard/widgets/UniqueClientsWidget", [ _WidgetBase, _TemplatedMixin,
        _WidgetsInTemplateMixin, AHComponent], {

        templateString : template,
        queryParams: {"connectionType":1, "radioType":''},
        /*		chartColors: ['#0093D1', '#FFC30F', '#F5A433', '#7FC9E8', '#60CA02', '#7F93A4', '#002849', '#4CB3DF', '#C85500'],*/
        i18n: Msgs,

        options : [ {name:'2.4 Ghz',type:'rangeOption'},
            {name:'5 Ghz',type:'rangeOption'},
            {name:'Both',type:'rangeOption'},
            {name:'Wired',type:'rangeOption'},
            {name:'All',type:'rangeOption'}],

        // chartColors: {
        // 	'Android':'#3994d0',
        // 	'HiveOS':'#34c1cd',
        // 	'Apple':'#1c9395',
        // 	'Linux':'#9ccd6a',
        // 	'Mac OS X':'#37c6f4',
        // 	'Windows 7/Vista':'#fcc12e',
        // 	'Windows 8':'#f89f33',
        // 	'Windows XP':'#fef2c2',
        // 	'unknown':'#567d39'
        // },

        events : [
            ['connectedType','rangeOption','connectedRadioFn']
        ],

        startup : function(){
            this.inherited(arguments);
            this.initQueryParams();
            this.connectedType.show(2);
            // var dashboard = dijit.getEnclosingWidget(this.domNode.parentNode);
            //on(dashboard, 'timeframe', lang.hitch(this, 'updateTimeframe'));
        },

        initQueryParams: function() {
            this.queryParams = {"connectionType":1, "radioType":""};
        },

        connectedRadioFn: function(i,e) {
            this.queryParams.connectionType = 1;
            this.queryParams.radioType = "";
            if(i==0){
                this.queryParams.connectionType = 1;
                this.queryParams.radioType = 1;
            } else if(i==1) {
                this.queryParams.connectionType = 1;
                this.queryParams.radioType = 2;
            } else if(i==3) {
                this.queryParams.connectionType = 2;
                this.queryParams.radioType = "";
            } else if(i==4) {
                this.queryParams.connectionType = "";
                this.queryParams.radioType = "";
            }
            if(this.queryParams.min) {
                this.fetchData();
            }
        },

        updateTimeframe: function(queryParams) {
            if(!queryParams.min || !queryParams.max) return;
            this.queryParams.min = queryParams.min;
            this.queryParams.max = queryParams.max;
            this.queryParams.precision = queryParams.precision;
            this.queryParams.filterParams = queryParams.filterParams;
            var filterParam = this.getFilterParam("connectionTypes=");
            if(filterParam == 1) {
                this.connectedType.hide("3,4");
                this.connectedType.show(2);
            } else if(filterParam == 2) {
                this.connectedType.hide("0,1,2,4");
                this.connectedType.show(3);
            } else {
                this.connectedType.hide("");
                this.connectedType.show(2);
            }
            // this.fetchData();
        },

        getFilterParam: function(type) {
            var tempP = this.queryParams.filterParams;
            if(tempP == "" || tempP.indexOf(type) == -1) return null;
            var index = tempP.indexOf(type)+type.length;
            return tempP.substring(index, tempP.length);
        },

        fetchData: function() {
            var that = this,
                dashboard = dijit.getEnclosingWidget(this.domNode.parentNode), filterParams=this.queryParams.filterParams;

            this.widgetContent.style.display = 'none';

            var url = "services/monitoring/dashboard/wip/unique/client?precision="+this.queryParams.precision+"&startTime="+this.queryParams.min+"&endTime="+this.queryParams.max+filterParams;

            var filterParam = this.getFilterParam("connectionTypes=");

            if(filterParam == 1) {
                url = url +"&dashboardRadioType="+this.queryParams.radioType;
            } else if(filterParam == 2) {
            } else {
                url = url +"&dashboardRadioType="+this.queryParams.radioType+"&dashboardConnectionType="+this.queryParams.connectionType;
            }
            //var url = "services/monitoring/dashboard/wip/unique/client?precision=3600000&startTime=1456815600000&endTime=1456822800000&dashboardRadioType=&dashboardConnectionType="
            if(!dashboard) {
                return;
            }

            dashboard.xhrUnique = DataMgr.makeGetRequest({
                requestURL: url,
                callbackFn: "fetchChart",
                parent: that
            });
        },
        fetchChart: function(rsp){
            this._requestDataTimer && clearTimeout(this._requestDataTimer);

            var url = "services/monitoring/dashboard/wip/unique/client/data?taskKey="+rsp.data;
            this.taskKey = rsp;
            this.$get(url, this.rendChart);
        },

        _getChartColor : function(name) {
            // var color = typeof this.chartColors[name] == 'undefined' ? this.bakChartColors.shift() : this.chartColors[name];
            var color = this.chartColors.shift() || this.bakChartColors.shift();
            this.legendColors.push(color);
            return color;
        },

        _formatNumber: function(n) {
            with (Math) {
                var base = floor(log(abs(n))/log(1000));
                var suffix = 'kmb'[base-1];
                var subNumber = round(String(n/pow(1000,base)));
                return suffix ?  subNumber+suffix  : ''+n;
            }

        },

        rendChart: function(data) {
            if(!data.data || data.data.status !== "READY"){
                this._requestDataTimer = setTimeout(lang.hitch(this,function(){
                    this.fetchChart(this.taskKey);
                }), 1000);
                return;
            }

            var data = data.data && data.data.uniqueClientByOsVo;
            var data1 = {"data": {
                "totalClientCount": 99999999,
                "poorClientCount": 27,
                "clientsByOss": [
                    {
                        "osName": "Apple OS",
                        "clients": 13
                    },
                    {
                        "osName": "HiveOS",
                        "clients": 10
                    },
                    {
                        "osName": "windows",
                        "clients": 13
                    }
                ]
            }};

            var dashboard = dijit.getEnclosingWidget(this.domNode.parentNode);
            // selectedTime = this.$query('.time-control-item.selected',dashboard.domNode)[0].getAttribute('data-timeframe');//dataset.timeframe;
            this.widgetContent.style.display = '';
            var totalClients = data.totalClientCount || 0;
            var formatTotalClients = this._formatNumber(totalClients);
            this.numUniqueClients.innerHTML = formatTotalClients;
            if(totalClients > 0) {
                this.noData.style.display = 'none';
                this.contentContainer.style.display = '';
            } else {
                if (this.queryParams.precision === 86400000) {
                    this.$text(this.noData, Msgs.message.noDataWeek);
                } else {
                    this.$text(this.noData, Msgs.message.noData);
                }
                this.noData.style.display = '';
                this.contentContainer.style.display = 'none';
                return;
            }

            var chartData = [];
            this.legendColors = [];

            this.numUniqueClientsLabel.innerHTML = formatTotalClients;
            this.numUniqueClientsLabel.setAttribute('title', totalClients);
            if(formatTotalClients.length>=4){
                domClass.add('numUniqueClients', 'four-digits');
            }
            this.poorClientCount.innerHTML = data.poorClientCount || 0;

            this.chartColors= ["#2D358E", "#3F72B8", "#37C6F4", "#1D6790", /*"#SD89BC",*/ "#B6E3F6", "#02344F", "#0F9193", "#37C0CD", "#52723C", "#93C563", "#C1E1C1"];
            this.bakChartColors= ['#3994d0','#34c1cd','#1c9395','#9ccd6a', '#37c6f4','#fcc12e', '#f89f33', '#fef2c2', '#567d39', '#c1e2c2', '#023550', '#266a92', '#b6e4f9', '#2c3691'];


            for(var i = 0; i < data.clientsByOss.length; i++) {
                //chartData[i] = [data.data.clientsByOss[i].osName, data.data.clientsByOss[i].clients];
                chartData[i] = {
                    name:  data.clientsByOss[i].osName,
                    color: this._getChartColor(data.clientsByOss[i].osName),
                    y:     data.clientsByOss[i].clients
                }
            }

            var clientChart = new Highcharts.Chart(
                {
                    /*colors: this.chartColors,*/
                    chart: {
                        renderTo: this.osChart,
                        height: '200',
                        margin: [0, 0, 0, 0],
                        spacingTop: 0,
                        spacingBottom: 0,
                        spacingLeft: 0,
                        spacingRight: 0,
                        backgroundColor: '#FFFFFF'
                    },
                    title: {
                        text: null
                    },
                    tooltip: {
                        pointFormat: '<div id="pieChartToolTip">{point.options.name}<br/> Number: {point.options.y}<br/><b>Percentage: {point.percentage:.1f}%</b></div>',
                        //shared: false,
                        headerFormat: '',
                        useHTML: true,
                    },
                    legend: {
                        itemWidth: 160,
                        align: 'right',
                        verticalAlign: 'middle',
                        layout: 'vertical',
                        borderWidth: 0,
                        itemMarginTop: 5,
                        itemStyle: {
                            marginTop: '5px',
                            fontSize: '10px'
                        },
                        labelFormatter: function () {
                            return this.name +'<span style="font-weight:normal;"> (' + Math.round(this.percentage*10)/10+'%)</span>';
                        }
                    },
                    plotOptions: {
                        pie: {
                            showInLegend: true,
                            size:'100%',
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            center: [100, 90],
                            point: {
                                events: {
                                    click: lang.hitch(this, function(e) {
                                        var clientName = e.point.name;
                                        //not sure how to get the selected timeframe from the dashboard
                                        //TODO - need to create a route for "selected timeframe + clientName param above
                                        router.go("/activeclients/"+clientName.replace(/\//g, "_").replace(/\s+/g,"")+"/"+this.queryParams.min+"/"+this.queryParams.max);
                                        e.preventDefault();
                                    })
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Clients By Os',
                        innerSize: '60%',
                        data: chartData
                    }]
                });
        }

    });
});
