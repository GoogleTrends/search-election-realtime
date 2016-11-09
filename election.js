console.time("start");

var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var stateName = {1:["Alabama","20160301","20160301","AL"],2:["Alaska","20160326","20160301","AK"],4:["Arizona","20160322","20160322","AZ"],5:["Arkansas","20160301","20160301","AR"],6:["California","20160607","20160607","CA"],8:["Colorado","20160301","20160408","CO"],9:["Connecticut","20160426","20160426","CT"],10:["Delaware","20160426","20160426","DE"],11:["District of Columbia","20160614","20160312","DC"],12:["Florida","20160315","20160315","FL"],13:["Georgia","20160301","20160301","GA"],15:["Hawaii","20160326","20160308","HI"],16:["Idaho","20160322","20160308","ID"],17:["Illinois","20160315","20160315","IL"],18:["Indiana","20160503","20160503","IN"],19:["Iowa","20160201","20160201","IA"],20:["Kansas","20160305","20160305","KS"],21:["Kentucky","20160517","20160305","KY"],22:["Louisiana","20160305","20160305","LA"],23:["Maine","20160306","20160305","ME"],24:["Maryland","20160426","20160426","MD"],25:["Massachusetts","20160301","20160301","MA"],26:["Michigan","20160308","20160308","MI"],27:["Minnesota","20160301","20160301","MN"],28:["Mississippi","20160308","20160308","MS"],29:["Missouri","20160315","20160315","MO"],30:["Montana","20160607","20160607","MT"],31:["Nebraska","20160305","20160510","NE"],32:["Nevada","20160220","20160223","NV"],33:["New Hampshire","20160209","20160209","NH"],34:["New Jersey","20160607","20160607","NJ"],35:["New Mexico","20160607","20160607","NM"],36:["New York","20160607","20160607","NY"],37:["North Carolina","20160315","20160315","NC"],38:["North Dakota","20160607","","ND"],39:["Ohio","20160315","20160315","OH"],40:["Oklahoma","20160301","20160301","OK"],41:["Oregon","20160517","20160517","OR"],42:["Pennsylvania","20160426","20160426","PA"],44:["Rhode Island","20160426","20160426","RI"],45:["South Carolina","20160220","20160220","SC"],46:["South Dakota","20160607","20161231","SD"],47:["Tennessee","20160301","20160301","TN"],48:["Texas","20160301","20160301","TX"],49:["Utah","20160322","20160322","UT"],50:["Vermont","20160301","20160301","VT"],51:["Virginia","20160301","20160301","VA"],53:["Washington","20160326","20160524","WA"],54:["West Virginia","2016510","2016510","WV"],55:["Wisconsin","20160405","20160405","WI"],56:["Wyoming","20160409","20160312","WY"]};
var width = 720,
  height = 500,
  sparkLineCount = 95,
  mobile,
  newDataLoaded = false,
  loadStarted = false,
  showPrimaryKey = false,
  smallMobile,
  centering = false,
  center,
  alpha = .6,
  allDatesSelected = false,
  sparkLines,
  defaultColor = "#cccccc"
  tickRunning = false;
  active = d3.select(null);

if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	mobile = true;
  var lineSegmentWidth = d3.select(".timeline-line-wrapper").node().offsetWidth;

  var factorNums = 0;
  function factors(num) {
      var str = "0";
      for (i = 1; i <= num; i++) {
          if (num % i == 0) {
              str += ',' + i;
              if(i>40){
                factorNums = i;
                break;
              }
          }
      }
  }
  factors(lineSegmentWidth)

  // sparkLineCount = factorNums;
  // sparkLineCount = 45;

	// if (viewportWidth < 375) { smallMobile = true; };
  d3.select(".first-sub").html("1. Select a Candidate to View His or Her Search Interest");


}

if(viewportWidth<970 && mobile != true){
  d3.select(".first-sub").html("1. Select a Candidate to View<br>His or Her <span class='sub-bolded'>Search Interest</span>");
}

if(viewportWidth<720 && mobile != true){

  d3.select(".timeline-end").text("SEP")
  d3.select(".timeline-start").text("NOV")
  // sparkLineCount = 55;
}

if(mobile){
  d3.select(".timeline-end").text("SEP")
  d3.select(".timeline-start").text("NOV")
}

var uploader = "versus";

var format = d3.format("0,000");
var parseDate = d3.time.format("%Y%m%d").parse
var weekFormat = d3.time.format("%W");
var dayFormat = d3.time.format("%w");
var labelFormat = d3.time.format("%b-%_d");

var path = d3.geo.path();

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width/2+120,height/2])
    ;

var path = d3.geo.path()
    .projection(projection);

var fill = d3.scale.log()
    .domain([0, 14000])
    .range(["brown", "steelblue"]);

var color = d3.scale.category10();

var quantize = d3.scale.threshold()
    .domain([0,1,5,10,20,2000])
    .range([0,1,2,3,4,5]);

var blueColorGen = d3.scale.linear().domain([0,1])
    .range(["hsl(62,100%,90%)", "hsl(228,30%,20%)"])
    .interpolate(d3.interpolateHcl)
    ;

var blues = [blueColorGen(0),blueColorGen(.125),blueColorGen(.25),blueColorGen(.375),blueColorGen(.5),blueColorGen(.625),blueColorGen(.75),blueColorGen(.875),blueColorGen(1)];

var reds = ["#cccccc", "#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"];
var blues = ["#cccccc","#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"];

var blueScale = d3.scale.threshold().domain([.5,1,2,2.5,3,7,10,1000])
  .range(blues);

var redScale = d3.scale.threshold().domain([.5,1,2,2.5,3,7,10,1000])
  .range(reds);

var heightScale = d3.scale.linear().domain([5,10,15,50,300]).range([2,4,5,13,52]).clamp(true);

if(mobile){
  heightScale.range([2,4,5,13,40])
}

var trumpScale = d3.scale.linear().domain([0,.51,.62,.69,.76,.83,.90,1]).range(["#cccccc","#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"]);
var clintonScale = d3.scale.linear().domain([0,.51,.62,.69,.76,.83,.90,1]).range(["#cccccc","#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]);

var primaryContainer = d3.select(".primary-container");
var timelineAnnotations = d3.select(".timeline-annotations");

var svgContainer = d3.select(".map-container").append("svg")
  .attr("class","map")
  .attr("viewBox","80 0 800 500")
  ;

var svg = svgContainer
  .append("g")
  ;

var mapContainer = d3.select(".map-container");
var toolTipContainer = mapContainer.append("div")
  .attr("class","tooltip-container")
  ;

mapContainer
  .on("mousemove",function(d){
    var mousePosition = d3.mouse(this);
    var leftPosition = mousePosition[0];
    var topPosition = mousePosition[1];
    if(!mobile){
      toolTipContainer.style("left",leftPosition - 50 +"px").style("top",topPosition + 25 +"px");
    }
  })
  ;

var toolTipGeoName = toolTipContainer.append("p")
  .attr("class","tooltip-county-name")
  ;

var toolTipViews = toolTipContainer.append("p")
  .attr("class","tooltip-county-views")
  ;

var toolTipViewsCapita = toolTipContainer.append("p")
  .attr("class","tooltip-county-cap")
  ;

var toolTipViewsClinton = toolTipContainer.append("p")
  .attr("class","tooltip-clinton-views")
  ;

var toolTipViewsTrump = toolTipContainer.append("p")
  .attr("class","tooltip-trump-views")
  ;

queue()
  .defer(d3.json, "election.json") //650KB
  .defer(d3.csv, "dates_2.csv") //2KB unique dates
  .defer(d3.csv, "county_names_3.csv") //81KB meta county info
  // .defer(d3.csv, "video_rank_7.csv") //42KB - unique video ranking info
  .defer(d3.csv, "locations.csv") // 1KB lat/long of city labels
  // .defer(d3.csv, "unique_video_titles_2.csv") //81KB video meta data
  // .defer(d3.csv, "spark_data_2.csv") //29KB spark column data - views by date
  // .defer(d3.csv, "first_load_2.csv") //29KB total views for entire date range by candidate
  .defer(d3.csv, "search_data.csv") //29KB total views for entire date range by candidate
  .await(ready);

function typeAirport(d) {
  d[0] = +d.longitude;
  d[1] = +d.latitude;
  d.arcs = {type: "MultiLineString", coordinates: []};
  return d;
}


function ready(error,
  topology,
  dates,
  countyNames,
  // countyViews,
  // videoRank,
  locations,
  // videoNames,
  // sparkData,
  // firstLoad,
  searchData
  ){

  if (error) throw error;

  console.log("loaded");

  for (var row in searchData){
    var date = "2016".concat(searchData[row].date_id);
    searchData[row].date_id = date;
  }

  var nestedFirstDataSearch = d3.nest()
    .key(function(d){
      return +d.county_code;
    })
    .sortValues(function(a,b) { return +a.date_id - +b.date_id; })
    .entries(searchData)
    ;

  var nestedFirstDataSearchMap = d3.map(nestedFirstDataSearch,function(d){
    return d.key;
  })
  ;

  // var videoNamesMap = d3.map(videoNames,function(d){
  //   return d.video_shortened_id;
  // })
  // ;

  // var videoRankNest = d3.nest()
  //   .key(function(d) { return +d.date_id; })
  //   .sortValues(function(a,b) { return b.agg_views - a.agg_views; } )
  //   .entries(videoRank)
  //   ;

  // var videoRankMap = d3.map(videoRankNest,function(d){
  //   return d.key;
  // })
  // ;

  var videoPop = d3.select(".pop-videos");

  // function buildVideos(){
  //
  //   videoPop.selectAll("div").remove();
  //
  //   var thing = videoRankMap.get(allDates[startDate+15]).values;
  //
  //   thing = thing.filter(function(d,i){
  //     if(uploader != "Trump" && uploader != "Clinton"){
  //       return i < 3;
  //     }
  //     return d.candidate == uploader;
  //   })
  //   ;
  //
  //   if(allDatesSelected){
  //     if(uploader=="Trump"){
  //       thing = [{date:"",agg_views:"2316654",candidate:"Trump",video_shortened_id:"2906"},{date:"",agg_views:"1244670",candidate:"Trump",video_shortened_id:"567"},{date:"",agg_views:"628142",candidate:"Trump",video_shortened_id:"1325"}];
  //     }
  //     else if(uploader=="Clinton"){
  //       thing = [{date:"",agg_views:"1389062",candidate:"Clinton",video_shortened_id:"1779"},{date:"",agg_views:"1291868",candidate:"Clinton",video_shortened_id:"2354"},{date:"",agg_views:"1221732",candidate:"Clinton",video_shortened_id:"892"}];
  //     }
  //     else{
  //       thing = [{date:"",agg_views:"2316654",candidate:"Trump",video_shortened_id:"2906"},{date:"",agg_views:"1389062",candidate:"Clinton",video_shortened_id:"1779"},{date:"",agg_views:"1291868",candidate:"Clinton",video_shortened_id:"2354"}];
  //     }
  //   }
  //
  //   var video = videoPop.selectAll("div")
  //     .data(thing.slice(0,3))
  //     .enter()
  //     .append("div")
  //     .attr("class","pop-video")
  //     // .style("visibility","hidden")
  //     .each(function(d){
  //       d.info = videoNamesMap.get(d.video_shortened_id);
  //     })
  //     ;
  //
  //   video.append("a")
  //     .attr("href",function(d){
  //       return "https://www.youtube.com/watch?v="+d.info.external_video_id;
  //     })
  //     .attr("target","_blank")
  //     .attr("class","pop-video-link")
  //     .append("div")
  //     .attr("class","pop-video-image")
  //     .style("background-image",function(d){
  //       return "url(https://img.youtube.com/vi/"+d.info.external_video_id+"/mqdefault.jpg)";
  //     })
  //     .append("p")
  //     .attr("class","pop-video-image-rank")
  //     .text(function(d,i){
  //       return i+1;
  //     })
  //     ;
  //
  //   var videoText = video.append("div")
  //     .attr("class","pop-video-text")
  //
  //   if(uploader != "Trump" && uploader != "Clinton"){
  //     videoText.append("p")
  //       .text(function(d){
  //         return d.candidate;
  //       })
  //       .attr("class","pop-video-candidate")
  //       .style("color",function(d,i){
  //         if(d.candidate == "Trump"){
  //           return "#890024"
  //         }
  //         return null;
  //       })
  //       ;
  //   }
  //
  //   videoText.append("a")
  //     .attr("href",function(d){
  //       return "https://www.youtube.com/watch?v="+d.info.external_video_id
  //     })
  //     .attr("target","_blank")
  //     .attr("class","pop-video-title-link")
  //     .append("p")
  //     .attr("class","pop-video-title")
  //     .text(function(d){
  //       if(d.info.title.length > 40){
  //         return d.info.title.slice(0,37)+"...";
  //       }
  //       return d.info.title;
  //     })
  //     ;
  //
  //   videoText.append("p")
  //     .text(function(d){
  //       return format(d.agg_views) + " views";
  //     })
  //     .attr("class","pop-video-count")
  //     ;
  //
  // }

  var countyNamesMap = d3.map(countyNames,function(d){
    return d.county_code;
  })
  ;

  var allDates = [];
  for (var date in dates){
    allDates.push(+dates[date].date_id);
  }



  var allDatesSearch = [
    // 20160820,
    // 20160827,
    // 20160910,
    20160917,
    20160924,
    20161001,
    20161008,
    20161015,
    20161022,
    20161029,
    20161105,
    20161108
  ];

  // var allDatesSearchMap = {20160820:0,20160827:1,20160903:2,20160910:3,20160917:4,20160924:5,20161001:6,20161008:7,20161015:8};

var allDatesSearchMap = {20160917:1,20160924:2,20161001:3,20161008:4,20161015:5,20161022:6,20161029:7,20161105:8,20161108:9};
  // function firstLoadClean(){
  //   for (var i = 0, len = firstLoad.length; i < len; i++) {
  //     var date = parseInt(firstLoad[i].date_id);
  //     firstLoad[i].date_id = 20151028;
  //     var candidate = "Clinton"
  //     if(firstLoad[i].uploader != 1){
  //       candidate = "Trump";
  //     }
  //     firstLoad[i].uploader = candidate;
  //   }
  //
  //   var nestedFirstData = d3.nest()
  //     .key(function(d) {
  //       return d.uploader;
  //     })
  //     .key(function(d) { return +d.county_code; })
  //     .sortValues(function(a,b) { return +a.date_id - +b.date_id; })
  //     .entries(firstLoad)
  //     ;
  //
  //   for (var candidateItem in nestedFirstData){
  //     var candidateName = nestedFirstData[candidateItem].key;
  //
  //     for (var market in nestedFirstData[candidateItem].values){
  //       var datesWithData = [];
  //       var marketIdLoop = nestedFirstData[candidateItem].values[market].key;
  //       var dateLength = nestedFirstData[candidateItem].values[market].values;
  //
  //       for (var date in nestedFirstData[candidateItem].values[market].values){
  //         var dateId = +nestedFirstData[candidateItem].values[market].values[date].date_id;
  //         datesWithData.push(dateId)
  //       }
  //
  //       var missingDates = allDates.filter(function(i) {
  //         return datesWithData.indexOf(i) < 0;
  //       });
  //
  //       for (var i = 0; i < missingDates.length; i++) {
  //         var missingDate = missingDates[i];
  //         nestedFirstData[candidateItem].values[market].values.push({"date_id":missingDate,"views":0})
  //       }
  //       nestedFirstData[candidateItem].values[market].values = nestedFirstData[candidateItem].values[market].values.sort(function(a, b){
  //         return +a.date_id - +b.date_id
  //       })
  //       ;
  //     }
  //   }
  //
  //   return nestedFirstData;
  // }

  // function secondLoadClean(){
  //
  //   d3.csv("views_county_5.csv", function(countyViews) {
  //
  //     for (var i = 0, len = countyViews.length; i < len; i++) {
  //       var date = parseInt(countyViews[i].date_id);
  //       if(date < 1000){
  //         countyViews[i].date_id = date+20160000;
  //       }
  //       else{
  //         countyViews[i].date_id = date+20150000;
  //       }
  //       var candidate = "Clinton"
  //       if(countyViews[i].uploader != 1){
  //         candidate = "Trump";
  //       }
  //       countyViews[i].uploader = candidate;
  //     }
  //
  //     var nestedCountyData = d3.nest()
  //       .key(function(d) {
  //         return d.uploader;
  //       })
  //       .key(function(d) { return +d.county_code; })
  //       .sortValues(function(a,b) { return +a.date_id - +b.date_id; })
  //       .entries(countyViews)
  //       ;
  //
  //     for (var candidateItem in nestedCountyData){
  //       var candidateName = nestedCountyData[candidateItem].key;
  //
  //       for (var market in nestedCountyData[candidateItem].values){
  //         var datesWithData = [];
  //         var marketIdLoop = nestedCountyData[candidateItem].values[market].key;
  //         var dateLength = nestedCountyData[candidateItem].values[market].values;
  //
  //         for (var date in nestedCountyData[candidateItem].values[market].values){
  //           var dateId = +nestedCountyData[candidateItem].values[market].values[date].date_id;
  //           datesWithData.push(dateId)
  //         }
  //
  //         var missingDates = allDates.filter(function(i) {
  //           return datesWithData.indexOf(i) < 0;
  //         });
  //
  //         for (var i = 0; i < missingDates.length; i++) {
  //           var missingDate = missingDates[i];
  //           nestedCountyData[candidateItem].values[market].values.push({"date_id":missingDate,"views":0})
  //         }
  //         nestedCountyData[candidateItem].values[market].values = nestedCountyData[candidateItem].values[market].values.sort(function(a, b){
  //           return +a.date_id - +b.date_id
  //         })
  //         ;
  //       }
  //     }
  //     candidateMapCounty = d3.map(nestedCountyData,function(d){
  //       return d.key
  //     })
  //     ;
  //     // getData();
  //     newDataLoaded = true;
  //     pathColor();
  //     // buildVideos();
  //     if(uploader=="Clinton"||uploader=="Trump"){
  //       if(!mobile){
  //         // primaryHighlight();
  //       }
  //     }
  //     d3.select(".loading-screen").style("display","none");
  //     if(tickRunning){
  //       allDatesSelected = false;
  //       d3.select(".timeline-button").text("❚❚").style("line-height","11px");
  //       if(endDate == allDatesSearch.length-1){
  //         startDate = 0;
  //         endDate = startDate + offSet;
  //       }
  //       tick();
  //     }
  //   });
  // }

  var nestedStates = d3.nest()
    .key(function(d) { return +d.state_id; })
    .rollup(function(leaves){
      return {"population":d3.sum(leaves,function(d){return d.pop_count}),"values":leaves}
    })
    .entries(countyNames)
    ;

  var nestedStatesMap = d3.map(nestedStates,function(d){
    return +d.key;
  })
  ;

  var nestedCounties = d3.nest()
    .key(function(d) { return d.county_code; })
    .entries(countyNames)
    ;

  var nestedCountiesMap = d3.map(nestedCounties,function(d){
    return +d.key;
  })
  ;

  var countyLocations = topojson.feature(topology, topology.objects.counties).features;

  var pathsCounty = svg.append("g").selectAll("path")
    .data(countyLocations)
    .enter()
    .append("path")
    .attr("class","path-county")
    .attr("d", function(d) { return path(d); })
    .style("fill","#F7F7F7")
    ;

  var weekScale = d3.scale.quantize().domain([parseDate("20151028"),parseDate("20160828")]).range(d3.range(sparkLineCount));

  var weekScaleSearch = d3.scale.quantize().domain([allDatesSearch[0],allDatesSearch[1],allDatesSearch[2],allDatesSearch[3],allDatesSearch[4],allDatesSearch[5],allDatesSearch[6],allDatesSearch[7],allDatesSearch[8]]).range(d3.range(allDatesSearch.length));


  var dailyViewsSearch = d3.nest()
    .key(function(d){
      return allDatesSearchMap[+d.date_id]
    })
    .rollup(function(leaves) {

      var clinton = d3.sum(leaves, function(d) {
        var countyPopulation = countyNamesMap.get(d.county_code).pop_count;
        var contribution = countyPopulation/320424787;
        var searches = d["Clinton"]*contribution;
        return +searches;
      });

      var trump = d3.sum(leaves, function(d) {
        var countyPopulation = countyNamesMap.get(d.county_code).pop_count;
        var contribution = countyPopulation/320424787;
        var searches = d["Trump"]*contribution;
        return +searches;
      });
      return {clinton,trump};
    })
    .entries(searchData)
    ;

  //alternativeSpark
  // var dailyViews = d3.nest()
  //   .key(function(d){
  //     var date = parseDate(d.date_id);
  //     return +weekScale(date);
  //   })
  //   .key(function(d){
  //     return d.candidate;
  //   })
  //   .sortKeys(d3.ascending)
  //   .rollup(function(leaves) {
  //     return d3.sum(leaves, function(d) {return +d.views});
  //   })
  //   .entries(sparkData)
  //   ;

  // nestedCountyData = firstLoadClean();

  // var candidateMapCounty = d3.map(nestedCountyData,function(d){
  //   return d.key
  // })
  // ;

  var viewMap;
  var viewMapCounty;
  var clintonData;
  var trumpData;
  var clintonCountyData;
  var trumpCountyData;

  // function getData(){
  //   if(uploader=="Trump" || uploader=="Clinton"){
  //     // var selectedCandidate = candidateMap.get(uploader);
  //     var selectedCountyCandidate = candidateMapCounty.get(uploader);
  //
  //     viewMapCounty = d3.map(selectedCountyCandidate.values,function(d){
  //       return +d.key;
  //     })
  //   }
  //   ;
  //
  //   clintonCountyData = d3.map(candidateMapCounty.get("Clinton").values,function(d){
  //     return +d.key;
  //   });
  //
  //   trumpCountyData = d3.map(candidateMapCounty.get("Trump").values,function(d){
  //     return +d.key;
  //   });
  // }
  //
  // getData();

  for (var countyItem in countyLocations){
    var data = nestedCountiesMap.get(countyLocations[countyItem].id);
    if(data != null){
      data = data.values[0].pop_count;
      countyLocations[countyItem].population = data;
    }
  }

  var startDate = allDatesSearch.length-1;
  var offSet = 1;
  var endDate = allDatesSearch.length-1;
  var shiftDuration = 5000;
  var duration = 100;
  var delay = 1000;

  pathsCounty
    .data(countyLocations)
    .enter()
    .append("path")
    .attr("class","path-county")
    .attr("d", function(d) { return path(d); })
    ;

  pathColor();

  function tick() {
    startDate = startDate+1;
    endDate = startDate;
    var startString = JSON.stringify(allDatesSearch[startDate]).substring(4);
    // var endString = JSON.stringify(allDatesSearch[endDate]).substring(4);

    d3.selectAll(".spark-item-versus-item-week-text").style("font-weight",function(d,i){
      if(i==startDate){
        return 600;
      }
      return null;
    });

    if(startDate==8){
      startTitleDate.text("11/06 - 11/08");
    }
    else{
      startTitleDate.text("week of "+startString.slice(0,2)+"/"+startString.substring(2));
    }

    d3.select(".range-dash").text("")
    endTitleDate.text("");

    // gBrush
    //     .call(brush.extent([startDate, endDate]));

    pathColor();
    // buildVideos();
    if(uploader=="Clinton"||uploader=="Trump"){
      // primaryHighlight();
      sparkLines.style("background-color",function(d,i){
        if(!allDatesSelected && +startDate== +d.key){
          if(uploader=="Clinton"){
            return blueScale(d.values.clinton);
          }
          return redScale(d.values.trump);
        }
        return null;
      }).select("p").style("font-weight",function(d){
        if(!allDatesSelected && +startDate== +d.key){
          return 600
        }
        return null;
      })
      ;

    }


    if(endDate <= allDatesSearch.length-2 && tickRunning){
      setTimeout(tick, delay);
    }
    else if(tickRunning){
      startDate = -1;
      setTimeout(tick, delay);
    }

    // else{
    //   tickRunning = false;
    //   d3.select(".timeline-button").text("►").style("line-height",null);
    // }

  };

  var statesData = topojson.feature(topology, topology.objects.states).features;

  var pathsCountyVornoi = svg.append("g").attr("class","county-voronoi")
    .selectAll("path")
    .data(countyLocations)
    .enter()
    .append("path")
    .attr("class","path-county-voronoi")
    .attr("d", function(d) { return path(d); })
    .on("click",function(){
      if(!mobile){
        reset();
      }
    })
    .on("mouseover",function(d){

      toolTipContainer.classed("visible",true);

      var population = +d.population;
      var countyId = d.id;

      toolTipGeoName.text(countyNamesMap.get(countyId).county_name+" County");

      var clintonTotalViews = 0;
      var trumpTotalViews = 0;

      // if(clintonCountyData.has(+countyId)){
      //   var marketData = clintonCountyData.get(+countyId).values;
      //   marketData = marketData.slice(startDate,endDate);
      //   clintonTotalViews = d3.sum(marketData,function(d){return d.views});
      // }
      //
      // if(trumpCountyData.has(+countyId)){
      //   var marketData = trumpCountyData.get(+countyId).values;
      //   marketData = marketData.slice(startDate,endDate);
      //   trumpTotalViews = d3.sum(marketData,function(d){return d.views});
      // }

      if(nestedFirstDataSearchMap.has(+countyId)){
        var marketData = nestedFirstDataSearchMap.get(+countyId).values;
        marketData = marketData.slice(startDate,endDate+1);
        clintonTotalViews = Math.round(d3.mean(marketData,function(d){return d["Clinton"]})*100)/100;
        trumpTotalViews = Math.round(d3.mean(marketData,function(d){return d["Trump"]})*100)/100;
      }

      var sumViews = 0;
      if(uploader == "Trump"){
        toolTipViewsTrump.style("display","none");
        toolTipViewsClinton.style("display","none");
        sumViews = trumpTotalViews;

        toolTipViews
          .text(function(){
            if(+countyId == 36005 || +countyId == 36081 || +countyId == 36085 || +countyId == 36047){
              return "See New York City";
            }
            if(sumViews == 0){
              return "Not Enough Data";
            }
            return format(sumViews);
          })
          .style("display","block");
        var viewsPerCapita = sumViews;
        // toolTipViewsCapita.text(function(){
        //   if(sumViews == 0){
        //     return "";
        //   }
        //   return (Math.round(viewsPerCapita*100))/100;
        // }).style("display","block");
      }
      else if(uploader == "Clinton"){
        toolTipViewsTrump.style("display","none");
        toolTipViewsClinton.style("display","none");
        sumViews = clintonTotalViews;
        toolTipViews
          .text(function(){
            if(+countyId == 36005 || +countyId == 36081 || +countyId == 36085 || +countyId == 36047){
              return "See New York City";
            }
            if(sumViews == 0){
              return "Not Enough Data";
            }
            return format(sumViews);
          })
          .style("display","block");
        var viewsPerCapita = sumViews/(population/10000);
        // toolTipViewsCapita.text(function(){
        //   if(sumViews == 0){
        //     return "";
        //   }
        //   return (Math.round(viewsPerCapita*100))/100 + " views per 10,000 people"
        // }).style("display","block");

      }
      else{
        toolTipViews.style("display","none");
        toolTipViewsCapita.style("display","none");

        toolTipViewsTrump
          .text(function(){
            if(+countyId == 36005 || +countyId == 36081 || +countyId == 36085 || +countyId == 36047){
              return "See New York City";
            }
            if(trumpTotalViews == 0){
              return "Trump: Not Enough Data";
            }
            return "Trump: "+ format(trumpTotalViews);
          })
          .style("display","block")
          .style("font-weight",function(d){
            if (trumpTotalViews>clintonTotalViews){
              return 600;
            }
            return null;
          })
          .style("color",function(d){
            if (trumpTotalViews>clintonTotalViews){
              return "rgb(137, 0, 36)";
            }
            return null;
          })
          ;

        toolTipViewsClinton
          .text(function(){
            if(+countyId == 36005 || +countyId == 36081 || +countyId == 36085 || +countyId == 36047){
              return "";
            }
            if(clintonTotalViews == 0){
              return "Clinton: Not Enough Data";
            }
            return "Clinton: "+ format(clintonTotalViews);
          })
          .style("display","block")
          .style("font-weight",function(d){
            if (trumpTotalViews<clintonTotalViews){
              return 600;
            }
            return null;
          })
          .style("color",function(d){
            if (trumpTotalViews<clintonTotalViews){
              return "rgb(25, 84, 115)";
            }
            return null;
          })
          ;

      }



    })
    .on("mouseout",function(d){
      toolTipContainer.classed("visible",false);
    })
    ;

  var pathsState = svg.append("g")
    .selectAll("path")
    .data(topojson.feature(topology, topology.objects.states).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class","state-path")
    ;

  var pathsVoronoi = svg.append("g").attr("class","state-voronoi")
    .selectAll("path")
    .data(statesData)
    .enter()
    .append("path")
    .attr("class","path-voronoi")
    .attr("d", function(d) { return path(d); })
    .on("mouseover",function(d){

      toolTipContainer.classed("visible",true);

      var data = nestedStatesMap.get(d.id).values;
      var population = data.population;
      var counties = data.values

      toolTipGeoName.text(stateName[d.id][0]);

      var sumViews = 0;

      if(uploader == "Clinton" || uploader == "Trump"){
        for (var county in counties){

          if(nestedFirstDataSearchMap.has(+counties[county].county_code)){
            var marketData = nestedFirstDataSearchMap.get(counties[county].county_code).values;
            marketData = marketData.slice(startDate,endDate+1);
            var meanCountyViews  = d3.mean(marketData,function(d){return d[uploader]});
            var countyPopulation = 0;
            if(countyNamesMap.has(+counties[county].county_code)){
              countyPopulation = countyNamesMap.get(+counties[county].county_code).pop_count;
              if(countyPopulation=="NULL"){
                countyPopulation = 0;
              }
            }
            adjustedCounty = meanCountyViews*(+countyPopulation)/population;
            sumViews = adjustedCounty + sumViews;
          }

          // if(viewMapCounty.has(counties[county].county_code)){
          //   var marketData = viewMapCounty.get(counties[county].county_code).values;
          //   marketData = marketData.slice(startDate,endDate);
          //   var totalViews = d3.sum(marketData,function(d){return d.views});
          //   sumViews = sumViews + totalViews;
          // }
        }
        toolTipViewsTrump.style("display","none");
        toolTipViewsClinton.style("display","none");

        toolTipViews.text(Math.round(sumViews*100)/100).style("display","block");
        var viewsPerCapita = sumViews;
        // toolTipViewsCapita.text((Math.round(viewsPerCapita*100))/100).style("display","block");
      }
      else{

        var clintonTotalViews = 0
        var trumpTotalViews = 0

        for (var county in counties){


          if(nestedFirstDataSearchMap.has(+counties[county].county_code)){
            var marketData = nestedFirstDataSearchMap.get(counties[county].county_code).values;
            marketData = marketData.slice(startDate,endDate+1);
            var meanCountyViews  = d3.mean(marketData,function(d){return d["Clinton"]});
            var countyPopulation = 0;
            if(countyNamesMap.has(+counties[county].county_code)){
              countyPopulation = countyNamesMap.get(+counties[county].county_code).pop_count;
              if(countyPopulation=="NULL"){
                countyPopulation = 0;
              }
            }
            var adjustedCounty = meanCountyViews*(+countyPopulation)/population;
            clintonTotalViews = adjustedCounty + clintonTotalViews;
          }

          if(nestedFirstDataSearchMap.has(+counties[county].county_code)){
            var marketData = nestedFirstDataSearchMap.get(counties[county].county_code).values;
            marketData = marketData.slice(startDate,endDate+1);
            var meanCountyViews  = d3.mean(marketData,function(d){return d["Trump"]});
            var countyPopulation = 0;
            if(countyNamesMap.has(+counties[county].county_code)){
              countyPopulation = countyNamesMap.get(+counties[county].county_code).pop_count;
              if(countyPopulation=="NULL"){
                countyPopulation = 0;
              }
            }
            var adjustedCounty = meanCountyViews*(+countyPopulation)/population;
            trumpTotalViews = adjustedCounty + trumpTotalViews;
          }


          // if(clintonCountyData.has(counties[county].county_code)){
          //   var marketData = clintonCountyData.get(counties[county].county_code).values;
          //   marketData = marketData.slice(startDate,endDate);
          //   var totalViews = d3.sum(marketData,function(d){return d.views});
          //   clintonTotalViews = clintonTotalViews + totalViews;
          // }
          //
          // if(trumpCountyData.has(counties[county].county_code)){
          //   var marketData = trumpCountyData.get(counties[county].county_code).values;
          //   marketData = marketData.slice(startDate,endDate);
          //   var totalViews = d3.sum(marketData,function(d){return d.views});
          //   trumpTotalViews = trumpTotalViews + totalViews;
          // }

        }

        toolTipViews.style("display","none");
        toolTipViewsCapita.style("display","none");
        toolTipViewsTrump
          .text("Trump: "+ Math.round(trumpTotalViews*100)/100)
          .style("display","block")
          .style("font-weight",function(d){
            if (trumpTotalViews>clintonTotalViews){
              return 600;
            }
            return null;
          })
          .style("color",function(d){
            if (trumpTotalViews>clintonTotalViews){
              return "rgb(137, 0, 36)";
            }
            return null;
          })
          ;

        toolTipViewsClinton
          .text("Clinton: "+ Math.round(clintonTotalViews*100)/100)
          .style("display","block")
          .style("font-weight",function(d){
            if (trumpTotalViews<clintonTotalViews){
              return 600;
            }
            return null;
          })
          .style("color",function(d){
            if (trumpTotalViews<clintonTotalViews){
              return "rgb(25, 84, 115)";
            }
            return null;
          })
          ;


      }

    })
    .on("mouseout",function(d){
      toolTipContainer.classed("visible",false);
    })
    .on("click",function(d){
      // if(!mobile){
        zooming(d,this);
      // }
    })
    // .on("touchstart",function(d){
    //   if(mobile){
    //     zooming(d,this);
    //   }
    // })
    ;

  var cityMarkers = svg.append("g")
    .attr("class","map-markers hidden")
    .selectAll("circle")
    .data(locations)
    .enter()
    .append("circle")
    // .datum({type: "MultiPoint", coordinates: locations})
    .attr("class","map-marker")

    .attr("r",1)
    .attr("transform",function(d){
      return "translate("+projection([+d.long,+d.lat])+")";
    })
    ;

  var cityText = svg.append("g")
    .attr("class","map-markers-text hidden")
    .selectAll("text")
    .data(locations)
    .enter()
    .append("text")
    .style("font-size",function(d){
      if(d.city=="Los Angeles"||d.city=="San Francisco"||d.city=="San Diego"||d.city=="San Jose"||d.city=="Las Vegas"||d.city=="Dallas"||d.city=="Austin"||d.city=="Houston"||d.city=="San Antonio"){
        return "4.5px"
      }
      return null;
    })
    .attr("class","map-marker-text")
    .attr("transform",function(d){
      var coor = projection([+d.long,+d.lat]);
      // console.log(d.city,coor);
      coor[1] = coor[1]+1.03;
      coor[0] = coor[0]+1.6;
      return "translate("+coor[0]+","+coor[1]+")";
    })
    .text(function(d){
      return d.city;
    })
    ;

  var centered;

  function reset(){
    d3.select(".mobile-zoom-out").style("display",null);
    if(uploader=="Trump"||uploader=="Clinton"){
      if(!allDatesSelected){
        primaryContainer.style("visibility","visible");
      }
    }
    d3.select(".map-markers").classed("hidden",true);
    d3.select(".map-markers-text").classed("hidden",true);
    pathsVoronoi.style("pointer-events","all");
    // active.classed("active", false);
    if(active.classed("primary-highlighted")){
      active.style("stroke-width",1.5);
    }
    else{
      active.style("stroke-width",null);
    }

    active = d3.select(null);

    svg.transition()
      .duration(750)
      .attr("transform","translate(0,0) scale(1)")
      ;

  }

  function zooming(d,node) {
    d3.select(".mobile-zoom-out").style("display","block");
    primaryContainer.style("visibility","hidden");
    d3.select(node).style("stroke-width","2");
    pathsVoronoi.style("pointer-events","none");
    d3.select(".map-markers").classed("hidden",false);
    d3.select(".map-markers-text").classed("hidden",false);
    // if (active.node() === node) return reset();
    // active.classed("active", false);
    active = d3.select(node).classed("active", true);

    var bounds = path.bounds(d);
    var dx = bounds[1][0] - bounds[0][0];
    var dy = bounds[1][1] - bounds[0][1];
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;

    var scale = .9 / Math.max(dx / width, dy / height);
    scale = Math.min(5,scale);
    var translate = [width / 2 - scale * x, height / 2 - scale * y];

    // svg.transition()
    //     .duration(750)
    //     .style("stroke-width", 1.5 / scale + "px")
    //     .call(zoom.translate(translate).scale(scale).event);

    svg.transition()
      .duration(750)
      .style("stroke-width", 1.5 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  }

  var dragTimeout;

  function createLegend(){
    var legend = d3.select(".legend-container");
    legend.selectAll("div,p").remove();

    if(uploader != "Trump" && uploader != "Clinton"){


      var legendContainerVersus = legend
        .append("div")
        .attr("class","versus-legend-container");

      legendContainerVersus.append("p")
        .attr("class","versus-legend-label versus-legend-label-first")
        .text("Mostly Trump")
        ;

      legendContainerVersus
        .selectAll("div")
        .data(["Trump"])
        .enter()
        .append("div")
        .attr("class","versus-row")
        .selectAll("div")
        .data(["stats"])
        .enter()
        .append("div")
        .attr("class",function(d,i){
          return "versus-stats"
        })
        .selectAll("div")

        // [.5,1,2,3,4,5,6,1000]


        .data([redScale(10),redScale(5),redScale(3),redScale(1),"#e2e1e1",blueScale(1),blueScale(3),blueScale(5),blueScale(10)])
        .enter()
        .append("div")
        .attr("class","versus-color-block")
        .style("background-color",function(d,i){
          return d;
        })
        .each(function(d,i){
          var count = i;
          var percents = [100,85,75,55,"Even",55,75,85,100]
          d3.select(this)
            .append("p")
            .attr("class","versus-block-label")
            .text(function(d,i){
              if(count!=4){
                return percents[count]+"%";
              }
              return "Even";
            });
        })
        ;

      legendContainerVersus.append("p")
        .attr("class","versus-legend-label")
        .text("Mostly Clinton")
        ;

    }
    else {

      legend = legend.append("div").attr("class","legend-normal");

      legend.append("p")
        .attr("class","legend-title")
        // .text(uploader);
        .text("Views per 10,000 people");

      legend.append("p")
        .attr("class","legend-label legend-label-front")
        .text("Min Search Interest");

      legend
        .append("div")
        .attr("class","legend-colors")
        .selectAll("div")
        .data(function(){
          if (uploader == "Trump"){
            return [redScale(0),redScale(1),redScale(3),redScale(5),redScale(10)];
          }
          else {
            return [blueScale(0),blueScale(1),blueScale(3),blueScale(5),blueScale(10)];
          }
        })
        .enter()
        .append("div")
        .attr("class","legend-color")
        .style("background-color",function(d){
          return d;
        })
        ;

      legend.append("p")
        .attr("class","legend-label")
        .text(function(){
          if (uploader == "Trump"){
            return "Max Search Interest"
          }
          else {
            return "Max Search Interest"
          }
        });
    }

  }

  var startTitleDate = d3.select(".start-date");
  var endTitleDate = d3.select(".end-date");

  var lineSegmentWidth = d3.select(".timeline-line-wrapper").node().offsetWidth;
  var sparkToolTip = d3.select(".spark-tool-tip");

  function buildSpark(){

    d3.select(".view-spark").selectAll("div").remove();

    if(uploader!="Trump" && uploader!="Clinton"){

      function thing(week){
        brushmove(week);
      }

      sparkLines = d3.select(".view-spark")
        .selectAll("div")
        .data(dailyViewsSearch)
        .enter()
        .append("div")
        .attr("class","spark-item-versus")
        .style("visibility","hidden")
        .on("click",function(d){
          allDatesSelected = false;
          d3.selectAll(".spark-item-versus-item-week-text").style("font-weight",null);
          d3.select(this).select("p").style("font-weight",600);
          thing(d3.select(this).datum().key);
        })
        ;

      var sparkLinesColumnElements = sparkLines.selectAll("div")
        .data(function(d){
          var clinton = d.values.clinton;
          var trump = d.values.trump;
          var total = clinton+trump;
          return [clinton/total,trump/total];
        })
        .enter()
        .append("div")
        .attr("class","spark-item-versus-item")
        .style("top",function(d,i){
          if(i==0){
            return "-6px";
          }
          return "24px";
        })
        .style("margin-top",function(d,i){
          if(i==0){
            return 17-(d*17)+"px";
          }
        })
        .style("height",function(d){
          return d*17+"px";
        })
        .style("background",function(d,i){

          if(i==0){
            if(d>.5){
              return clintonScale(d)
            }
          }
          if(d>.5){
            return trumpScale(d);
          }
          return "#cccccc"
        })
        .on("mouseover",function(d,i){

          var parentData = d3.select(this.parentNode).datum();
          sparkToolTip.style("left",parentData.key*30 - 20 +"px")
          .style("bottom",function(){
            if(i==1){
              return 40+"px"
            }
            return d*30+27+"px"
          })
          .style("visibility","visible")
          .select("p")
          .html(function(){
            if(i==0){
              if(d>.5){
                return "<span style='color:#195473; font-weight:900;'>Clinton</span> has " + Math.round(d*100) + "% of Views";
              }
              else{
                return "<span style='color:rgb(137, 0, 36); font-weight:900;'>Trump</span> has " + Math.round((1-d)*100) + "% of Views";
              }
            }
            else{
              if(d>.5){
                return "<span style='color:rgb(137, 0, 36); font-weight:900;'>Trump</span> has " + Math.round(d*100) + "% of Views";
              }
              else{
                return "<span style='color:#195473; font-weight:900;'>Clinton</span> has " + Math.round((1-d)*100) + "% of Views";
              }
            }

          })
          ;
        })
        .on("mouseout",function(d,i){
          sparkToolTip.style("visibility","hidden")
        })
        .on("click",function(d){
        })
        ;

      sparkLines.append("div")
        .attr("class","spark-item-versus-item-week")
        .append("p")
        .attr("class","spark-item-versus-item-week-text")
        .style("font-weight",function(d,i){
          if(i==startDate){
            return 600;
          }
        })
        .text(function(d){
          var labelFormat = d3.time.format("%-m/%-d");
          return labelFormat(parseDate(JSON.stringify(allDatesSearch[d.key-1])));
        })
        ;

      d3.selectAll(".spark-item-versus")
        .transition()
        .duration(100)
        .delay(function(d,i){
          return 10*i;
        })
        .style("visibility","visible")
        ;
    }
    else{

      function thing(week){
        brushmove(week);
      }

      sparkLines = d3.select(".view-spark")
        .selectAll("div")
        .data(dailyViewsSearch)
        .enter()
        .append("div")
        .attr("class","spark-item")
        .style("height",function(d){
          if(uploader=="Clinton"){
            return heightScale(15*d.values.clinton) + "px";
          }
          return heightScale(15*d.values.trump) + "px";
        })
        .style("visibility","hidden")
        .on("mouseover",function(d,i){
          d3.select(this).style("background-color","black");

          sparkToolTip.style("left",d.key*30 - 20 +"px").style("bottom",function(){
            if(uploader=="Clinton"){
              return 26 + heightScale(15*d.values.clinton) + "px";
            }
            return 26 + heightScale(15*d.values.trump) + "px";
          })
          .style("visibility","visible")
          ;

          sparkToolTip.select("p").text(function(){
            if(uploader=="Clinton"){
              return format(Math.round(d.values.clinton*1000)/1000)
            }
            return format(Math.round(d.values.trump*1000)/1000)
          });

        })
        .on("mouseout",function(d,i){
          sparkToolTip.style("visibility","hidden")
          d3.select(this).style("background-color",function(d,i){
            if(!allDatesSelected && +startDate== +d.key){
              if(uploader=="Clinton"){
                return blueScale(d.values.clinton);
              }
              return redScale(d.values.trump);
            }
            return null;
          });
        })
        .on("click",function(d){
          allDatesSelected  = false;
          sparkLines.style("background",null).select("p").style("font-weight",null);

          d3.select(this).style("background-color",function(d,i){
            if(!allDatesSelected){
              if(uploader=="Clinton"){
                return blueScale(d.values.clinton);
              }
              return redScale(d.values.trump);
            }
            return null;
          }).select("p").style("font-weight",600);
          thing(d.key);
        })
        ;

      sparkLines.append("div")
        .attr("class","spark-item-single-item-week")
        .append("p")
        .attr("class","spark-item-versus-item-week-text")
        .style("font-weight",function(d,i){
          if(i==startDate){
            return 600;
          }
          return null;
        })
        .text(function(d){
          var labelFormat = d3.time.format("%-m/%-d");
          return labelFormat(parseDate(JSON.stringify(allDatesSearch[d.key-1])));
        })
        ;

      sparkLines
        .transition()
        .duration(100)
        .delay(function(d,i){
          return 10*i;
        })
        .style("visibility","visible")
        ;

    }


  }

  buildSpark();

  // var x = d3.scale.linear()
  //     .domain([0,allDates.length-1])
  //     .range([0, lineSegmentWidth]);
  //
  // var brush = d3.svg.brush()
  //     .x(x)
  //     .extent([0, 30])
  //     .on("brush", brushmove);
  //
  // var gBrush = d3.select(".brush-svg")
  //   .attr("width",lineSegmentWidth+4)
  //   .append("g")
  //   .attr("width",lineSegmentWidth)
  //   .attr("transform","translate(2,0)")
  //   .attr("class", "brush")
  //   .call(brush)
  //   ;

  // gBrush.selectAll(".resize")
  //   .style("pointer-events","none")
  //   ;
  //
  // gBrush.select(".extent")
  //   .attr("rx",1)
  //   .attr("height",9)
  //   .attr("transform","translate(0,2)")
  //   .on("mousedown",function(){
  //     allDatesSelected = false;
  //     loadSequence();
  //   })
  //   .on("touchstart",function(){
  //     allDatesSelected = false;
  //     loadSequence();
  //   })
  //   ;
  //
  // gBrush.select(".background")
  //     .attr("height",40)
  //     // .style("cursor","hand")
  //     // .style("cursor","pointer")
  //     .on("mousedown.brush", function(){
  //       allDatesSelected = false;
  //       loadSequence();
  //       brushcenter();
  //     })
  //     .on("touchstart.brush", function(){
  //       allDatesSelected = false;
  //       brushcenter()
  //     })
  //     ;
  //
  // gBrush.call(function(){
  //   brush.event;
  // });

  function brushmove(week){

    clearTimeout(dragTimeout);
    dragTimeout = setTimeout(function(){
      pathColor();
      // buildVideos();
    }, 75);
    startDate = Math.round(week-1);
    endDate = Math.round(week-1);

    var startString = JSON.stringify(allDatesSearch[startDate]).substring(4);
    var endString = JSON.stringify(allDatesSearch[endDate]).substring(4);

    if(startDate==8){
      startTitleDate.text("11/06 - 11/08");
    }
    else{
      startTitleDate.text("week of "+startString.slice(0,2)+"/"+startString.substring(2));
    }

    d3.selectAll(".range-dash").text("");
    endTitleDate.text("");

      // if(uploader=="Clinton"||uploader=="Trump"){
      //   sparkLines.style("background-color",function(d){
      //     var startWeek = +weekScale(parseDate(JSON.stringify(allDatesSearch[startDate])));
      //     var endWeek = +weekScale(parseDate(JSON.stringify(allDatesSearch[endDate])));
      //     if(+d.key >= startWeek && +d.key <= endWeek){
      //       if(uploader=="Clinton"){
      //         return blueScale(13*d.values[0].values/(321418820/10000));
      //       }
      //       return redScale(13*d.values[1].values/(321418820/10000));
      //     }
      //     return null;
      //   });
      // }
  }

  function brushcenter() {
    if(tickRunning){
      tickRunning = false;
      d3.select(".timeline-button-annotation").text("PLAY").style("left",null);
      d3.select(".timeline-button").text("►").style("line-height",null);
    }

    var self = d3.select(window),
        target = d3.event.target,
        extent = brush.extent(),
        size = extent[1] - extent[0],
        domain = x.domain(),
        x0 = domain[0] + size / 2,
        x1 = domain[1] - size / 2;

    recenter(true);
    brushmove();

    if (d3.event.changedTouches) {
      self.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
    } else {
      self.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
    }

    function brushmove() {
      d3.event.stopPropagation();
      center = Math.max(x0, Math.min(x1, x.invert(d3.mouse(target)[0])));
      recenter(false);
    }

    function brushend() {
      brushmove();
      self.on(".brush", null);
    }
  }

  function recenter(smooth) {

    if (centering) return; // timer is active and already tweening
    if (!smooth) return void tween(1); // instantaneous jump
    centering = true;

    function tween(alpha) {
      var extent = brush.extent(),
          size = extent[1] - extent[0],
          center1 = center * alpha + (extent[0] + extent[1]) / 2 * (1 - alpha);

      gBrush
          .call(brush.extent([center1 - size / 2, center1 + size / 2]))
          .call(brush.event);

      return !(centering = Math.abs(center1 - center) > 1e-3);
    }

    d3.timer(function() {
      return tween(alpha);
    });
  }

  function playTriggers(){
    d3.select(".timeline-button").on("click",function(){
      if(!tickRunning){
        tickRunning = true;

        d3.select(".timeline-button-annotation").text("PAUSE").style("left",function(){
          if(mobile){
            return "-41px";
          }
          if(viewportWidth<980){
            return "-46px"
          }
          return "-46px";
        });

        d3.select(this).text("❚❚").style("line-height",function(){
          if(mobile){
            return "19px";
          }
          return "11px";
        });

        if(endDate == allDatesSearch.length-1){
          startDate = 0;
          endDate = startDate + offSet;
        }
        allDatesSelected = false;
        tick();
      }
      else{
        tickRunning = false;
        d3.select(this).text("►").style("line-height",null);
      }
    })
    ;
    // var startString = JSON.stringify(allDatesSearch[startDate]).substring(4);
    // var endString = JSON.stringify(allDatesSearch[endDate]).substring(4);
    // startTitleDate.text(startString.slice(0,2)+"/"+startString.substring(2));
    // endTitleDate.text(endString.slice(0,2)+"/"+endString.substring(2));

  }
  function setupFilters(){

    d3.select(".mobile-zoom-out").on("click",function(){
      reset();
    });

    d3.selectAll(".filter-item")
      .on("click",function(){

        d3.selectAll(".filter-item")
          .style("font-weight",null)
          .style("background-color",null)
          .style("color",null)
          .style("box-shadow",null)
          .style("border-color",null)
          ;

        d3.select(this)
          .style("font-weight","500")
          .style("background-color","#F5F5F5")
          .style("color","black")
          .style("box-shadow","inset 0 3px 5px rgba(0,0,0,.125)")
          .style("border-color","#adadad")
          ;

        var filterSelected = d3.select(this).attr("id");
        uploader = filterSelected;

        if(filterSelected == "versus"){
          d3.select(".first-col").select(".col-title").html("<span class='bolded'><span class='candidate-name'>The Top Three</span></span><br>Most-Viewed Videos");
          d3.select(".second-col").select(".col-title").html("<span class='bolded'>Search Interest, by Candidate</span>, <span class='start-date'>7/13</span><span class='range-dash'> - </span><span class='end-date'>8/25</span>");
          startTitleDate = d3.select(".start-date");
          endTitleDate = d3.select(".end-date");
        }
        else{
          d3.select(".first-col").select(".col-title").html("<span class='bolded'><span class='candidate-name'></span>’s</span> Most-Viewed Videos")
          d3.select(".second-col").select(".col-title").html("<span class='bolded'><span class='candidate-name'>Clinton</span>’s Search Interest</span>, <span class='start-date'>07/13</span><span class='range-dash'> - </span><span class='end-date'>08/25</span>")
          startTitleDate = d3.select(".start-date");
          endTitleDate = d3.select(".end-date");
          d3.selectAll(".candidate-name").text(uploader);
          // paths.style("display","none");
          pathsCounty.style("display","block");
        }
        // console.log("filter-selected");
        pathColor();
        createLegend();
        // buildVideos();
        buildSpark();

        var startString = JSON.stringify(allDatesSearch[startDate]).substring(4);

        if(startDate==8){
          startTitleDate.text("11/06 - 11/08");
        }
        else{
          startTitleDate.text("week of "+startString.slice(0,2)+"/"+startString.substring(2));
        }

        if(allDatesSelected){
          startTitleDate.text(startString.slice(0,2)+"/"+startString.substring(2));
          var endString = JSON.stringify(allDatesSearch[endDate]).substring(4);
          endTitleDate.text(endString.slice(0,2)+"/"+endString.substring(2));
        }
        else{
          endTitleDate.text("");
          d3.select(".range-dash").text("");
        }


        if(uploader=="Clinton"||uploader=="Trump"){

          // if(!allDatesSelected){
          //   if(!mobile){
          //     primaryHighlight();
          //     primaryContainer.style("visibility","visible");
          //     timelineAnnotations.style("visibility","visible");
          //   }
          // }
          // else{
          //   if(!mobile){
          //     timelineAnnotations.style("visibility","visible");
          //   }
          // }

          sparkLines.style("background-color",function(d,i){
            if(!allDatesSelected && +startDate== +d.key){
              if(uploader=="Clinton"){
                return blueScale(d.values.clinton);
              }
              return redScale(d.values.trump);
            }
            return null;
          }).select("p").style("font-weight",function(d){
            if(!allDatesSelected && +startDate== +d.key){
              return 600
            }
            return null;
          })
          ;


          // sparkLines.style("background-color",function(d){
          //   if(allDatesSelected){
          //     return null;
          //   }
          //   if(+d.key >= startWeek && +d.key <= endWeek){
          //     if(uploader=="Clinton"){
          //       return blueScale(13*d.values[0].values/(321418820/10000));
          //     }
          //     return redScale(13*d.values[1].values/(321418820/10000));
          //   }
          //   return null;
          // });
        }
        else{
          d3.selectAll(".spark-item-versus-item-week-text").style("font-weight",function(d){
            if(!allDatesSelected && +startDate== +d.key){
              return 600
            }
            return null;
          });

          primaryContainer.style("visibility","hidden");
          timelineAnnotations.style("visibility","hidden");
          pathsVoronoi
            .style("stroke",function(d){
              return null;
            })
            .style("stroke-width",function(d){
              return null;
            })
            ;

        }
      })

    d3.select(".all-dates-button").on("click",function(){
      allDatesSelected = true;
      // showPrimaryKey = false;
      primaryContainer.style("visibility","hidden");
      startDate = 0;
      endDate = allDatesSearch.length - 1;
      var startString = JSON.stringify(allDatesSearch[startDate]).substring(4);
      var endString = JSON.stringify(allDatesSearch[allDatesSearch.length-1]).substring(4);
      startTitleDate.text(startString.slice(0,2)+"/"+startString.substring(2));
      d3.select(".range-dash").text(" - ");
      endTitleDate.text(endString.slice(0,2)+"/"+endString.substring(2));

      // buildSpark();
      d3.selectAll(".spark-item").style("background-color",null);
      d3.selectAll(".spark-item-versus-item-week-text").style("font-weight",null);
      // buildVideos();
      // console.log("alldatesbutton");
      pathColor();
    })
    ;
  }

  function pathColor(){

    var duration = 250;
    if(mobile){
      duration = 0;
    }
    if(tickRunning){
      duration = 250;
    }

    if(uploader == "Trump" || uploader == "Clinton"){
      // getData();

      pathsCounty
        .transition()
        .duration(duration)
        .delay(function(d,i){
          if(mobile){
            return 0;
          }
          return i*.1;
        })
        .style("fill",function(d,i){
          var population = +d.population;
          var county_id = d.id;

          if(nestedFirstDataSearchMap.has(+county_id)){
            var marketData = nestedFirstDataSearchMap.get(+county_id).values;
            marketData = marketData.slice(startDate,endDate+1);
            var totalViews = d3.mean(marketData,function(d){return d[uploader]});
            if(totalViews==0){
              return defaultColor;
            }
            if(population != 0 && population != "NULL"){
              if(uploader == "Clinton"){
                return blueScale(totalViews)
              }
              else {
                return redScale(totalViews)
              }
            }
            else{
              if(uploader == "Clinton"){
                return blueScale(0);
              }
              else{
                return redScale(0);
              }
            }
          }
          else{
            if(uploader == "Clinton"){
              return blueScale(0);
            }
            else{
              return redScale(0);
            }
          }
          return null;
        })
        ;

    }
    else{

      var evenColor = "#F7F7F7";

      pathsCounty
        .transition()
        .duration(duration)
        .delay(function(d,i){
          if(mobile){
            return 0;
          }
          return i*.1;
        })
        .style("fill",function(d,i){

          // return "red";
          var population = +d.population;
          var county_id = d.id;
          var clintonTotalViews = 0;
          var trumpTotalViews = 0;

          if(nestedFirstDataSearchMap.has(+county_id)){
            var marketData = nestedFirstDataSearchMap.get(+county_id).values;
            marketData = marketData.slice(startDate,endDate+1);
            clintonTotalViews = d3.mean(marketData,function(d){return d["Clinton"]});
            trumpTotalViews = d3.mean(marketData,function(d){return d["Trump"]});
          }

          // if(clintonCountyData.has(+county_id)){
          //   var marketData = clintonCountyData.get(+county_id).values;
          //   marketData = marketData.slice(startDate,endDate);
          //   clintonTotalViews = d3.sum(marketData,function(d){return d.views});
          // }
          //
          // if(trumpCountyData.has(+county_id)){
          //   var marketData = trumpCountyData.get(+county_id).values;
          //   marketData = marketData.slice(startDate,endDate);
          //   trumpTotalViews = d3.sum(marketData,function(d){return d.views});
          // }

          if(clintonTotalViews==0&&trumpTotalViews==0){
            return "#cccccc";
          }

          var winner = "Trump";
          if(clintonTotalViews > trumpTotalViews){
            winner = "Clinton";
          }
          if (winner == "Trump"){
            var percent = trumpTotalViews/(trumpTotalViews+clintonTotalViews);
            if(percent<.51){
              return evenColor;
            }
            return trumpScale(percent);
          }
          else {
            var percent = clintonTotalViews/(trumpTotalViews+clintonTotalViews)
            if(percent<.51){
              return evenColor;
            }
            return clintonScale(percent);
          }

        })
        ;
    }

  }

  function primaryHighlight(){

    var duration = 250;
    if(tickRunning){
      duration = 0;
    }

    var primaryStateArray = [];

    var front = allDates[startDate];
    var end = allDates[endDate];
    showPrimaryKey = false;

    var dateSelected = 1;
    if(uploader == "Trump"){
      dateSelected = 2;
    }
    else if(uploader != "Trump" && uploader != "Clinton"){
    }

    pathsVoronoi
      .style("stroke",function(d){
        if(d.id < 70){
          var date = stateName[+d.id][dateSelected];
          if (date < end && date > front){
            showPrimaryKey = true;
            return "black";
          }
        }
        return null;
      })
      .classed("primary-highlighted",function(d){
        if(d.id < 70){
          var date = stateName[+d.id][dateSelected];
          if (date < end && date > front){
            showPrimaryKey = true;
            return "true";
          }
        }
        return false;
      })
      .style("stroke-width",function(d){
        if(d.id < 70){
          var date = stateName[+d.id][dateSelected];
          if (date < end && date > front){
            primaryStateArray.push(+d.id);
            return "1.5";
          }
        }
        return null;
      })
      ;

    if(showPrimaryKey){
      primaryContainer.transition().duration(duration).style("opacity",1);
      var primaryContainerData = primaryContainer.select(".primary-container-states").selectAll("p").data(primaryStateArray,function(d){ return d; });
      primaryContainerData.enter().append("p").attr("class","primary-container-state-item").text(function(d){
        return stateName[+d][3] + ".";
      });
      primaryContainerData.exit().remove();

    }
    else{
      primaryContainer.style("opacity",null);
    }
  }
  createLegend();
  playTriggers();
  setupFilters();
  // buildVideos();

  // function loadSequence(){
  //   loadStarted = true;
  //   if(!newDataLoaded){
  //     var loading = d3.select(".loading-screen").style("display","flex");
  //     var percents = 0;
  //     function increment(){
  //       percents = percents + 1;
  //       loading.select("span").text(percents).transition().duration(0).delay(10).each("end", function(){
  //         if(!newDataLoaded){
  //           increment();
  //         }
  //       });
  //     }
  //     nestedCountyData = secondLoadClean();
  //     increment();
  //   }
  // }

  console.timeEnd("start");

}
