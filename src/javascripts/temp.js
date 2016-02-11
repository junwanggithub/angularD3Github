define([ "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dojo/text!./templates/EntityTimeline.html",
    "dojo/on",
    'ah/util/common/ModuleBase',
    "dojo/Evented",
    "dojo/_base/lang",
    "dojo/date/locale",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/query",
    "ah/util/Formatter",
    'dojo/when',
    "ah/util/common/SessionStorage",
    "dojo/i18n!i18n/comp/entities/nls/EntityTimeline",
    "ah/comp/entities/EntityRadioSet",
    "ah/comp/entities/DeviceEntityTimelineBar",
    "ah/comp/entities/ClientEntityTimelineBar",
    "ah/comp/entities/UserEntityTimelineBar"], function(declare, _WidgetBase, template,on, ModuleBase, Evented, lang, locale, attr, domStyle,domConstruct,array, query,Formatter,when,sessionStorage,messages) {

    return declare("ah/comp/entities/EntityTimeline", [ModuleBase,Evented], {

        templateString : template,

        i18n : messages,

        rangeOptions : {
            'day':[{name:'1H',type:'rangeOption',value:1},
                {name:'4H',type:'rangeOption',value:4},
                {name:'8H',type:'rangeOption',value:8},
                {name:'Last 24H',type:'rangeOption',value:24}],
            'week':[{name:'1D',type:'rangeOption',value:1},
                {name:'2D',type:'rangeOption',value:2},
                {name:'7D',type:'rangeOption',value:7}]
        },

        url:'',

        urlParam:{},

        datas : null,

        bDelay:false,

        width:1118,

        showY:true,

        height:300,

        navHeight:120,

        showMark: true,

        Dduration: 'day',

        timeSelectShow: true,

        timeDetailShow: true,

        autoComple: true,

        /*		selectRange:{
         'tag': 'day',
         'value': 1
         },*/

        jsonMap: {
            'key':'clientInfos',
            'name': 'Client'
        },

        keepRange: false, // Any user changes to the timeline are persisted for that session.

        needPrecision: true,

        defaultTimeMap: {
            "precision": {
                "week": 86400000,
                "day": 3600000,
                'month': 86400000
            },
            "apiParam": {
                "week": "timeunit=day&timeunitcount=7&precision=86400000",
                "day": "timeunit=hour&timeunitcount=24&precision=3600000",
                'month': "timeunit=day&timeunitcount=31&precision=86400000"
            },
            "chartRange": {
                "week": {
                    xAxis: {
                        minRange: 3600 * 1000 * 24,
                    },
                    navigator: {
                        xAxis: {
                            tickInterval: 3600 * 1000 * 24
                        }
                    }
                },
                "day": {
                    xAxis: {
                        minRange: 3600 * 1000
                    },
                    navigator: {
                        xAxis: {
                            tickInterval: 3600 * 1000 * 2
                        }
                    }
                },
                "month": {
                    xAxis: {
                        minRange: 3600 * 1000 * 24,
                    },
                    navigator: {
                        xAxis: {
                            tickInterval: 3600 * 1000 * 24 * 5,
                        }
                    }
                }
            },
            "timeCount": {
                'day': 24,
                'week': 7,
                'month': 31
            },
            'formatterfn':{
                'usage': Formatter.convertBytes
            }
        },

        precisionMap: {"week": 86400000,"day": 3600000,'month':86400000},

        showBar:false,

        barType:'Device',

        events:[
            ['rangeValue', 'rangeOption', 'updateSelectedRange'],
            ['showTimeType','change','showTime']
        ],

        _setUrlParamAttr : function(obj){
            this._set('urlParam',obj);
        },

        _setDatasAttr : function(data){
            this._set('datas',data);
        },

        postMixInProperties : function(){

            this.range = Object.keys(this.rangeOptions);
            this.timeMap = lang.clone(this.defaultTimeMap);
            this.timeMap =  lang.mixin(this.timeMap,this.timeMapConfig || {});
        },

        postCreate: function() {
            this.inherited(arguments);

            this.keepRange && typeof this.sessionKey == 'string' && this.initRange();

            this.rangeValue.set('type',this.getRangeShow('range') || this.Dduration);

            this.rendShowItem();

        },

        initRange: function() {
            var sessionData = sessionStorage.get('com.timeline.'+this.sessionKey);
            if(!sessionData) {
                var obj = {
                    'range': this.selectRange && this.selectRange.tag || this.Dduration
                };
                sessionStorage.set('com.timeline.'+this.sessionKey, obj);
                this.resetRangeSession();
            }
        },

        resetRangeSession: function() {
            array.forEach(this.range, lang.hitch(this,function(item){
                var sessionData = sessionStorage.get('com.timeline.'+this.sessionKey+'.'+item);
                if(sessionData) {
                    sessionStorage.set('com.timeline.'+this.sessionKey+'.'+item, null);
                }
            }))
        },

        getRangeShow: function(key) {
            var sessionData = sessionStorage.get('com.timeline.'+this.sessionKey);

            if(!sessionData || !sessionData[key]){
                return this.selectRange && this.selectRange.tag || this.Dduration;
            }

            return sessionData[key];
        },

        startup: function() {
            this.inherited(arguments);
            this.rendUI();
            if (this.bDelay) { //not ask the api first, until the global filter call refresh
                return;
            }
            this.fetchData();

        },

        refresh : function() {
            var v = this.showTimeType.domNode.value || this.Dduration;
            this.lastMax = 0;
            this.lastMin = 0;
            this.rangeValue.cur = -1;
            this.fetchData();
            this.timelineBar.refresh(v);
        },

        rendUI : function(){
            this.rendOpt();
        },

        rendShowItem: function() {
            if(!this.timeSelectShow) {
                this.timeSelect.style.display = 'none';
            }
            if(!this.timeDetailShow) {
                this.timeDetail.style.display = 'none';
            }
        },

        /*rned time range choose list */

        rendOpt : function() {

            for(var i=0; i<this.range.length; i++) {
                var str = '<option value="'+this.range[i]+'">'+this.firstUpper(this.range[i])+'</option>';
                domConstruct.place(domConstruct.toDom(str),this.showTimeType.domNode);
            }

            this.showTimeType.set('value',this.getRangeShow('range') || this.Dduration);
        },



        firstUpper: function(str) {
            return str.charAt(0).toUpperCase() + str.substring(1);
        },


        showTime: function(e) {

            var v = e.target.value;
            this.lastMax = 0;
            this.lastMin = 0;
            this.rangeValue.cur = -1;
            this.rangeValue.set('type',v);

            this.keepRange && sessionStorage.set('com.timeline.'+this.sessionKey, {
                'range': v || this.Dduration
            });

            this.rangeValue.rendUI();
            this.fetchData();
            this.timelineBar.refresh(v);
        },

        fetchData : function() {

            if(this.datas) {
                var data = this.datas;
                if(data.data && data.data.range) {
                    data = this._rendData(data);
                }
                this.rendChart(data);
            }else {
                this.toggleEls();

                if(!this.url) {
                    return;
                }

                this.chartData = this.$get(this._getFetchUrl(),lang.hitch(this,function(data){
                    if(data.data.respCode >0) return;

                    this.rendChart(this._rendData(data));
                }));

                when(this.chartData).then(lang.hitch(this,function(){
                    this.toggleEls(true);
                }))
            }

        },

        _rendData: function(data) {
            var dataRange = data.data.range,
                parentEnv = dijit.getEnclosingWidget(this.domNode.parentNode);

            if(this.formatFn) {
                data = this.formatFn(data);
            }else if(parentEnv['setOverData']) {
                data = parentEnv['setOverData'].apply(parentEnv,[].slice.call(arguments)) || data.data;
            }else {
                data = this.setOverData(data);
            }

            return this.autoComple ? this.checkData(data,dataRange) : data;
        },

        _getFetchUrl: function() {

            var v = this.showTimeType.domNode.value || this.Dduration,
                url = this.url,
                f = Boolean(url.indexOf('?') > -1),str = '', arr = [];

            if(this.urlParam && Object.keys(this.urlParam).length) {
                for (i in this.urlParam) {
                    arr.push(i + '=' + this.urlParam[i]);
                }

                str += arr.join('&');
            }
            if(str.length) {
                url = url + (f ? '&' : '?') + str;
            }

            if(this.needPrecision) {
                var has = Boolean(url.indexOf('?') > -1);

                url = url + (has ? '&' : '?') + this.timeMap['apiParam'][v];
            }

            return url;
        },

        addParams: function(obj) {
            if(obj && Object.keys(obj).length) {

                for(var i in obj){
                    this.urlParam[i] = obj[i];
                }
            }

            this.refresh();
        },

        replaceParams: function(obj,f) {

            this.urlParam = {};

            if(obj && Object.keys(obj).length) {

                this.needPrecision = f ? true : false;

                for(var i in obj){
                    this.urlParam[i] = obj[i];
                }
            }

            this.refresh();
        },

        toggleEls : function(f) {
            if(f) {

                this.timelineMark.style.display = 'none';
            }
            else{

                this.timelineMark.style.display = '';
            }
        },

        makeFakeData : function() {
            var d = new Date();

            if(d.getMinutes()>30) {
                d.setHours(d.getHours()+2);
            }
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);

            var arr=[];
            for(var i =1;i<169;i++) {
                arr.push({'timestamp':d.setHours(d.getHours()-1),'value':Math.ceil(Math.random()*135)});
            }

            return arr.reverse();
        },

        buildChartOptions: function(data,opt) {
            var that = this;

            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });

            this.formatterfn = data[0].formatFn || '';

            var defaultOpt = {
                chart: {
                    renderTo: this.timeRangePicker,
                    height: this.height,
                    width:this.width,
                    backgroundColor:'#fbfbfb',
                    spacingBottom: 30,
                    events: {
                        load: function() {
                            if(this.chartLoad) {
                                this.chartLoad();
                            }
                        }
                    }
                },
                yAxis: { labels: { enabled: false}},
                xAxis: {
                    labels: { enabled: false},
                    lineWidth: 0,
                    tickLength: 0,
                    tickWidth: 0,
                    minRange: 3600 * 1000,
                    events : {
                        afterSetExtremes: lang.hitch(this,function(event){
                            this._xtimer && this._xtimer.remove();
                            this._xtimer = this.defer(function(){
                                this.updateTimeRange(event);
                            },1e3);
                        })
                    }
                },
                tooltip: {
                    useHTML: true,
                    backgroundColor: '#676767',
                    borderWidth: 1,
                    borderRadius: 1,
                    borderColor: '#b3b3b3',
                    formatter: function() {
                        return '<div class="entity-timeline-bar-tooltip"><small>'+Highcharts.dateFormat("%A.%B %e.%Y.%H:%M",this.x)+'</small><table class="entity-timeline-tooltip-name">'+
                            '<tr><td>'+data[0].name+': </td>' +
                            '<td style="text-align: right"><b>'+that._formateValue(this.y)+'</b></td></tr>' +
                            '</table></div>';
                    },
                },
                rangeSelector: false,
                navigator: {
                    outlineColor: '#cfcfce',
                    outlineWidth: 1,
                    maskInside: false,
                    maskFill: 'rgba(255,255,255,0.8)',
                    height: this.navHeight,
                    handles: {
                        backgroundColor: '#ffffff',
                        borderColor: '#0d2a47',
                    },
                    yAxis: {
                        gridLineColor: '#cfd0d0',
                        gridLineWidth: 1,
                        startOnTick: false,
                        endOnTick: false,
                        minTickInterval:1,
                        //minPadding: 0.1,
                        //maxPadding: 0.1,
                        min: 0,
                        minRange : 0.1,
                        labels: {
                            //enabled: true,
                            enabled: false
                        },
                        title: {
                            text: this.showY ? data[0].name || '' : '',
                            style: {
                                color: '#969696',
                                font: '10px Helvetica, Arial, sans-serif'
                            }
                        },
                        tickWidth: 0
                    },
                    xAxis: {
                        tickWidth: 0,
                        lineWidth: 1,
                        gridLineColor: '#cfd0d0',
                        gridLineWidth: 1,
                        //tickPixelInterval: 200,
                        labels: {
                            align: 'left',
                            style: {
                                color: '#969696',
                                font: '10px Helvetica, Arial, sans-serif'
                            },
                            x: 3,
                            y: 15
                        }
                    },
                    series: {
                        type: 'line',
                        color: '#bcd1e8',
                        dataGrouping: {
                            smoothed: true
                        },
                        lineWidth: 1,
                        marker: {
                            enabled: false
                        }
                    }
                },
                scrollbar: {
                    enabled: false
                },

                //hack for add mark
                //series:[0],
                series: this.showMark ? [0] : data
            },options;

            if(this.showMark) {
                this.yAxisMax = Math.ceil(this._getMaxYaxis(data)*1.5);
                if(this.yAxisMax) {
                    defaultOpt = Highcharts.merge(defaultOpt,{
                        navigator: {
                            yAxis: {
                                max: this.yAxisMax
                            }
                        }
                    })
                }
            }

            if(opt) {
                options = Highcharts.merge(defaultOpt, opt);
            }
            else {
                options = defaultOpt;
            }

            if(this.chartConfig) {
                options = Highcharts.merge(options, this.chartConfig);
            }



            return options;
        },

        rendChart : function(data) {

            var v = this.showTimeType.domNode.value || this.Dduration;

            this._findExtentData(data);

            if(this.chart) {
                this.chart.destroy();
                //this.chart.series[0].setData(data);

            }

            var optMap = this.timeMap['chartRange'];

            var chart = new Highcharts.StockChart(this.buildChartOptions(data,optMap[v]));
            //hack for add mark, Not Recommended
            if(this.showMark) {
                chart.addSeries({
                    animation: {
                        duration: 1500
                    },
                    data: data[0].data,
                    name: data[0].name,
                    color:'#407dbe',
                    xAxis: 1,
                    yAxis: 1,
                    lineWidth: 3,
                    fillOpacity:0,
                    marker: {
                        enabled: true,
                    }
                });
                //chart.addSeries(data);
            };

            this.chart = chart;
            var series = this.chart.series[0];
            //series.visible && series.hide();

            this.keepRange ? this.rendSessionRange() : this.rendSelectRange();

            this.showY && this.createYaxis(data);

        },


        setOverData : function(data) {
            var chartData = data.data[this.jsonMap['key']];
            return this._createSeries(chartData);
        },

        _createSeries: function(data) {
            var data = this._formatData(data);
            return [{
                name: this.jsonMap['name'],
                data: data
            }];
        },

        _formatData: function(data) {
            var formattedData = [];

            for(var i = 0; i < data.length; i++) {
                formattedData.push([data[i].timestamp,data[i].value]);
            }

            return formattedData.sort(function(a,b) {
                if(a[0] < b[0]) return -1;
                if(a[0] > b[0]) return 1;
                return 0;
            });
        },

        rendSessionRange: function() {

            var v = this.showTimeType.domNode.value || this.Dduration;

            var sessionData = sessionStorage.get('com.timeline.'+this.sessionKey+'.'+v);

            if(!sessionData || sessionData.min < this.minTime) {

                var selectRangeObj = this.getSelectRange();

                max = selectRangeObj.max;
                min = selectRangeObj.min;

                this.keepRange && sessionStorage.set('com.timeline.'+this.sessionKey+'.'+v, sessionData = {
                    'type': v,
                    'max' : max,
                    'min': min,
                    'isLast': true
                });
            }


            if(sessionData.isLast) {
                sessionData.max = this.maxTime;
            }

            this.updateTimeRange({
                'max': sessionData.max,
                'min': sessionData.min
            });
        },

        rendSelectRange: function() {
            var selectRangeObj = this.getSelectRange();

            this.updateTimeRange({
                'max': selectRangeObj.max,
                'min': selectRangeObj.min
            });
        },

        getSelectRange: function() {

            if(this.keepLast && this.lastTimeRange && this.lastTimeRange.min >= this.minTime) {
                // not get Session store
                return this.lastTimeRange;
            }

            var v = this.showTimeType.domNode.value || this.Dduration;

            var max,min;

            max = this.maxTime;

            min = this.maxTime - this.timeMap['precision'][v] * this.rangeOptions[v][0].value;

            if(this.selectRange && this.selectRange.tag == v) {

                var range = this.selectRange['value'],
                    min,max,nNum,mNum = 0;

                if(this.selectRange && this.selectRange.tag == v ) {
                    var nNum = parseInt(this.selectRange['value'],10) || 1;
                }

                if(Array.isArray(range)) {
                    nNum = parseInt(range[0],10);
                    mNum= parseInt(range[rang.length-1],10) || 0;
                }

                min = this.maxTime - this.timeMap['precision'][v] * nNum;
                max = this.maxTime - this.timeMap['precision'][v] * mNum;
            }

            return {min:min,max:max};
        },

        _findExtentData: function(data) {

            var v = this.showTimeType.domNode.value || this.Dduration;

            this.maxTime = data[0].data[data[0].data.length-1][0];

            this.minTime = data[0].data[0][0]

            this.timeListArr = this.rangeTimeArr(this._getRangeValue(v),this.maxTime);

        },

        checkData : function(data,dataRange) {

            if(!dataRange) return data;


            //if(data[0].data.length==this.preNum) return data;

            var obj = this.makeDefaultData(dataRange,data),
                objD = this.toChartObject(data[0].data);

            data[0].data =this.toChartArray(lang.mixin(obj,objD));

            var len = data[0].data.length;

            if(data[0].data[len-1][0] > dataRange.endTime) {
                data[0].data.pop()
            }

            data[0].data.sort(function(a,b) {
                if(a['0'] < b['0']) return -1;
                if(a['0'] > b['0']) return 1;
                return 0;
            });

            return data;

        },

        toChartArray : function(obj) {
            var arr = [];

            for (var i in obj) {
                arr.push([parseInt(i),obj[i]]);
            }

            return arr;
        },

        toChartObject : function(data) {
            var obj = {};

            array.forEach(data,function(item){
                obj[item[0]] = item[1];
            });

            return obj;
        },

        makeDefaultData : function(dataRange,data) {

            var v = this.showTimeType.domNode.value || this.Dduration,
                arr = [],
                max = dataRange.endTime;

            for(var i=0;i<this.timeMap['timeCount'][v]+1;i++) {
                arr.push([max-i*this.timeMap['precision'][v],0])
            }

            return this.toChartObject(arr.reverse());
        },

        createYaxis: function(data) {

            if(!data[0].data) return;

            var name = data[0].name || 'Client';

            var max = this._getMaxYaxis(data),
                size = max;

            if(max && data[0].formatFn) {
                var usage = this.timeMap['formatterfn'][data[0].formatFn](max);

                max = usage.value+' '+usage.label;
            }

            var svg = this.$query("svg")[0],
                g = document.createElementNS("http://www.w3.org/2000/svg", "g");

            g.setAttribute('class','highcharts-axis-labels highcharts-yaxis-labels');
            g.setAttribute('zIndex',7);

            g.appendChild(this._createYText(0,270));

            max && g.appendChild(this._createYText(max,150,size));

            svg.appendChild(g);

        },

        _getMaxYaxis: function(data) {
            var data = lang.clone(data);

            if(!data[0].data) return 0;

            var Ydata = data[0].data.sort(function(a,b){
                if(a[1] < b[1]) return 1;
                if(a[1] > b[1]) return -1;
                return 0;
            });

            //return Math.ceil(Ydata[0][1]*1.5);
            return Ydata[0][1];
        },

        _createYText: function(num,y,size) {
            var disY = 270-150;

            var stext = document.createElementNS("http://www.w3.org/2000/svg", "text");

            //var maxY = size ? y*(size/parseInt(num)) : y;
            //var maxY = y;
            var maxY = size ? 270 - disY*(size/(Math.ceil(size*1.5))) : y;

            stext.setAttribute('x',36);

            stext.setAttribute('y',maxY);

            var textString = document.createTextNode(num);

            stext.appendChild(textString);

            return stext;

        },

        _formateValue: function(v) {
            if(this.formatterfn) {
                var usage = this.timeMap['formatterfn'][this.formatterfn](v);

                return usage.value+' '+usage.label;
            }
            return v;
        },

        updateTimeRange: function(event,clickable) {

            var min = this._setToTimeInt(Math.round(event.min),'left',clickable),
                max = this._setToTimeInt(Math.round(event.max),'right',clickable),
                v = this.showTimeType.domNode.value || this.Dduration;

            if(isNaN(min) || isNaN(max)) return;

            if(min == this.lastMin && max == this.lastMax) return;

            this.lastMin = min;
            this.lastMax = max;

            this.lastTimeRange = {
                min:min,
                max:max
            };

            this.keepRange && sessionStorage.set('com.timeline.'+this.sessionKey+'.'+v, {
                'type': v,
                'max': max,
                'min': min,
                'isLast': this.maxTime == max
            });

            this.chart.xAxis[0].setExtremes(
                min,
                max
            );

            var position =array.indexOf(this.timeListArr,min);

            if(!clickable && this.maxTime!=max || position<0) {
                this.rangeValue.unSelected();
            }

            if(!clickable && this.maxTime==max && position>-1) {
                this.rangeValue.oneSelected(position);
            }

            this.showTimeDetail(min,max);

            var obj = {min: min, max: max,precision:this.timeMap['precision'][v]};

            this.updateFn && this.updateFn(obj,clickable);


            this.emit('timeChange', obj);

        },

        _getUrlParam: function() {
            var str = '',
                arr = [],
                i;

            if (!this.urlParam || !Object.keys(this.urlParam).length) {
                return str;
            }

            for (i in this.urlParam) {
                arr.push(i + '=' + this.urlParam[i]);
            }
            str = '&' + arr.join('&');
            return str;
        },

        showTimeDetail: function(min,max) {
            var v = this.showTimeType.domNode.value || this.Dduration,
                str;

            switch(v) {
                case 'day':
                    if(new Date(min).getDay() === new Date(max).getDay()) {
                        str = 'day '+'<span>' + Formatter.formatTime(min, {datePattern: "EEEE (MMMM d, yyyy)", selector: "date"}) +
                            '</span> from <span>' + Formatter.formatTime(min, {timePattern: "HH:mm", selector: "time"}) +
                            '</span> to <span>' + Formatter.formatTime(max, {timePattern: "HH:mm", selector: "time"}) + '</span>';
                    }
                    else {
                        str = 'day from <span>' + Formatter.formatTime(min, {datePattern: "EEEE (MMMM d, yyyy)", selector: "date"}) +
                            ' ' + Formatter.formatTime(min, {timePattern: "HH:mm", selector: "time"}) +
                            '</span> to <span>' + Formatter.formatTime(max, {datePattern: "EEEE (MMMM d, yyyy)", selector: "date"}) +
                            ' ' + Formatter.formatTime(max, {timePattern: "HH:mm",selector: "time"}) + '</span>';
                    }

                    break;
                case 'week':
                    str = 'week of <span>' + Formatter.formatTime(min, {datePattern: "EEEE (MMMM d, yyyy)", selector: "date"}) +
                        '</span> to <span>' + Formatter.formatTime(max, {datePattern: "EEEE (MMMM d, yyyy)", selector: "date"}) + '</span>';
                    break;
            }
            this.timeDetail.innerHTML = 'Showing data for the '+str;
        },

        updateSelectedRange: function(i,value,e) {
            if(!this.chart) return

            var v = this.showTimeType.domNode.value || this.Dduration,

                max = this.maxTime,
                min = max - (this.timeMap['precision'][v] * value),

                obj = {};

            obj.min = min;
            obj.max = max;

            this.updateTimeRange(obj,true);

        },

        _getRangeValue: function(v) {

            return array.map(this.rangeOptions[v],function(item){
                return item.value || 0;
            })

        },


        localeTime : function(t) {
            return locale.format(new Date(t),{datePattern: "M/d/yy",timePattern:"a h:mm"})
        },

        rangeTimeArr : function(arr,base) {
            var v = this.showTimeType.domNode.value || this.Dduration;

            return array.map(arr,function(item){
                return base-(this.timeMap['precision'][v] * item);
            },this)
        },

        _setToTimeInt : function (d,position,clickable) {
            var v = this.showTimeType.domNode.value || this.Dduration,
                t;

            if(!!clickable) return d;

            if(!this.lastMax && !this.lastMin) return d;

            if(position=='left') {

                if(this.lastMin == d) return d;

                var p = Math.round((this.lastMax-d)/this.timeMap['precision'][v]),
                    s = Math.abs(d - this.lastMin);

                if(s>=this.timeMap['precision'][v]) {
                    t = this.lastMax - p*this.timeMap['precision'][v];
                }
                else {
                    if(d>this.lastMin) {
                        t = this.lastMin + this.timeMap['precision'][v];
                    }
                    else {
                        t = this.lastMin - this.timeMap['precision'][v];
                    }
                }



            }

            else {
                if(this.lastMax == d) return d;

                var p = Math.round((d-this.lastMin)/this.timeMap['precision'][v]),
                    s = Math.abs(d - this.lastMax);

                if(s>=this.timeMap['precision'][v]) {

                    t = this.lastMin + p*this.timeMap['precision'][v];
                }
                else {
                    if(d>this.lastMax) {
                        t = this.lastMax + this.timeMap['precision'][v];
                    }
                    else {
                        t = this.lastMax - this.timeMap['precision'][v];
                    }
                }

            }

            return t;
        }

    });
});
