//************
// Result view objects
//************

var BaseResults = {
	initialize : function(tabSelector, resultSelector) {
		this.$tab = $(tabSelector);
		this.$result = $(resultSelector);
		this.index = this.$tab.index();
	},
	
	renderResult : function(data) {
		if(data.ERROR) {
			this.resultError(data);
			return false;
		}
		var self = this;
        //$("#result-container").tabs("select", 0);
        var disabled = $("#result-container").tabs("option", "disabled");
        var newDisabled = $.grep(disabled, function(item) {
        	return item != self.$tab.index();
        });
        $("#result-container").tabs("option", "disabled", newDisabled);
	},
	
	resultError : function(data) {
		$.log("json fetch error: " + $.dump(data.ERROR));
		this.hidePreloader();
	},
	
	showPreloader : function() {
		$("<div class='spinner' />").appendTo(this.$tab)
		.spinner({innerRadius: 5, outerRadius: 7, dashes: 8, strokeWidth: 3});
	},
	hidePreloader : function() {
		this.$tab.find(".spinner").remove();
	}
};

view.BaseResults = new Class(BaseResults);
delete BaseResults;

var KWICResults = {
	Extends : view.BaseResults,
	initialize : function(tabSelector, resultSelector) {
		this.parent(tabSelector, resultSelector);
		this.num_result = 0;
		this.current_page = 0;
		if(!Modernizr.inputtypes.number) {
			var $select = $('<select name="num_hits" id="num_hits"></div>');
			$("#num_hits").replaceWith($select);
			
			$.each([25, 50, 75, 100], function(i, item) {
				$("<option />").attr("value", item).text(item).appendTo($select);
			});
			$select.val(25)
			.css("margin-right", 5);
		}
	},
	
	resultError : function(data) {
		this.parent(data);
		$("#results-table").empty();
		$("#Pagination").empty();
		$("#results-table").html($.format("<i>There was a CQP error: <br/>%s:</i>", data.ERROR.traceback.join("<br/>")));
	},
		
	renderResult : function(data) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		var self = this;
		
		if(!this.num_result) {
			this.buildPager(data.hits);
		}
		this.num_result = data.hits;
		$('#num-result').html(data.hits);
		if(!data.hits) {

			$.log("no kwic results");
			$("#results-table").empty();
			$("#Pagination").empty();
			this.hidePreloader();
			return;
		}				


		var effectSpeed = 100;
		if($.trim($("#results-table").html()).length) {
			$("#results-kwic").fadeOut(effectSpeed, function() {
				$("#results-table").empty();
				self.renderResult(data);
			});
			return;
		}
		else {
			$("#results-kwic").hide();
		}
		if($("#sidebar").css("right") == "0px" && !$("#result-container").tabs("option", "selected")) {
			showSidebar();
		}
		$.log("corpus_results");
		$("#results-kwic").show();
		$.each(data.kwic, function(i,sentence) { 
			var offset = 0; 
		    var splitObj = {
		    		"left" : self.selectLeft(sentence, offset),
		    		"match" : self.selectMatch(sentence),
		    		"right" : self.selectRight(sentence)
		    };
			var rows = $( "#sentenceTmpl" ).tmpl( splitObj, {rowIndex : i, aligned : sentence.aligned})
					.appendTo( "#results-table" )
					.find(".word")
					.click(function(event) {
							event.stopPropagation();
							util.SelectionManager.select($(this));
							var data = $(this).tmplItem().data;
							var currentSentence = $(this).parent().is(".linked_sentence") ? sentence.aligned : sentence;   
							
							updateSidebar(currentSentence.structs, data, sentence.corpus);
							$.sm.send("word.select");
						}
							
					).end();
					
			if(i % 2 == 0) {
				rows.addClass("alt");
			}
			
		});
		$.each([",", ".", ";", ":", "!", "?"], function(i, item) {
			$($.format(".word:contains(%s)", item)).prev().html('');
		});
		$("#results-kwic").hide();
//			make the first matched word selected by default.
		$(".match").children().first().click();
		$("#results-kwic").fadeIn(effectSpeed);
		
		this.centerScrollbar();
		this.hidePreloader();
	},
	
	selectLeft : function(sentence, offset) {
		return sentence.tokens.slice(offset, sentence.match.start);
	},

	selectMatch : function(sentence) {
		var from = sentence.match.start;
		return sentence.tokens.slice(from, sentence.match.end);
	},

	selectRight : function(sentence) {
		var from = sentence.match.end;
		var len=sentence.tokens.length;
		var to = len;
		
		return sentence.tokens.slice(sentence.match.end, to);
	},
	
	buildPager : function(number_of_hits){
		var items_per_page = $("#num_hits").val();
		if(number_of_hits > items_per_page){
			$("#Pagination").pagination(number_of_hits, {
				items_per_page : items_per_page, 
				callback : $.proxy(this.handlePaginationClick, this),
				next_text: util.getLocaleString("next"),
				prev_text: util.getLocaleString("prev"),
				link_to : "javascript:void(0)",
				num_edge_entries : 2,
				ellipse_text: '..',
				current_page : $.bbq.getState("page", true) || 0
			});
			$(".next").attr("rel", "localize[next]");
			$(".prev").attr("rel", "localize[prev]");
			
		}else{
			$("#Pagination").html('');
		}
	},
	
	handlePaginationClick : function(new_page_index, pagination_container) {
		$.log("handlePaginationClick", new_page_index, this.current_page);
		if(new_page_index != this.current_page) {
			var items_per_page = parseInt($("#num_hits").val());
			
//			var cqp 	= kwicProxy.prevRequest.cqp;
			var cqp 	= $("#Pagination").data("cqp");
			
			var start = new_page_index*items_per_page;
			var end = (start + items_per_page);
			$.log("pagination request", cqp, start, end);		
			kwicProxy.makeRequest(cqp, start, end, kwicProxy.queryData);
			this.current_page = new_page_index;
			$.bbq.pushState({"page" : this.current_page});
		}
	    
	   return false;
	},
	
	setPage : function(page) {
		$("#Pagination").trigger('setPage', [page]);
	},
		
	centerScrollbar : function() {
		if(!$(".match").first().length) return;
		$("#table_scrollarea").scrollLeft(0);
		var matchLeft = $(".match").first().position().left;
		var sidebarWidth = $("#sidebar").outerWidth() || 0;
		$("#table_scrollarea").scrollLeft(matchLeft - ($("body").innerWidth() - sidebarWidth ) / 2);
	},
		
	
	getCurrentRow : function() {
		var tr = $(".token_selected").closest("tr");
		if($(".token_selected").parent().is("td")) {
			return tr.find("td > .word");
		} else {
			return tr.find("div > .word");
		}
	},
	
	selectNext : function() {
		var i = this.getCurrentRow().index($(".token_selected").get(0));
		var next = this.getCurrentRow().get(i+1);
		if(next == null) return;
		$(next).click();
	},
	selectPrev : function() {
		var i = this.getCurrentRow().index($(".token_selected").get(0));
		if(i == 0) return;
		var prev = this.getCurrentRow().get(i-1);
		$(prev).click();
	},
	selectUp : function() {
		var prevMatch = util.SelectionManager.selected.closest("tr").prevAll(".sentence:first").find(".match span:first");
		prevMatch.click();
	},
	
	selectDown : function() {
		var nextMatch = util.SelectionManager.selected.closest("tr").nextAll(".sentence:first").find(".match span:first");
		nextMatch.click();
	}
	

};

var LemgramResults = {
	Extends : view.BaseResults,
//	initialize : function(tabSelector, resultSelector) {
//		$.log("initialize", this.parent)
//		this.parent.initialize(tabSelector, resultSelector);
//	},
	
	renderResult : function(data, lemgram) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		$("#results-lemgram").empty();
		if(data.relations){
			this.renderTables(lemgram, data.relations);
		}
		else {
			this.showNoResults();
		}
		
	},
	
	renderHeader : function(wordClass) {
		$.log("renderHeader", $("#results-lemgram"));
		var colorArray = ["color_blue", "color_purple", "color_green", "color_yellow", "color_azure", "color_red"];
		var $parent = $("<div id='lemgram_help' />").prependTo("#results-lemgram");
		
		$(".lemgram_result").each(function(i) {
			if($(this).data("rel")) {
				var color = colorArray.shift();
				$($.format("<span>%s</span>", wordClass == "av" ? util.getLocaleString("head") : $(this).data("rel")))
				.addClass(color)
				.appendTo($parent)
				.tooltip({
					delay : 600,
					bodyHandler : function() {
						return util.getLocaleString("tooltip_" + $(this).text());
					}
				})
				.mouseenter(function(event) {
					$(".lemgram_result." + $(this).attr("class")).addClass("lemgram_highlight");
				})
				.mouseleave(function() {
					$(".lemgram_result." + $(this).attr("class")).removeClass("lemgram_highlight");
				});
				$(this).addClass(color)
				.css("border-color", $(this).css("background-color"));
			}
			else {
				$($.format("<span><b>%s</b></span>", $(this).data("word")))
				.appendTo($parent);
			}
				
		});
		
		$("</label><input id='wordclassChk' type='checkbox' /><label rel='localize[show_wordclass]' for='wordclassChk'>").appendTo($parent)
		.change(function() {
			if($(this).is(":checked")) {
				$("#results-lemgram .wordclass_suffix").show();
			}
			else {
				$("#results-lemgram .wordclass_suffix").hide();
			}
		
		}).filter("label").css("margin-left", "5px");
		
		util.localize();
	},
	
	renderTables : function (lemgram, data) {
		var self = this;
//			"_" represents the actual word in the order
		var order = {
			vb : "SS,_,IO,OO,OA,RA,TA".split(","),
			nn : "AT,_,ET".split(","),
			av :"_,AT".split(",")
		};
		var wordClass = util.splitLemgram(lemgram)[1].slice(0, 2);
		
		if(order[wordClass] == null) {
			this.showNoResults();
			return;
		}
		
		$.log("wordClass", lemgram, wordClass);
		var relMapping = {};
		var sortedList = [];
		$.each(data, function(index, item) {
			var toIndex = $.inArray(item.rel, order[wordClass]);
			if(toIndex == -1) {
				$.log("getting rel index failed for " + item.rel);
				return;
			}
			if(!sortedList[toIndex]) sortedList[toIndex] = [];
			sortedList[toIndex].push(item); 
		});
		
		$.each(sortedList, function(index, list) {
			if(list) {
				list.sort(function(first, second) {
					return second.freq - first.freq;
				});
			}
		});
		var toIndex = $.inArray("_", order[wordClass]);
		sortedList.splice(toIndex, 0, {"word" : util.lemgramToString(lemgram).split(" ")[0]});
		sortedList = $.grep ( sortedList, function(item, index){
			return Boolean(item);
		});
		
		$("#lemgramRowTmpl").tmpl(sortedList, {lemgram : lemgram, isAdj : wordClass == "av"})
		.appendTo("#results-lemgram")
		.addClass("lemgram_result")
		.find("#example_link").addClass("ui-icon ui-icon-document")
		.css("cursor", "pointer")
		.click($.proxy(this.onClickExample, this));
		
		// splits up the label
		$("#results-lemgram td:first-child").each(function() {
			var $siblings = $(this).parent().siblings().find("td:first-child");
			
			var siblingLemgrams = $.map($siblings, function(item) {
				return $(item).data("lemgram").slice(0, -1);
			});
			var hasHomograph = $.inArray($(this).data("lemgram").slice(0, -1), siblingLemgrams) != -1;
			var prefix = $(this).data("depextra").length ? $(this).data("depextra") + " " : "";
//				prefix = "";
			$(this).html(prefix + util.lemgramToString($(this).data("lemgram"), hasHomograph));
			
		});
		$("#results-lemgram .wordclass_suffix").hide();
			
		this.renderHeader(wordClass);
		//$('#results-wrapper').show();
		util.localize();
		this.hidePreloader();
	},
	
	onClickExample : function(event) {
		$("#dialog").remove();
		var self = this;
		this.showPreloader();
		var $target = $(event.currentTarget);
		$.ajax({ url : settings.cgi_script, 
			data:{
				command : 'relations_sentences',
				head : $target.data("head"),
				dep : $target.data("dep"),
				rel : $target.data("rel"),
				depextra : $target.data("depextra"),
				corpus : $target.data("corpus").split(",")
			},
			success: function(data) {
				$.log("example success", data);
				self.hidePreloader();
				if(data.ERROR) {
					$.error($.dump(data));
					return;
				} else if(data.hits == 0) {
					$.log("An error has occurred: no results from example, head: " + $target.data("head"));
					var pElems = $("<i>An error occurred while fetching examples.</i>");
				} else {
					var pElems = $.map(data.kwic, function(sentence) {
						return $.format("<li>%s</li>", $.map(sentence.tokens, function(token, i) {
							var prefix = postfix = "";
							if(sentence.match.start == i)
								prefix = "<b>";
							else if(sentence.match.end == (i))
								postfix = "</b>";
							return prefix + token.word + postfix;
						}).join(" ").replace(/\s([\.,\:])/g, "$1"));
					}).join("\n");
				}
				
				
				$($.format("<div id='dialog' title='%s'></div>", util.getLocaleString("example_dialog_header")))
				.appendTo("#results-lemgram").append("<ol />")
				.dialog({
					width : 600,
					height : 500
				})
				.find("ol").html(pElems);
			}
		});
	},
	
	showNoResults : function() {
		this.hidePreloader();
		$("#results-lemgram")
		.append($.format("<p><i rel='localize[no_lemgram_results]'>%s</i></p>", util.getLocaleString("no_lemgram_results")));
	},
	
	hideWordclass : function() {
		$("#results-lemgram td:first-child").each(function() {
			$(this).html($.format("%s <span class='wordClass'>%s</span>", $(this).html().split(" ")));
		});
	}
	
};

formatOutput = function(x) { // Use "," instead of "." if Swedish
	return x.replace(".",",");
};

function newDataInPie(dataName, horizontalDiagram) {
	var dataItems = new Array();
	
	var wordArray = [];
	var corpusArray = [];
	
		
	
	
	if (horizontalDiagram) { // hits/corpus
		
		$.each(statsResults.savedData["corpora"], function(corpus, obj) {
			if(dataName == "SIGMA_ALL") {
				// ∑ selected
				var totfreq = 0;
				$.each(obj["absolute"], function(wordform, freq) {
					var numFreq = parseInt(freq);
					if(numFreq)
						totfreq += numFreq;
				});
				dataItems.push({"value":totfreq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + totfreq, "shape_id":"sigma_all"});
			} else {
				// Individual wordform selected
				
				var freq = parseInt(obj["absolute"][dataName]);
				if (freq) {
					dataItems.push({"value":freq, "caption":settings.corpora[corpus.toLowerCase()]["title"] + ": " + freq, "shape_id":dataName});
				} else {
					dataItems.push({"value":0, "caption" : "", "shape_id" : dataName});
				}
			}
		});
		
		$("#dialog").remove();
		
		var topheader;
		if(dataName == "SIGMA_ALL")
			topheader = "Träffar för lemgrammet";
		else
			topheader = "Träffar för <i>" + dataName + "</i>";
		$($.format('<div id="dialog" title="' + topheader + '"></div>'))//util.getLocaleString("example_dialog_header")))
							.appendTo("#results-lemgram").append('<div id="chartFrame" style="height:260px;"></div><p style="text-align:center">Träffar i absoluta tal.</p>')
							.dialog({
								width : 300,
								height : 400
							});
		stats2Instance = $('#chartFrame').pie_widget({container_id: "chartFrame", data_items: dataItems, bar_horizontal: false, diagram_type: 0});
		
	} else { // hits/wordform
		$.each(statsResults.savedData["corpora"], function(corpus, obj) {
			if(corpus == "time") return;
			corpusArray.push(corpus);
			$.each(obj["relative"], function(word, freq) {
				if($.inArray(word, wordArray) == -1)
					wordArray.push(word);
			});
		});
	
		$.each(statsResults.savedData["corpora"], function(corpus, obj) {
			if(corpus == dataName) {
				//$.each(obj, function(word, freq) {
				//	dataItems.push({"value":freq, "caption": word + ": " + freq, "shape_id" : word});
				//});
				$.each(wordArray, function(key, fvalue) {
					var freq = obj["relative"][fvalue];
					if (freq) {
						dataItems.push({"value":parseFloat(obj["relative"][fvalue]), "caption" : fvalue, "shape_id" : fvalue});
					} else {
						dataItems.push({"value":0, "caption" : fvalue, "shape_id" : fvalue});
					}
				});
				return false; // break it
			}
		});
		
		statsResults.selectedCorpus = dataName;
		diagramInstance.pie_widget("newData", dataItems);
		$(".statstable").css({"background-color":"white"});
		$(".statstablecorpus__" + dataName).css({"background-color":"#EEEEEE"});
	//diagramInstance = $('#circle_diagram').pie_widget({container_id: "circle_diagram", data_items: dataItems});
	}
}


var StatsResults = {
	Extends : view.BaseResults,
//	initialize : function(tabSelector, resultSelector) {
//	},
	
	renderResult : function(data) {
		var resultError = this.parent(data);
		if(resultError === false) {
			return;
		}
		
		$("#results-stats").children().empty();
		
		var wordArray = [];
		var corpusArray = [];
		
		var absdata;
		var reldata;
		
		$.each(data["corpora"], function(corpus, obj) {
			corpusArray.push(corpus);
			$.each(obj["relative"], function(word, freq) {
				if($.inArray(word, wordArray) == -1)
					wordArray.push(word);
			});
		});
		
		if(!$.all($.map(data["corpora"], function(item) { //if data only contains empty objects, display message
			return !$.isEmptyObject(item);
		}))) {
			this.showNoResults();
			return;
		}
		
		//$("#results-wraper").show();
		//$("#statTableTmpl").tmpl(data["corpora"], {wordArray : wordArray, corpusArray : corpusArray})
		//.appendTo("#results-stats");
		
		var totalForWordform = [];
		var totalForWordformAbs = [];
		$.each(wordArray, function(key, fvalue) {
			totalForWordform.push(0);
			totalForWordformAbs.push(0);
		});
		var totalForCorpus = [];
		var totalForCorpusAbs = [];
		$.each(corpusArray, function(key, fvalue) {
			totalForCorpus.push(0);
			totalForCorpusAbs.push(0);
		});
		
		
		var dataItems = new Array();
		var dummy;
		var firstIteration = true;
		var bc = 0;
		$.each(data["corpora"], function(corpus, obj) {
			var c = 0;
			$.each(wordArray, function(key, fvalue) {
				
				if(obj["relative"])
					var rel_freq = obj["relative"][fvalue];
				if(obj["absolute"])
					var abs_freq = obj["absolute"][fvalue];
				
				if (rel_freq) {
					totalForWordform[c] += parseFloat(rel_freq);
					totalForWordformAbs[c] += abs_freq;
					totalForCorpus[bc] += parseFloat(rel_freq);
					totalForCorpusAbs[bc] += abs_freq;
				}
						
				c++;
			});

			
			if(firstIteration) // ändra sen så att "alla" blir default
				dummy = corpus;
			firstIteration = false;
			bc++;
		});
		
		this.selectedCorpus = dummy;
		$(".statstablecorpus__" + this.selectedCorpus).css({"background-color":"#EEEEEE"});

		// Make Left Stats Table --------------------------------------------------------- //
		
		var leftHTML = '<table class="statisticWords"><th style="height:60px;"><span style="color:white">-<br/>-</span></th>';
		$.each(wordArray, function(key, fvalue) {
			leftHTML += '<tr style="height:26px"><td>'+ fvalue + ' <a class="wordsName" id="wordstable__' + fvalue + '" href="javascript:void(0)"><img src="img/stats2.png" style="border:0px"/></a></td></tr>';
		});
		leftHTML += '<tr><td>∑ <a class="wordsName" id="wordstableTotal" href="javascript:void(0)"><img src="img/stats2.png" style="border:0px"/></a></td></tr></table>';
		
		function makeEllipsis(str) {
			if(str.length > 18) {
				return str.substr(0,14) + "...";
			} else {
				return str;
			}
		}
		
		$("#leftStatsTable").append(leftHTML);
		
		
		// Make Right Stats Table -------------------------------------------------------- //
		
		var theHTML = '<table style="border-collapse:collapse;border-spacing:0px;border-style:hidden"><th><i>Samtliga</i><br/><a class="corpusNameAll" href="javascript:void(0)"><img src="img/stats.png" style="border:0px"/></a></th>';
		$.each(corpusArray, function(key, fvalue) {
			theHTML += '<th style="height:60px">' + makeEllipsis(settings.corpora[fvalue.toLowerCase()]["title"]).replace(/ /g,"&nbsp;") + '<br/><a class="corpusName" id="corpustable__' + fvalue + '" href="javascript:void(0)"><img src="img/stats.png" style="border:0px"/></a></th>'; // ___/ /g___ Funkar inte ordentligt i Chrome!
		});
		var c = 0;
		var totalForAllWordforms = 0;
		var totalForAllWordformsAbs = 0;
		$.each(wordArray, function(key, fvalue) {
			theHTML += '<tr style="height:26px; width:60px;">';
			// First the value for ALL corpora
			var relTotForWordform = data["total"]["relative"][fvalue];
			var absTotForWordform = data["total"]["absolute"][fvalue];
			theHTML += '<td id="totcorpus__' + fvalue + '" class="statstable statstable__all">' + formatOutput(relTotForWordform.toFixed(1)) + '&nbsp;<span class="absStat">(' + formatOutput(absTotForWordform.toString()) + ")</span></td>";
			totalForAllWordforms += relTotForWordform;
			totalForAllWordformsAbs += absTotForWordform;
			//theHTML += '<td id="totcorpus_' + c + '" class="statstable">' + formatOutput(totalForWordform[c].toFixed(1)) + '&nbsp;<span class="absStat">(' + totalForWordformAbs[c] + ")</span></td>";
			// Then for each corpus seperately
			$.each(corpusArray, function(gkey, gvalue) {
				var rel_hits = data["corpora"][gvalue]["relative"][fvalue];
				var abs_hits = data["corpora"][gvalue]["absolute"][fvalue];
				
				if (rel_hits) {
					rel_hits = parseFloat(rel_hits);
					theHTML += '<td id="statstable__' + gvalue + '__' + fvalue + '" class="statstable statstablecorpus__' + gvalue +'">' + formatOutput(rel_hits.toFixed(1)) + '&nbsp;<span class="absStat">(' + abs_hits + ')</span></td>';
				} else {
					theHTML += '<td class="statstable statstablecorpus__' + gvalue + '"></td>';
				}
			});
			theHTML += '</tr>';
			c++;
		});
		
		//sum = function(o) { // Helper Method
		//	for(var s = 0, i = o.length; i; s += o[--i]);
		//	return s;
		//};
		
		theHTML += '<tr><td>' + totalForAllWordforms.toFixed(1) + '&nbsp;<span class="absStat">(' + totalForAllWordformsAbs + ')</span></td>';
		$.each(totalForCorpus, function(key, fvalue) {
			theHTML += '<td>' + formatOutput(fvalue.toFixed(1)) + '&nbsp;<span class="absStat">(' + totalForCorpusAbs[key] + ')</span></td>';
		});
		theHTML += '</tr></table>';

		$("#rightStatsTable").append(theHTML);

		
		$("#rightStatsTable").css("max-width", $("#rightStatsTable").parent().width() - ($("#leftStatsTable").width() + $("#stats1_diagram").width() + 20));
		
		
	
		$(".statstable__all").css({"background-color":"#EEEEEE"});
		
		$(".statstable").tooltip({
			delay : 80,
			bodyHandler : function() {
				if(!$(this).attr('id'))
					return "relativ frekvens (per en miljon ord):<br/><b>0</b><br>absolut frekvens:<br/><b>0</b>";
				var parts = $(this).attr('id').split("__");
				if(parts.length == 3) {
					var hoveredCorpus = parts[1];
					var hoveredWord = parts[2];
					var relFreq = statsResults.savedData["corpora"][hoveredCorpus]["relative"][hoveredWord];
					if(!relFreq)
						relFreq = 0;
					var absFreq = statsResults.savedData["corpora"][hoveredCorpus]["absolute"][hoveredWord];
					return "relativ frekvens (per en miljon ord):<br/><b>" + formatOutput(relFreq.toString()) +"</b><br/>absolut frekvens:<br/><b>" + absFreq + "</b>";
				} else if (parts.length == 2) {
					// Left total
					return "relativ frekvens (per en miljon ord):<br/><b>" + statsResults.savedData["total"]["relative"][parts[1]] + "</b><br/>absolut frekvens:<br/><b>" + statsResults.savedData["total"]["absolute"][parts[1]] + "</b>";
					//return "relativ frekvens (per en miljon ord):<br/><b>" + formatOutput(totalForWordform[parts[1]].toString()) + "</b><br/>absolut frekvens:<br/><b>" + totalForWordformAbs[parts[1]] + "</b>";
				} else {
					return "relativ frekvens (per en miljon ord):<br/><b>0</b><br>absolut frekvens:<br/><b>0</b>";
				}
			}
		});



		// Make Bar Diagram ------------------------------------------------------- //
		$.each(totalForWordform, function(key, fvalue) {
			dataItems.push({"value":fvalue, "caption" : wordArray[key], "shape_id" : wordArray[key]});
		});
		
		
		diagramInstance = $('#stats1_diagram').pie_widget({container_id: "stats1_diagram", data_items: dataItems});
		
		$(".corpusName").click(function() {
			var parts = $(this).attr("id").split("__");
			newDataInPie(parts[1],false);
		});
		
		$(".corpusNameAll").click(function() {
			newDataInPie("all",false);
		});
		
		$(".wordsName").click(function() {
			var parts = $(this).attr("id").split("__");
			if(parts.length == 2)
				newDataInPie(parts[1],true);
			else { // The ∑ row
				newDataInPie("SIGMA_ALL",true);
			}
		});
		// ------------------------------------------------------------------------ //
		
		$(".statstable").hover(function() {
			if(!$(this).attr('id'))
					return;
			var currItem = $(this).attr('id');
			var parts = currItem.split("__");
			if (parts[1] == statsResults.selectedCorpus) {
				diagramInstance.pie_widget("highlightArc",parts[2]);
			}
		}, function() {
			if(!$(this).attr('id'))
					return;
			var currItem = $(this).attr('id');
			var parts = currItem.split("__");
			if (parts[1] == statsResults.selectedCorpus) {
				diagramInstance.pie_widget("deHighlightArc",parts[2]);
			}
		});
		//$("#results-stats").append($("<div />").css("clear", "both"));
		
		
		
		this.hidePreloader();
		
		
	},
	
	showError : function() {
		this.hidePreloader();
		$("<i rel='localize[error_occurred]>")
		.text(util.getLocaleString("error_occurred"))
		.appendTo("#results-stats");
	},
	
	showNoResults : function() {
		this.hidePreloader();
		$("<i rel='localize[no_stats_results]' />")
		.text(util.getLocaleString("no_stats_results"))
		.appendTo("#results-stats");
	}
	
};

view.KWICResults = new Class(KWICResults);
view.LemgramResults = new Class(LemgramResults);
view.StatsResults = new Class(StatsResults);
delete KWICResults;
delete LemgramResults;
delete StatsResults;