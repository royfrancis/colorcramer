var schemeNames = {
	sequential: ["Batlow", "BatlowW", "BatlowK", "Glasgow", "Lipari", "Navia", "Hawaii", "Buda", "Imola", "Oslo", "GrayC", "Nuuk", "Devon", "Lajolla", "Bamako", "Davos", "Bilbao", "Lapaz", "Acton", "Turku", "Tokyo"],
	diverging: ["Broc", "Cork", "Vik", "Lisbon", "Tofino", "Berlin", "Bam", "Roma", "Vanimo", "Managua"],
	cyclic: ["RomaO", "BamO", "BrocO", "CorkO", "VikO"],
	"multi-sequential": ["Oleron", "Bukavu", "Fes"]
};

var CHIP_HEIGHT = 24;
var MAX_CLASSES = 50;
// the diagnostic map only has designed outlier polygons for 3-12 classes
var MAP_MIN_CLASSES = 3, MAP_MAX_CLASSES = 12;
var selectedScheme = schemeNames.sequential[0],
	selectedSchemeType = "sequential",
	numClasses = 6;

// palette colors as shown and exported; the "Reverse palette" checkbox flips the order
var reversed = false;
function paletteColors(scheme, n)
{
	var c = colorbrewer[scheme][n];
	return reversed ? c.slice().reverse() : c;
}
function paletteColor(scheme, n, i)
{
	return paletteColors(scheme, n)[i];
}

function clampClasses(n)
{
	n = parseInt(n, 10);
	if ( !(n >= 1) ) return 6;
	return Math.min(n, MAX_CLASSES);
}

$("#num-classes").on("input change", function(){
	setNumClasses(clampClasses($(this).val()));
});
$(".scheme-type").change(function(){
	setSchemeType($(this).attr("id"));
});
$("#color-system").change(updateValues);
$("#layers input").change(layerChange);

$("#reverse-check").change(function(){
	reversed = $(this).is(":checked");
	showSchemes();
});

// copy buttons in the share panel: copy the value of the input in front of the button
$(".copy-btn").click(function(){
	var btn = $(this), input = btn.prev("input")[0];
	function done(ok)
	{
		btn.text( ok ? "copied" : "failed" );
		setTimeout(function(){ btn.text("copy"); }, 1200);
	}
	function fallback()
	{
		var ok = false;
		input.focus();
		input.select();
		try { ok = document.execCommand("copy"); } catch(e) {}
		done(ok);
	}
	if ( navigator.clipboard && window.isSecureContext ) navigator.clipboard.writeText(input.value).then(function(){ done(true); }, fallback);
	else fallback();
});

// emulate a color vision deficiency: a cvd-* class on the wrapper switches on the matching filter (see style.css)
$("#vision-select").change(function(){
	var v = $(this).val();
	$("#wrapper").removeClass("cvd-protanopia cvd-deuteranopia cvd-tritanopia cvd-achromatopsia");
	if ( v ) $("#wrapper").addClass("cvd-"+v);
});

// terrain starts at a default transparency; remember it so switching back to a solid background can undo it
var TERRAIN_DEFAULT_TRANSPARENCY = 50, transparencyAuto = false;
function setTransparency(v)
{
	$("#transparency").val(v);
	$("#county-map g").css("opacity",1-v/100);
}
$("#transparency").on("input change", function(){
	transparencyAuto = false;
	setTransparency(Number($(this).val()));
});

$("#road-color").spectrum({
	color: "#f33",
	showInput:true,
	change: function(color){
		if ( !$("#overlays").children().length ) return;
		$("#road-lines").css("stroke",color.toHexString());
	}
});
$("#city-color").spectrum({
	color: "#000",
	showInput:true,
	change: function(color){
		if ( !$("#overlays").children().length ) return;
		$("#cities").css("fill",color.toHexString());
	}
});
$("#border-color").spectrum({
	color: "#000",
	showInput:true,
	change: function(color){
		$("#county-map g").css("stroke",color.toHexString());
	}
});
$("#bg-color").spectrum({
	color: "#fff",
	showInput:true,
	change: function(color){
		$("#county-map rect").css("fill",color.toHexString());
	}
});

$("#terrain, #solid-color").change(function(){
	if ( $("#terrain").is(":checked") ){
		if ( !$("#terrain-img").length ) $("#map-container").prepend( $("<img id='terrain-img' src='map/terrain.jpg' />").css("left",-31).css("top",-58) );
		$("#county-map rect").css("opacity",0);
		if ( Number($("#transparency").val()) === 0 ){
			setTransparency(TERRAIN_DEFAULT_TRANSPARENCY);
			transparencyAuto = true;
		}
	} else {
		$("#county-map rect").css("opacity",1);
		if ( transparencyAuto ){
			setTransparency(0);
			transparencyAuto = false;
		}
	}
});


// the map only ships with precomputed classes for 3-12; derive others from the 12-class split
function ensureMapClasses(n)
{
	if ( n >= 3 && n <= 12 ) return;
	var done = new RegExp("q[0-9]+-"+n+"(\\s|$)");
	$("#counties path").each(function(){
		var cls = this.getAttribute("class") || "";
		if ( done.test(cls) ) return false;
		var m = cls.match(/q(\d+)-12(\s|$)/);
		if ( !m ) return;
		var c = Math.floor((parseInt(m[1], 10) + 0.5) * n / 12);
		this.setAttribute("class", cls + " q" + c + "-" + n);
	});
}

// fonts load after the first layout pass and can change the height of the rows above the panels
$(window).on("load", function(){ if ( $("#county-map").length ) resizeLayout(); });

function setNumClasses(n)
{
	numClasses = parseInt(n, 10);
	$("#num-classes").val(numClasses);
	$("#num-value").text(numClasses);
	var outOfRange = numClasses < MAP_MIN_CLASSES || numClasses > MAP_MAX_CLASSES;
	$("#number").toggleClass("out-of-range", outOfRange);
	$("#num-classes, #num-value").attr("title", outOfRange ?
		"The diagnostic map is designed for "+MAP_MIN_CLASSES+"-"+MAP_MAX_CLASSES+" classes. Outside that range it shows at most "+MAP_MAX_CLASSES+" distinct colors and has no outlier test." :
		"");
	ensurePalettes(numClasses);
	ensureMapClasses(numClasses);
	showSchemes();
}

function setSchemeType(type)
{
	if ( type === "cyclical" ) type = "cyclic";
	if ( !schemeNames[type] ) type = "sequential";
	selectedSchemeType = type;
	showSchemes();
}

function showSchemes()
{
	$("#ramps").empty();
	for ( var i in schemeNames[selectedSchemeType]){
		if ( checkFilters(schemeNames[selectedSchemeType][i]) == false ) continue;
		var name = schemeNames[selectedSchemeType][i],
			ramp = $("<div class='ramp'></div>").attr("data-scheme", name).attr("title", name),
			svg = "<svg width='15' height='75'>";
		for ( var n = 0; n < 5; n++ ){
			svg += "<rect fill='"+paletteColor(name,5,n)+"' width='15' height='15' y='"+n*15+"'/>";
		}
		svg += "</svg>";
		$("#ramps").append(ramp.append(svg).click( function(){
			if ( $(this).hasClass("selected") ) return;
			setScheme( $(this).attr("data-scheme") );
		}));
	}
	$("#scheme1").css("width","100%");

	$("#color-system").show();
	if ( rampFor(selectedScheme).length ){
		setScheme( selectedScheme );
	} else if ( $("#ramps").children().length ) setScheme( $("#ramps .ramp:first-child").attr("data-scheme") );
	else clearSchemes();
}

// the ramp element for a scheme name (names are matched as data, never built into a selector)
function rampFor(name)
{
	return $("#ramps .ramp").filter(function(){ return $(this).attr("data-scheme") === name; });
}

function clearSchemes()
{
	$("#counties g path").css("fill","#ccc");
	$("#color-chips").empty();
	$("#color-values").empty();
	$("#ramps").css("width","100%");
	$("#scheme-name").html("");
	$("#color-system").hide();
	resizeLayout();
	$("#ramps").append("<p>Color palettes could not be loaded.</p><p>Please check your connection and reload the page.</p>");
}

function setScheme(s)
{
	if ( !checkFilters(s) ){
		if ( $("#ramps").children().length ) s = $("#ramps .ramp:first-child").attr("data-scheme");
		else {
			clearSchemes();
			return;
		}
	}
	$("#county-map g").removeClass(selectedScheme).addClass(s);
	$(".ramp.selected").removeClass("selected");
	selectedScheme = s;
	rampFor(selectedScheme).addClass("selected");
	$("#scheme-name").html(numClasses+"-class "+selectedScheme);
	applyColors();
	drawColorChips();
	var baseUrl = window.location.href.split("#")[0].split("?")[0];
	var shareUrl = baseUrl+"?type="+selectedSchemeType+"&scheme="+selectedScheme+"&n="+numClasses+( reversed ? "&reverse=1" : "" );
	$("#permalink").val(shareUrl);
	if ( window.history && window.history.replaceState ) window.history.replaceState(null, document.title, shareUrl);

	var cssString = "";
	for ( var i = 0; i < numClasses; i ++ ){
		cssString += "."+selectedScheme+" .q"+i+"-"+numClasses+"{fill:" + paletteColor(selectedScheme,numClasses,i) + "}";
		if ( i < numClasses - 1 ) cssString += " ";
	}
	$("#copy-css input").val(cssString);
}

function checkFilters(scheme)
{
	if ( !colorbrewer[scheme] || !colorbrewer[scheme][numClasses] ) return false;
	return true;
}
function applyColors()
{
	if ( !colorbrewer[selectedScheme] || !colorbrewer[selectedScheme][numClasses] ){
		$("#counties g path").css("fill","#ccc");
		return;
	}
	for ( var i = 0; i < numClasses; i++ ){
		if ( !$("#borderscheck").is(":checked") ) $("#county-map g .q"+i+"-"+numClasses).css("stroke",paletteColor(selectedScheme,numClasses,i));
		$(".q"+i+"-"+numClasses).css("fill",paletteColor(selectedScheme,numClasses,i));
	}
}

function drawColorChips()
{
	var svg = "<svg width='24' height='"+CHIP_HEIGHT*numClasses+"'>";
	for ( var i = 0; i < numClasses; i++ ){
		svg += "<rect fill='"+paletteColor(selectedScheme,numClasses,i)+"' width='24' height='"+CHIP_HEIGHT+"' y='"+i*CHIP_HEIGHT+"'/>";
	}
	$("#color-chips").empty().append(svg);
	updateValues();
	resizeLayout();
}

// the color panel grows downwards with the number of classes
function resizeLayout()
{
	// the options/colors/export panels start right below the palette picker, whatever height the rows above take
	var top = Math.round($("#scheme").position().top + $("#scheme").outerHeight());
	$("#options, #system, #export").css("top", top);
	var needed = top + $("#system").outerHeight();
	var h = Math.max(top + 355, needed);
	var mapHeight = 581 + h - 650;
	$("#left").css("height", h);
	$("#wrapper").css("height", h + 10);
	$("#export").css("height", h - top - 1);
	$("#options").css("height", h - top + 2);
	$("#map-container").css("height", mapHeight);
	// keep the map background filling the container
	$("#county-map").attr("height", mapHeight);
	$("#county-map rect").attr("height", mapHeight);
}

function updateValues()
{
	if ( !colorbrewer[selectedScheme] || !colorbrewer[selectedScheme][numClasses] ) return;
	var system = $("#color-system").val().toLowerCase();
	var lines = [], list = [];
	$.each(paletteColors(selectedScheme,numClasses), function(i, c){
		var val = ( system == "cmyk" ? getCMYK(selectedScheme,numClasses,i) : getColorDisplay(c,system) );
		lines.push(val);
		list.push( system == "hex" ? val : system+"("+val+")" );
	});

	$("#color-values").empty().append("<textarea readonly style='line-height:"+CHIP_HEIGHT+"px; height:"+CHIP_HEIGHT*numClasses+"px'>"+lines.join("\n")+"</textarea>");
	$("#copy-json input").val(JSON.stringify(list));
}

function getColorDisplay(c,s)
{
	if ( c.indexOf("#") != 0 ){
		var arr = c.replace(/[a-z()\s]/g,"").split(",");
		var rgb = {r:arr[0],g:arr[1],b:arr[2]};
	}
	s = s || $("#color-system").val().toLowerCase();
	if ( s=="hex" ){
		if ( rgb ) return rgbToHex(rgb.r,rgb.g,rgb.b);
		return c;
	}
	if ( s=="rgb" || s=="cmyk" ){
		if (!rgb) rgb = hexToRgb(c);
		return rgb.r + "," + rgb.g + "," + rgb.b;
	}

}
function getCMYK( scheme, classes, n ){
	var rgb = hexToRgb(getColorDisplay(paletteColor(scheme,classes,n), "hex"));
	return rgb2cmyk(rgb.r, rgb.g, rgb.b).toString();
}
var highlight;
$("#counties").svg({
	loadURL: "map/map.svg",
	onLoad: function(){
		$("#counties svg")
			.attr("id","county-map")
			.attr("width",756)
			.attr("height",581);
		$("#map-container").css("background-image","none");
		init();
		$("#counties path").mouseover(function(){
			var m = ($(this).attr("class") || "").match(new RegExp("q([0-9]+)-"+numClasses+"(?![0-9])"));
			if ( !m || !colorbrewer[selectedScheme] || !colorbrewer[selectedScheme][numClasses] ) return;
			var cl = parseInt(m[1], 10) + 1;
			if ( highlight ) highlight.remove();
			$("#probe").empty().append(
				"<p>"+selectedScheme+" class " + cl +"<br/>"+
				"RGB: " + getColorDisplay(paletteColor(selectedScheme,numClasses,cl-1),"rgb")+"<br/>"+
				"CMYK: " + getCMYK(selectedScheme,numClasses,cl-1)+"<br/>"+
				"HEX: " + getColorDisplay(paletteColor(selectedScheme,numClasses,cl-1),"hex")+"</p>"
			);
			highlight = $(this).clone().css({"pointer-events":"none","stroke":"#000","stroke-width":"2"}).appendTo("#county-map g");
			$("#probe").show();
		});
		$("#counties path").mousemove(function(e){
			$("#probe").css({left: Math.min(920,e.pageX - $("#wrapper").offset().left + 10), top: e.pageY - $("#wrapper").offset().top - 75 });
		});
		$("#counties path").mouseout(function(){
			$("#probe").hide();
			if ( highlight ){ highlight.remove(); highlight = null; }
		});
	}
});

function hasKey(obj, key)
{
	return Object.prototype.hasOwnProperty.call(obj, key);
}

// resolve type, scheme and class count from the URL (anything invalid falls back to a default), then render once
function init()
{
	var type = getParameterByName("type") || "sequential";
	if ( type === "cyclical" ) type = "cyclic";
	if ( !hasKey(schemeNames, type) ) type = "sequential";
	var scheme = getParameterByName("scheme");
	if ( $.inArray(scheme, schemeNames[type]) < 0 ) scheme = schemeNames[type][0];

	reversed = getParameterByName("reverse") === "1";
	$("#reverse-check").prop("checked", reversed);
	$("#"+type).prop("checked",true);
	selectedSchemeType = type;
	selectedScheme = scheme;
	setNumClasses(clampClasses(getParameterByName("n")));
}

function layerChange()
{
	switch( $(this).attr("id") ){
		case "roadscheck":
		case "citiescheck":
		if ( overlaysState === 0 && ( $("#roadscheck").is(":checked") || $("#citiescheck").is(":checked") ) ) loadOverlays();
		else syncOverlays();
		break;

		case "borderscheck":
		if ($(this).is(":checked")) $("#county-map g").children().css({"stroke":"inherit","stroke-width":"0.50"});
		else {
			var i=numClasses; while(i--){
				$("#county-map g .q"+i+"-"+numClasses).css({"stroke":paletteColor(selectedScheme,numClasses,i),"stroke-width":"1"});
			}
		}
	}
}

// 0 = not requested, 1 = loading, 2 = loaded; the overlay file holds both layers, so it is only fetched once
var overlaysState = 0;

function syncOverlays()
{
	if ( overlaysState !== 2 ) return;
	$("#roads").toggle( $("#roadscheck").is(":checked") );
	$("#cities").toggle( $("#citiescheck").is(":checked") );
}

function loadOverlays()
{
	overlaysState = 1;
	$("#overlays").svg({
		loadURL: "map/overlays.svg",
		onLoad: function(){
			$("#overlays svg").attr("width",756).attr("height",581);
			$("#cities").css("fill",$("#city-color").spectrum("get").toHexString());
			$("#road-lines").css("stroke",$("#road-color").spectrum("get").toHexString());
			overlaysState = 2;
			syncOverlays();
		}
	});
}
$(".learn-more, #how, #credits").click(function(e){
	e.stopPropagation();
	var page;
	switch( $(this).attr("id") ){
		case "number-learn-more":
		$("#learnmore-title").html("NUMBER OF DATA CLASSES");
		page = "number.html";
		break;

		case "schemes-learn-more":
		$("#learnmore-title").html("GRADIENT TYPES");
		page = "schemes.html";
		break;

		case "how":
		$("#learnmore-title").html("HOW TO USE: MAP DIAGNOSTICS");
		page = "howtouse.html";
		break;

		case "credits":
		$("#learnmore-title").html("CREDITS");
		page = "credits.html";
		break;

		case "context-learn-more":
		$("#learnmore-title").html("MAP CONTEXT and BACKGROUND");
		page = "context.html";
		break;
	}
	if ( page ){
		$("#learnmore #content").load("learnmore/"+page,function(){
			$("#learnmore").show().css("margin-top",($("#wrapper").height()/2-$("#learnmore").height()/2));
		});
		$("#mask").show();
	}
});
$("#learnmore #close, #mask").click(function(){
	$("#learnmore #content").empty();
	$("#learnmore, #mask").hide();
});

$( "#export #tab" ).click(function(){
	var exportPanel = $( "#export" );
	var isOpen = exportPanel.hasClass("open");
	exportPanel.toggleClass("open", !isOpen).animate({ "left" : isOpen ? "0px" : "287px" });
});

function rgb2cmyk (r,g,b) {
	var computedC = 0;
	var computedM = 0;
	var computedY = 0;
	var computedK = 0;

	// BLACK
	if (r==0 && g==0 && b==0) return [0,0,0,100];

	computedC = 1 - (r/255);
	computedM = 1 - (g/255);
	computedY = 1 - (b/255);

	var minCMY = Math.min(computedC,
			  Math.min(computedM,computedY));
	computedC = (computedC - minCMY) / (1 - minCMY) ;
	computedM = (computedM - minCMY) / (1 - minCMY) ;
	computedY = (computedY - minCMY) / (1 - minCMY) ;
	computedK = minCMY;

	return [Math.round(computedC*100),Math.round(computedM*100),Math.round(computedY*100),Math.round(computedK*100)];
}
function rgbToHex(r, g, b) {
    return "#" + ( (1 << 24) | (r << 16) | (g << 8) | b ).toString(16).slice(1);
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getParameterByName(name)
{
	return new URLSearchParams(window.location.search).get(name);
}
