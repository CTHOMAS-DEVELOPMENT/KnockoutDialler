Number.prototype.padLeft = function (n,str){
    return Array(n-String(this).length+1).join(str||'0')+this;
}

let model = 
{
	init: function() {
		//These variables do not need to be set as "observables"
		this.numberValidatedLength=11;
		this.initialMessage="Enter Number";
		
		//Knockout "observables": observable, observableArray and computed
		this.numbers = ko.observableArray([]);//To hold an array of objects {number:x ,callcount:x }
		this.currentNumber=ko.observable(this.initialMessage);
		this.dialable = ko.computed(
			function(){
				return this.currentNumber().length===this.numberValidatedLength;
			},this);
		this.totalCallsMade = ko.computed(
			function(){
				let totalCallsMade=0;
				this.numbers().forEach( function (nextnumber)
				{
					totalCallsMade+=nextnumber.callcount;
				})
				return totalCallsMade;
			},this);
		//Report headers
		this.reportTitle=ko.observable("");
		this.reportColumn1=ko.observable("");
		this.reportColumn2=ko.observable("");
	},
	dynamicSort: function(property) {
		let sortOrder = 1;
		if(property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1);
		}
		return function (a,b) {
			let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
		}
	},
	setStorage: function()
	{
		let duplicateFound=false;
		let BreakException = {};
		let self=this;
		////////////////////////////////////////////////////////////////////////////////////////////
		//Go through the previous numbers looking to update the object array with the one new number
		////////////////////////////////////////////////////////////////////////////////////////////
		try{
			self.numbers().forEach( function (nextnumber)
			{
				//Numbers match, just update the callcount and exit
				if(nextnumber.number===self.currentNumber())
				{
					duplicateFound=true;
					nextnumber.callcount++;
					throw BreakException;
				}
			});
		}
		catch(err)
		{
			if (err !== BreakException) throw err;
		}
		/////////////////////////////////////////
		//If it's a new number add it to the list
		/////////////////////////////////////////
		if(!duplicateFound)
		{
			this.numbers().push( {number:this.currentNumber(), callcount:1  });
		}
		////////////////////////////////////////////////////////
		//Sort by call count with the highest call counts on top
		////////////////////////////////////////////////////////
		this.numbers( this.numbers().sort(this.dynamicSort("-callcount")) );
		localStorage.numbers=JSON.stringify(this.numbers())
		this.numbers( JSON.parse(localStorage.numbers) );
	}
}
let phonepadView = {
	
    init: function() {
		$("#time_display").css("visibility","hidden");
		
		$(".dial_digit").click ( function() {
			if(model.dialable()===false)
			{
				controller.setDialingData($(this)[0].innerText);
			}
		})
		.mouseover(function() {
			$(this).css("backgroundColor","rgb(34, 46, 50)");
		})
		.mouseout(function() {
			$(this).css("backgroundColor","rgb(42, 58, 75)");
		})
		.css( "cursor","pointer" );
	},
	formatTimer: function(hrs, min, sec)
	{
		$("#time_display").html("Call time: "+hrs.padLeft(2)+":"+min.padLeft(2)+":"+sec.padLeft(2));
	},
	turnReportTitlesOn: function()
	{
		model.reportTitle("The 3 most called numbers");
		model.reportColumn1("Numbers");
		model.reportColumn2("Call count");		
	},
	resetDialler: function()
	{
		controller.setCallView("hidden","block","none","block");
		model.setStorage();
		model.currentNumber(model.initialMessage);
		this.turnReportTitlesOn();
	}
}
let controller = {
    setCallView: function(timeDisplay, offcall_footer, oncall_footer, digit_row) {
		clearInterval(this.timer);							//Clear the current instance of the timer
		$("#time_display").css("visibility",timeDisplay);
		$("#offcall_footer").css("display",offcall_footer);
		$("#oncall_footer").css("display",oncall_footer);
		$(".digit_row").css("display",digit_row);
	},
	setDialingData: function(digit) {
		if(!isNaN(digit))
		{
			digit= digit.replace(/\s/g, '');//IE adds a space.			
			model.currentNumber( model.initialMessage===model.currentNumber()?digit:model.currentNumber() + digit );
		}
		else
		{
			//Another character was clicked ('#' or '*')
		}
	},
	updateOncalltime: function( maxseconds ) {
		let startTime=Date.now(); 
		this.timer = setInterval(function() {
			let elapsed	=	Math.round((Date.now() - startTime)/1000);
			let seconds = 	elapsed%60;						//Eg Test Assertion 3730=10
			let minutes = 	((elapsed - seconds)/60)%60;	//Eg Test Assertion 3720=2
			let hours 	= 	(elapsed-seconds-(60*minutes))/3600;						 
			
			phonepadView.formatTimer(hours, minutes, seconds);
			
			if(elapsed >= maxseconds)
			{
				
				//Allow the user to see maximum seconds has been reached before resetting the dialer
				setTimeout(function(){ 
					phonepadView.resetDialler();
				}
				, 500);
			}
		},1000);
	}
}
let ViewModel = function()
{
	model.init();
	phonepadView.init();
	
	this.offcall_button_clicked =  function() {
		controller.setCallView("visible","none","block","none");
		controller.updateOncalltime(10);
	}
	this.oncall_button_clicked =  function() {
		phonepadView.resetDialler();
	}
	if(localStorage.numbers)
	{
		model.numbers( JSON.parse(localStorage.numbers) );
	}
}

ko.applyBindings( new ViewModel() );
