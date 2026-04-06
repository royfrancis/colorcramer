/*
 * Build a ColorBrewer-compatible palette object from Fabio Crameri colormaps.
 * Source format follows https://github.com/justdan96/fabio-crameri-palette-generator
 */

var colorbrewer = {};

(function () {
	function hexToRgbString(hex) {
		var s = hex.replace("#", "");
		var r = parseInt(s.substring(0, 2), 16);
		var g = parseInt(s.substring(2, 4), 16);
		var b = parseInt(s.substring(4, 6), 16);
		return "rgb(" + r + "," + g + "," + b + ")";
	}

	function samplePalette(colors, classes) {
		var sampled = [];
		var last = colors.length - 1;
		for (var i = 0; i < classes; i++) {
			var idx = Math.round((i * last) / (classes - 1));
			sampled.push(hexToRgbString(colors[idx]));
		}
		return sampled;
	}

	for (var scheme in colormaps) {
		if (!Object.prototype.hasOwnProperty.call(colormaps, scheme)) continue;
		var colors = colormaps[scheme];
		if (!colors || colors.length < 3) continue;

		colorbrewer[scheme] = {
			properties: {
				type: "seq",
				blind: [1],
				print: [1],
				copy: [1],
				screen: [1]
			}
		};

		for (var n = 3; n <= 12; n++) {
			colorbrewer[scheme][n] = samplePalette(colors, n);
		}
	}
})();
