//Discord initialisation
const Discord = require("discord.js");
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

//Node.js imports
var fs = require('fs');

client.once('ready', () => {
	console.log("[Ampersand] is ready. Hello!");
});

/*

TYPES OF UNITS

Infantry
Artillery
Cavalry/Tanks
Battleships/Aircraft Carriers
Submarines/Nuclear Submarines

Fighters/Multirole Fighters
Bombers/Strategic Bombers

*/

//Bot settings
{
	bot_prefix = "$";
	start_date = new Date(2020, 03, 26, 16, 09);
	turn_timer = 60;
	announcements_channel = "701470100674576475";
	authorised_role = "";
}

government_list = ["absolute_monarchy","constitutional_monarchy","communism","democracy","fascism"];

var config = {
	materials: ["coal","food","gold","iron","lead","petrol","stone","wood"],
	buildings: ["coal_mines","gold_mines","iron_mines","lead_mines","quarries","farms","lumberjacks","refineries","mines","workshops","watermills","factories","industrial_complexes","barracks","artillery_factories","auto_plants","aeroports","dockyards"],
	units: ["arquebusiers","musketmen","riflemen","infantry","modern_infantry","bombard","cannons","culverins","field_artillery","howitzers","armoured_cars","tanks","biplanes","bombers","fighters","strategic_bombers","galleons","men_of_war","ironclads","dreadnoughts","battleships","settlers","colonists","administrators"],
	visible_units: ["arquebusiers","musketmen","riflemen","infantry","modern_infantry","bombard","cannons","culverins","field_artillery","howitzers","armoured_cars","tanks","biplanes","bombers","fighters","strategic_bombers","galleons","men_of_war","ironclads","dreadnoughts","battleships","settlers","colonists","administrators"],
	
	ground_units: ["arquebusiers","musketmen","riflemen","infantry","modern_infantry"],
	ground_artillery: ["bombard","cannons","culverins","field_artillery","howitzers"],
	ground_vehicles: ["armoured_cars","tanks"],
	aeroplanes: ["biplanes","bombers","fighters","strategic_bombers"],
	naval_units: ["galleons","men_of_war","ironclads","dreadnoughts","battleships"],
	colonists: ["settlers","colonists","administrators"]
};

let rawdata = fs.readFileSync('database.js');
let main = JSON.parse(rawdata);

function readConfig () {
	let rawconfig = fs.readFileSync('config.txt');
	eval(rawconfig.toString());
}

readConfig();

let rawhelp = fs.readFileSync('help.txt');
var help = rawhelp.toString().replace(/@/g, bot_prefix);

let rawhelp2 = fs.readFileSync('help2.txt');
var help2 = rawhelp2.toString().replace(/@/g, bot_prefix);

let rawbuildcosts = fs.readFileSync('documents/build_costs.txt');
var buildcosts = rawbuildcosts.toString();

let rawbuildcosts2 = fs.readFileSync('documents/build_costs2.txt');
var buildcosts2 = rawbuildcosts2.toString();

let rawunitcosts = fs.readFileSync('documents/unit_costs.txt');
var unitcosts = rawunitcosts.toString();

let rawunitcosts2 = fs.readFileSync('documents/unit_costs2.txt');
var unitcosts2 = rawunitcosts2.toString();

let rawgovernments = fs.readFileSync('documents/governments.txt');
var governments = rawgovernments.toString();

let rawcb = fs.readFileSync('documents/casus_belli.txt');
var cb = rawcb.toString();

let rawcb2 = fs.readFileSync('documents/casus_belli2.txt');
var cb2 = rawcb2.toString();

user = "";
input = "";

building_list = [];
news = [];

//Framework
{
	//Operating functions
		
	function randomNumber(min, max) {  
		return Math.floor(Math.random() * (max - min) + min); 
	}
	
	function saveConfig () {
		var bot_settings = [
			'bot_prefix = "' + bot_prefix + '";',
			'start_date = new Date(2020, 03, 26, 16, 09);',
			'turn_timer = ' + turn_timer + ';',
			'announcements_channel = "' + announcements_channel + '";',
			'authorised_role = "' + authorised_role + '";'
		];
		fs.writeFile('config.txt', bot_settings.join("\n"), function (err,data) {
			if (err) {
				return console.log(err);
			}
			//console.log(data);
		});
	}
	
	function equalsIgnoreCase (arg0, arg1) {
		if (arg0.toLowerCase() == (bot_prefix + arg1).toLowerCase()) {
			return true;
		} else {
			return false;
		}
	}
	
	function returnMention (arg0) {
		
		var mention_id = arg0.replace(/(<)(@)(!)/g,"");
		mention_id = mention_id.replace(/(<)(@)/g,"");
		mention_id = mention_id.replace(">","");
		
		return mention_id;
	}
	
	function returnChannel (arg0) {
		return client.channels.cache.get(arg0);
	}
	
	function parseMilliseconds (duration) {
		var milliseconds = parseInt((duration % 1000) / 100),
		seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

		return hours + " hours, " + minutes + " minutes, " + seconds + " seconds";
	}
	
	function hasRole (arg0_msg, arg1_role) {
		if (arg0_msg.member.roles.cache.some(role => role.name === arg1_role)) {
			return true;
		} else {
			return false;
		}
	}

	function nextTurn (arg0_user) {
		var user_id = main.users[arg0_user];
		var age = main.users[arg0_user].technology_level-1;
		var buildings = main.users[arg0_user]["buildings"];
		var inventory = main.users[arg0_user]["inventory"];
		
		//News variables:
		
		var national_news = "";
		
		var famine_loss = Math.ceil(user_id.population*0.1);
		
		//Building income
		{
			//Actions production
			{
				user_id.actions = user_id.actions + 5; //Base actions
				//Mines (1 action per turn)
				for (var i = 0; i < buildings.mines; i++) {
					user_id.actions++;
				}
				//Workshops (2-3 actions per turn)
				for (var i = 0; i < buildings.workshops; i++) {
					user_id.actions = user_id.actions + randomNumber(2, 3);
				}
				//Watermills (3-5 actions per turn)
				for (var i = 0; i < buildings.watermills; i++) {
					user_id.actions = user_id.actions + randomNumber(3, 5);
				}
				//Factories (5-7 actions per turn)
				for (var i = 0; i < buildings.factories; i++) {
					user_id.actions = user_id.actions + randomNumber(5, 7);
				}
				//Industrial Complexes (6-10 actions per turn)
				for (var i = 0; i < buildings.industrial_complexes; i++) {
					user_id.actions = user_id.actions + randomNumber(6, 10);
				}
			}
			
			//Raw resource production
			{
				for (var i = 0; i < buildings.coal_mines; i++) {
					inventory.coal = inventory.coal + 3;
				}
				for (var i = 0; i < buildings.gold_mines; i++) {
					inventory.gold++;
				}
				for (var i = 0; i < buildings.iron_mines; i++) {
					inventory.iron = inventory.iron + 3;
				}
				for (var i = 0; i < buildings.lead_mines; i++) {
					inventory.lead = inventory.lead + 3;
				}
				for (var i = 0; i < buildings.quarries; i++) {
					inventory.stone = inventory.stone + 5;
				}
				
				for (var i = 0; i < buildings.farms; i++) {
					inventory.food = inventory.food + 3;
				}
				for (var i = 0; i < buildings.lumberjacks; i++) {
					inventory.wood = inventory.wood + 5;
				}
				for (var i = 0; i < buildings.refineries; i++) {
					inventory.petrol = inventory.petrol + 5;
				}
			}
			
			
			//Population:
			
			user_id.money = user_id.money + Math.ceil((user_id.actions*2500)*user_id.tax_rate);
			
			//Food
			if (user_id.population > user_id["inventory"].food*1000000) {
				user_id.population = user_id.population - Math.ceil(user_id.population*0.065); //6,5% population penalty for inadequate food
				national_news = national_news + "\nA famine struck citizens of " + user_id.name + " resulting in " + Math.ceil(user_id.population*0.065) + " fatalities.";
				inventory.food = 0;
			} else {
				user_id.population = Math.ceil(user_id.population*user_id.pop_growth_modifier);
				inventory.food = inventory.food - Math.ceil(user_id.population/1000000);
			}
			user_id.initial_manpower = Math.ceil(user_id.population*user_id.manpower_percentage);
			
			//Upkeep
			if (Math.ceil(user_id.soldiers/100) > user_id.money) {
				national_news = national_news + "\nTroops in the " + user_id.name + " deserted en masse. Analysts estimate up to 15% of their armed forces and even colonists may have quite simply dissipated.";
				
				for (var i = 0; i < config.units.length; i++) {
					user_id["military"][config.units[i]] = Math.ceil(user_id["military"][config.units[i]]*0.85);
					user_id.used_manpower = user_id.used_manpower - user_id.soldiers*0.15;
					user_id.soldiers = user_id.soldiers - user_id.soldiers*0.15;
				}
				
			}
		}
		
		//Politics
		{
			//Stability and revolt risk
			{
				var stab_tax_rate = user_id.tax_rate*100;
				var stab_party_popularity = (user_id["politics"][user_id.government]);
				var stab_government_modifier = 0;
				
				if (user_id.government != "communism" && user_id.government != "fascism" && user_id.government != "dictatorship" && user_id.government != "monarchy") {
					stab_government_modifier = 5;
				} else {
					stab_government_modifier = -5;
				}
				
				user_id.stability = Math.ceil(stab_party_popularity + stab_government_modifier - stab_tax_rate - 15);
				
				if (user_id.stability > 100) {
					user_id.stability = 100;
				} else if (user_id.stability < 0) {
					user_id.stability = 0;
				}
				
				var dice_roll = randomNumber(0, 100);
				if (dice_roll > user_id.stability+30 || user_id.coup_this_turn == true) {
					user_id.tax_rate = 0;
					var new_government = "";
					//Revolt
					if (user_id.government == "absolute_monarchy") {
						setGovernment(user_id, "constitutional_monarchy");
						new_government = "constitutional monarchy";
					} else if (user_id.government == "constitutional_monarchy") {
						setGovernment(user_id, "democracy");
						new_government = "democracy";
					} else if (user_id.government == "communism") {
						setGovernment(user_id, "absolute_monarchy");
						new_government = "absolute monarchy";
					} else if (user_id.government == "democracy") {
						setGovernment(user_id, "fascism");
						new_government = "fascism";
					} else if (user_id.government == "fascism") {
						setGovernment(user_id, "communism");
						new_government = "communism";
					}
					
					national_news = national_news + "The country of " + user_id.name + " fell into a state of civil unrest, allowing supporters of " + user_id.government + " to coup the government!\n";
					national_news = national_news + "Rioters then went on strike, leading the country of " + user_id.name + " to lose all their actions!\n";
					user_id.coup_this_turn = false;
					user_id.actions = 0;
				}
				
				if (user_id.overthrow_this_turn) {
					user_id.tax_rate = 0;
					var new_government = "";
					//Revolt
					if (user_id.government == "absolute_monarchy") {
						setGovernment(user_id, "communism");
						new_government = "communism";
					} else if (user_id.government == "constitutional_monarchy") {
						setGovernment(user_id, "absolute_monarchy");
						new_government = "absolute monarchy";
					} else if (user_id.government == "communism") {
						setGovernment(user_id, "fascism");
						new_government = "fascism";
					} else if (user_id.government == "democracy") {
						setGovernment(user_id, "constitutional_monarchy");
						new_government = "constitutional_monarchy";
					} else if (user_id.government == "fascism") {
						setGovernment(user_id, "democracy");
						new_government = "democracy";
					}
					
					national_news = national_news + "The country of " + user_id.name + " fell into a state of civil unrest, leading supporters of " + user_id.government + " to overthrow the government!\n";
					national_news = national_news + "Rioters then went on strike, leading the country of " + user_id.name + " to lose all their actions!\n";
					user_id.overthrow_this_turn = false;
					user_id.actions = 0;
				}
				
			}
			
			//Civilian Actions
			{
				user_id.civilian_actions = Math.ceil(user_id.actions*user_id.civilian_actions_percentage);
				
				national_news = national_news + "The country of " + user_id.name + " now has " + user_id.actions + " actions, of which " + (Math.ceil(user_id.civilian_actions*0.5) + Math.ceil(user_id.civilian_actions*0.5)) + " were automatically used by the populace.";
				
				mine(arg0_user, "none", Math.ceil(user_id.civilian_actions*0.5));
				forage(arg0_user, "none", Math.ceil(user_id.civilian_actions*0.5));
			}
		}
			
		news.push(national_news);
		
	}
	
	function settle (arg0_user, arg1_msg, arg2_provs) { //arg2_provs is an array type
		var usr = main.users[arg0_user];
		var provs = arg2_provs;
		var prov_checks = 0;
		var has_unit = false;
		var unit_type = "";
		
		if (arg2_provs.length == 1) {
			if (usr.military.settlers > 0) {
				has_unit = true;
				unit_type = "settlers";
			}
		} else if (arg2_provs.length == 3) {
			if (usr.military.colonists > 0) {
				has_unit = true;
				unit_type = "colonists";
			}
		} else if (arg2_provs.length == 5) {
			if (usr.military.administrators > 0) {
				has_unit = true;
				unit_type = "administrators";
			}
		} else {
			has_unit = false;
		}
		
		if (has_unit) {
			for (var i = 0; i < arg2_provs.length; i++) {
				var province_taken = false;
				
				for (var x = 0; x < main.province_array.length; x++) {
					if (main.province_array[x] == arg2_provs[i]) {
						province_taken = true;
					}
				}
				
				if (province_taken == true) {
					prov_checks--;
				} else if (parseInt(arg2_provs) == NaN) {
					prov_checks--;
				} else {
					prov_checks++;
				}
			}
			
			if (prov_checks == arg2_provs.length) {
				for (var i = 0; i < arg2_provs.length; i++) {
					main.province_array.push(arg2_provs[i]);
					usr.provinces++;
				}
				usr.military[unit_type]--;
				
				arg1_msg.channel.send("Settlers from **" + usr.name + "** colonised the province(s) of " + arg2_provs.join(", ") + ". They now have **" + usr.provinces + "** provinces. \n<@213287117017710593> EXPANSION ALERT!");
			} else {
				arg1_msg.channel.send("One of the provinces you have specified turned out to be invalid!");
			}
		} else {
			arg1_msg.channel.send("You have specified an invalid amount of arguments!");
		}
		
		updateBuildings(usr);
	}
	
	function disband (arg0_user, arg1_msg, arg2_unit, arg3_amount) {
		var usr = main.users[arg0_user];
		//"arquebusiers","musketmen","riflemen","infantry","modern_infantry","bombard","cannons","culverins","field_artillery","howitzers","armoured_cars","tanks","biplanes","bombers","fighters","strategic_bombers","galleons","men_of_war","ironclads","dreadnoughts","battleships","settlers","colonists","administrators"
		
		var manpower_costs = [50000, 50000, 50000, 50000, 50000, 20000, 20000, 20000, 20000, 20000, 25000, 25000, 15000, 15000, 20000, 20000, 10000, 20000, 30000, 50000, 100000, 100000, 100000, 50000];
		var quantity = [50000, 50000, 50000, 50000, 50000, 500, 500, 500, 500, 500, 500, 500, 50, 50, 50, 50, 10, 10, 10, 10, 10, 1, 1, 1];
		
		var unit_exists = false;
		var unit_id = 0;
		
		for (var i = 0; i < config.units.length; i++) {
			if (config.units[i] == arg2_unit) {
				unit_exists = true;
				unit_id = i;
			}
		}
		
		if (unit_exists) {
			if (usr["military"][arg2_unit] >= arg3_amount) {
				usr.soldiers = usr.soldiers - Math.ceil(manpower_costs[unit_id]/quantity[unit_id])*arg3_amount;
				usr.used_manpower = usr.used_manpower - Math.ceil(manpower_costs[unit_id]/quantity[unit_id])*arg3_amount;
				usr["military"][arg2_unit] = usr["military"][arg2_unit] - arg3_amount;
				
				arg1_msg.channel.send(arg3_amount + " " + arg2_unit + " were disbanded. You were refunded " + Math.ceil(manpower_costs[unit_id]/quantity[unit_id])*arg3_amount + " manpower.");
			} else {
				arg1_msg.channel.send("You don't have that many **" + arg2_unit + "**!");
			}
		} else {
			arg1_msg.channel.send("The type of unit that you have specified does not exist!");
		}
	}
	
	function demolish (arg0_user, arg1_msg, arg2_building, arg3_amount) {
		var usr = main.users[arg0_user];
		//"coal_mines","gold_mines","iron_mines","lead_mines","quarries","farms","lumberjacks","refineries","mines","workshops","watermills","factories","industrial_complexes","barracks","artillery_factories","auto_plants","aeroports","dockyards"
		
		var manpower_costs = [20000, 50000, 20000, 20000, 20000, 25000, 10000, 50000, 20000, 50000, 40000, 50000, 70000, 20000, 25000, 100000, 50000, 100000];
		
		var building_exists = false;
		var building_id = 0;
		
		for (var i = 0; i < config.buildings.length; i++) {
			if (config.buildings[i] == arg2_building) {
				building_exists = true;
				building_id = i;
			}
		}
		
		if (building_exists) {
			if (usr["buildings"][arg2_building] >= arg3_amount) {
				usr.used_manpower = usr.used_manpower - manpower_costs[building_id];
				usr["buildings"][arg2_building] = usr["buildings"][arg2_building] - arg3_amount;
				
				arg1_msg.channel.send(arg3_amount + " " + arg2_building + " were demolished. You were refunded " + manpower_costs[building_id] + " manpower, and " + arg3_amount + " building slots were freed up.");
			} else {
				arg1_msg.channel.send("You don't have that many **" + arg2_building + "**!");
			}
		} else {
			arg1_msg.channel.send("The type of building that you have specified does not exist!");
		}
		
		updateBuildings(usr);
	}
	
	function mine (arg0_user, arg1_msg, arg2_actions) {
		var user_id = main.users[arg0_user];
		var inventory = main.users[arg0_user]["inventory"];
		var mineable_materials = ["coal", "gold", "iron", "iron", "iron", "lead", "petrol", "stone", "stone"];
		
		//["coal","iron","lead","gold","petrol","wood","rocks"],
		var resource_list = "";
		var out_of_actions = false;
		
		if (arg2_actions < 1001) {
			for (var i = 0; i < arg2_actions; i++) {
				if (user_id.actions > 0) {
					var random_resource = randomElement(mineable_materials);
					user_id.actions--;
					inventory[random_resource] = inventory[random_resource] + 1;
					resource_list = resource_list + (random_resource + ", ");
				} else {
					out_of_actions = true;
				}
			}
		} else {
			arg1_message.channel.send("The number you have specified is too large!");
		}
		
		if (arg1_msg != "none") {
			arg1_msg.channel.send("You dug up " + resource_list + "whilst on your mining haul.");
			if (out_of_actions) {
				arg1_msg.channel.send("You then proceeded to run out of actions.");
			}
		}
	}
	
	function forage (arg0_user, arg1_msg, arg2_actions) {
		var user_id = main.users[arg0_user];
		var inventory = main.users[arg0_user]["inventory"];
		
		var salvaged_wood = 0;
		var out_of_actions = false;
		
		if (arg2_actions < 1001) {
			for (var i = 0; i < arg2_actions; i++) {
				if (user_id.actions > 0) {
					user_id.actions--;
					inventory["wood"] = inventory["wood"] + 1;
					salvaged_wood++;
				} else {
					out_of_actions = true;
				}
			}
		} else {
			arg1_message.channel.send("The number you have specified is too large!");
		}
		
		if (arg1_msg != "none") {
			arg1_msg.channel.send("You chopped " + salvaged_wood + " wood.");
			if (out_of_actions) {
				arg1_msg.channel.send("You then proceeded to run out of actions.");
			}
		}
	}
	
	function sellGold (arg0_user, arg1_msg, arg2_actions) {
		if (main.users[arg0_user] != undefined) {
			var user_id = main.users[arg0_user];
			var inventory = main.users[arg0_user]["inventory"];
			var auction_list = "";
			var out_of_gold = false;
			
			if (arg2_actions < 1001) {
				for (var i = 0; i < arg2_actions; i++) {
					if (inventory.gold > 0) {
						var sold_for = randomNumber(800, 1350);
						inventory.gold--;
						user_id.money = user_id.money + sold_for;
						auction_list = auction_list + "£" + sold_for.toString() + ", ";
					} else {
						out_of_gold = true;
					}
				}
			} else {
				arg1_message.channel.send("The number you have specified is too large!");
			}
			
			if (auction_list == "") {
				arg1_msg.channel.send("You don't even have gold!");
			} else {
				arg1_msg.channel.send("You sold " + arg2_actions + " gold for " + auction_list + " on the auction block.");
				if (out_of_gold) {
					arg1_msg.channel.send("You then proceeded to run out of gold.");
				}
			}
		} else {
			arg1_msg.channel.send("You don't even have a country!");
		}
	}
	
	function sellPetrol (arg0_user, arg1_msg, arg2_actions) {
		if (main.users[arg0_user] != undefined) {
			var user_id = main.users[arg0_user];
			var inventory = main.users[arg0_user]["inventory"];
			var auction_list = "";
			var out_of_petrol = false;
			
			if (arg2_actions < 1001) {
				for (var i = 0; i < arg2_actions; i++) {
					if (inventory.petrol > 0) {
						var sold_for = randomNumber(750, 1000);
						inventory.petrol--;
						user_id.money = user_id.money + sold_for;
						auction_list = auction_list + "£" + sold_for.toString() + ", ";
					} else {
						out_of_petrol = true;
					}
				}
			} else {
				arg1_message.channel.send("The number you have specified is too large!");
			}
			
			if (auction_list == "") {
				arg1_msg.channel.send("You don't even have petrol!");
			} else {
				arg1_msg.channel.send("You sold " + arg2_actions + " petrol for " + auction_list + " on the auction block.");
				if (out_of_petrol) {
					arg1_msg.channel.send("You then proceeded to run out of petrol.");
				}
			}
		} else {
			arg1_msg.channel.send("You don't even have a country!");
		}
	}
	
	function setGovernment (arg0_user, arg1_type) {
		var user_id = arg0_user;
		user_id.government = arg1_type;
		user_id["politics"][arg1_type] = 100;
		if (arg1_type == "absolute_monarchy") {
			user_id.manpower_percentage = 0.05;
			user_id.max_tax = 0.65;
			user_id.civilian_actions_percentage = 0.10;
		} else if (arg1_type == "constitutional_monarchy") {
			user_id.manpower_percentage = 0.20;
			user_id.max_tax = 0.35;
			user_id.civilian_actions_percentage = 0.35;
		} else if (arg1_type == "communism") {
			user_id.manpower_percentage = 0.50;
			user_id.max_tax = 0.05;
			user_id.civilian_actions_percentage = 0.00;
		} else if (arg1_type == "democracy") {
			user_id.manpower_percentage = 0.25;
			user_id.max_tax = 0.70;
			user_id.civilian_actions_percentage = 0.50;
		} else if (arg1_type == "fascism") {
			user_id.manpower_percentage = 0.10;
			user_id.max_tax = 0.70;
			user_id.civilian_actions_percentage = 0.20;
		}
	}
	
	//Command functions
	{
		function randomElement (arg0_array) {
			return arg0_array[Math.floor(Math.random() * arg0_array.length)];
		}
		
		function initVar (arg0_variable, arg1_value) {
			if (arg0_variable == undefined) {
				arg0_variable = arg1_value;
			}
		}
		
		function updateBuildings (arg0_user) {
			var usr = arg0_user;
			var total_buildings = 0;
			
			for (var i = 0; i < config.buildings.length; i++) {
				total_buildings = total_buildings + usr["buildings"][config.buildings[i]];
			}
			
			usr.building_cap = usr.provinces*5 + 10;
			usr.building_count = total_buildings;
		}
		
		function initUser (arg0_user) {
			var current_user = arg0_user.toString();
			var already_registered = false;
			for (var i = 0; i < main.user_array.length; i++) {
				if (main.user_array[i] == current_user) {
					already_registered = true;
				}
			}
			
			//Customisation
			
			if (main.users[current_user] == undefined) { main.users[current_user] = {}; }
			if (main.users[current_user].name == undefined) { main.users[current_user].name = ""; }
			if (main.users[current_user].government == undefined) { main.users[current_user].government = ""; }
			if (main.users[current_user].technology_level == undefined) { main.users[current_user].technology_level = 3; }
			if (main.users[current_user].population == undefined) { main.users[current_user].population = 10000000; }
			
			if (main.users[current_user].motto == undefined) { main.users[current_user].motto = 'No motto set.'; }
			
			if (main.users[current_user].initial_manpower == undefined) { main.users[current_user].initial_manpower = 5000000; }
			if (main.users[current_user].manpower_percentage == undefined) { main.users[arg0_user].manpower_percentage = 0.50; }
			if (main.users[current_user].used_manpower == undefined) { main.users[current_user].used_manpower = 0; }
			if (main.users[current_user].soldiers == undefined) { main.users[current_user].soldiers = 0; }
			
			if (main.users[current_user].money == undefined) { main.users[current_user].money = 10000; }
			if (main.users[current_user].stability == undefined) { main.users[current_user].stability = 75; }
			if (main.users[current_user].coup_this_turn == undefined) { main.users[current_user].coup_this_turn = false; }
			if (main.users[current_user].overthrow_this_turn == undefined) { main.users[current_user].overthrow_this_turn = false; }
			
			if (main.users[current_user].news_this_turn == undefined) { main.users[current_user].news_this_turn = ""; }
			
			//Modifiers
			if (main.users[current_user].tax_rate == undefined) { main.users[current_user].tax_rate = 0; }
			if (main.users[current_user].max_tax == undefined) { main.users[current_user].max_tax = 0; }
			if (main.users[current_user].pop_available == undefined) { main.users[current_user].pop_available = 0.5; }
			
			if (main.users[current_user].production_buildings_modifier == undefined) { main.users[current_user].production_buildings_modifier = 1; }
			if (main.users[current_user].pop_growth_modifier == undefined) { main.users[current_user].pop_growth_modifier = 1.0539; }
			
			if (main.users[current_user].infamy == undefined) { main.users[current_user].infamy = 0; }
			
			//Building cap
			if (main.users[current_user].provinces == undefined) { main.users[current_user].provinces = 0; }
			if (main.users[current_user].building_count == undefined) { main.users[current_user].building_count = 0; }
			if (main.users[current_user].building_cap == undefined) { main.users[current_user].building_cap = 10; }
			
			//Sub-objects
			if (main.users[current_user]["inventory"] == undefined) { main.users[current_user]["inventory"] = {}; }
			if (main.users[current_user]["buildings"] == undefined) { main.users[current_user]["buildings"] = {}; }
			if (main.users[current_user]["military"] == undefined) { main.users[current_user]["military"] = {}; }
			if (main.users[current_user]["politics"] == undefined) { main.users[current_user]["politics"] = {}; }
			
			//Crafting values
			if (main.users[current_user].actions == undefined) { main.users[current_user].actions = 10; }
			
			if (main.users[current_user].civilian_actions == undefined) { main.users[current_user].civilian_actions = 0; }
			if (main.users[current_user].civilian_actions_percentage == undefined) { main.users[current_user].civilian_actions_percentage = 0; }
			
			//Modifiers - Only staff can set these
			if (main.users[current_user].blockaded == undefined) { main.users[current_user].blockaded = false; }
			
			//Add all materials to inventory
			for (var i = 0; i < config.materials.length; i++) {
				if (main.users[current_user]["inventory"][config.materials[i]] == undefined) { main.users[current_user]["inventory"][config.materials[i]] = 0; }
			}
			
			//Add all buildings
			for (var i = 0; i < config.buildings.length; i++) {
				if (main.users[current_user]["buildings"][config.buildings[i]] == undefined) { main.users[current_user]["buildings"][config.buildings[i]] = 0; }
			}
			
			//Add all political parties
			for (var i = 0; i < government_list.length; i++) {
				if (main.users[current_user]["politics"][government_list[i]] == undefined) { main.users[current_user]["politics"][government_list[i]] = 0; }
			}
			
			//Add all military units
			for (var i = 0; i < config.units.length; i++) {
				if (main.users[current_user]["military"][config.units[i]] == undefined) { main.users[current_user]["military"][config.units[i]] = 0; }
			}
			
			if (main.users[current_user].last_election == undefined) { main.users[current_user].last_election = 0; }
			
			if (already_registered == false) {
				main.user_array.push(current_user);
				main.users[current_user].technology_level = 1;
				main.users[current_user]["inventory"].food = 50;
				main.users[current_user]["military"].settlers = 1;
			}
		}
		
		function modifyItem (arg0_user, arg1_amount, arg2_item, arg3_mode) {
			
			var current_user = arg0_user.toString();
			
			if (arg3_mode == "add") {
				if (main.users[current_user] == undefined) {
					initUser(current_user);
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] + parseInt(arg1_amount);
				} else {
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] + parseInt(arg1_amount);
				}
			} else if (arg3_mode == "remove") {
				if (main.users[current_user] == undefined) {
					initUser(current_user);
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] - parseInt(arg1_amount);
				} else {
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] - parseInt(arg1_amount);
				}
			}
			
		}
		
		function give (arg0_user, arg1_user2, arg2_amount, arg3_item, arg4_mode, arg5_message) {
			if (main.users[arg0_user] != undefined) {
				var usr = main.users[arg0_user];
				var other_usr_id = arg1_user2.replace(/(<)(@)(!)/g,"");
				var other_usr_id = arg1_user2.replace(/(<)(@)/g,"");
				var other_usr = main.users[other_usr_id];
				
				var inventory = main.users[arg0_user]["inventory"];
				console.log(other_usr_id);
				if (arg4_mode == "item") {
					if (arg3_item == "money") {
						if (usr.money >= arg2_amount) {
							usr.money = parseInt(usr.money) - parseInt(arg2_amount);
							other_usr.money = parseInt(other_usr.money) + parseInt(arg2_amount);
							arg5_message.channel.send("You sent <@" + other_usr_id + "> " + arg2_amount + " money.");
						} else {
							arg5_message.channel.send("You were unable to execute this command due to a shortage of money.");
						}
					} else {
						var item_exists = false;
						for (var i = 0; i < config.materials.length; i++) {
							if (arg3_item == config.materials[i]) {
								item_exists = true;
							}
						}
						if (item_exists) {
							if (inventory[arg3_item] >= arg2_amount) {
								inventory[arg3_item] = parseInt(inventory[arg3_item]) - parseInt(arg2_amount);
								other_usr["inventory"][arg3_item] = parseInt(other_usr["inventory"][arg3_item]) + parseInt(arg2_amount);
								arg5_message.channel.send("You gave <@" + other_usr_id + "> " + arg2_amount + " " + arg3_item + ".");
							} else {
								arg5_message.channel.send("You were unable to execute this command due to a shortage of items.");
							}
						} else {
							arg5_message.channel.send("The item you are trying to send is nonexistent!");
						}
					}
				} else if (arg4_mode == "industry") {
					var building_exists = false;
					for (var i = 0; i < config.buildings.length; i++) {
						if (arg3_item == config.buildings[i]) {
							building_exists = true;
						}
					}
					if (building_exists) {
						if (usr["buildings"][arg3_item] >= arg2_amount) {
							usr["buildings"][arg3_item] = parseInt(usr["buildings"][arg3_item]) - parseInt(arg2_amount);
							other_usr["buildings"][arg3_item] = parseInt(other_usr["buildings"][arg3_item]) + parseInt(arg2_amount);
							arg5_message.channel.send("You gave <@" + other_usr_id + "> " + arg2_amount + " " + arg3_item + ".");
						} else {
							arg5_message.channel.send("You were unable to execute this command due to a shortage of buildings.");
						}
					} else {
						arg5_message.channel.send("The item you are trying to send is nonexistent!");
					}
				} else if (arg4_mode == "military") {
					var unit_exists = false;
					for (var i = 0; i < config.units.length; i++) {
						if (arg3_item == config.units[i]) {
							unit_exists = true;
						}
					}
					if (unit_exists) {
						if (usr["military"][arg3_item] >= arg2_amount) {
							usr["military"][arg3_item] = parseInt(usr["military"][arg3_item]) - parseInt(arg2_amount);
							other_usr["military"][arg3_item] = parseInt(other_usr["military"][arg3_item]) + parseInt(arg2_amount);
							arg5_message.channel.send("You gave <@" + other_usr_id + "> " + arg2_amount + " " + arg3_item + ".");
						} else {
							arg5_message.channel.send("You were unable to execute this command due to a shortage of military units.");
						}
					} else {
						arg5_message.channel.send("The item you are trying to send is nonexistent!");
					}
				}
			} else {
				arg5_message.channel.send("The person you are trying to give items to doesn't even have a country!");
			}
		}
		
		function printInv (arg0_user, arg1_username, arg2_msg) {
			var inv_string = [];
			
			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for has no inventory!");
			} else {
			
				inv_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				inv_string.push("------------------ \n**Materials:**\n");
				
				for (var i = 0; i < config.materials.length; i++) {
					if (main.users[arg0_user]["inventory"][config.materials[i]] != undefined) {
						inv_string.push("**" + config.materials[i] + "**: " + main.users[arg0_user]["inventory"][config.materials[i]]);
					}
				}
					
				arg2_msg.channel.send(inv_string.join("\n"));
				
				
			}
		}
		
		function printBuildings (arg0_user, arg1_username, arg2_msg) {
			var building_string = [];
			
			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for is stateless!");
			} else {
				building_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				building_string.push("------------------ \n :homes: **Industry:**\n");
						
				var minimum = (main.users[arg0_user]["buildings"]["mines"] + main.users[arg0_user]["buildings"]["workshops"]*2 + main.users[arg0_user]["buildings"]["watermills"]*3 + main.users[arg0_user]["buildings"]["factories"]*5 + main.users[arg0_user]["buildings"]["industrial_complexes"]*6)+5;
				var maximum = (main.users[arg0_user]["buildings"]["mines"] + main.users[arg0_user]["buildings"]["workshops"]*3 + main.users[arg0_user]["buildings"]["watermills"]*5 + main.users[arg0_user]["buildings"]["factories"]*7 + main.users[arg0_user]["buildings"]["industrial_complexes"]*10)+5;
				
				for (var i = 0; i < config.buildings.length; i++) {
					if (main.users[arg0_user]["buildings"][config.buildings[i]] != undefined) {
						
						if (config.buildings[i] == "coal_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with " + main.users[arg0_user]["buildings"][config.buildings[i]]*3 + " coal each turn.");
						} else if (config.buildings[i] == "gold_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with " + main.users[arg0_user]["buildings"][config.buildings[i]] + " gold each turn.");
						} else if (config.buildings[i] == "iron_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with " + main.users[arg0_user]["buildings"][config.buildings[i]]*3 + " iron each turn.");
						} else if (config.buildings[i] == "lead_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with " + main.users[arg0_user]["buildings"][config.buildings[i]]*3 + " lead each turn.");
						} else if (config.buildings[i] == "quarries") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with " + main.users[arg0_user]["buildings"][config.buildings[i]]*5 + " stone each turn.");
						}
						
						if (config.buildings[i] == "farms") {
							building_string.push("");
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", feeding your population with " + main.users[arg0_user]["buildings"][config.buildings[i]]*3 + " food each turn.")
						} else if (config.buildings[i] == "lumberjacks") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", chopping down " + main.users[arg0_user]["buildings"][config.buildings[i]]*5 + " wood each turn.")
						} else if (config.buildings[i] == "refineries") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", refining up to " + main.users[arg0_user]["buildings"][config.buildings[i]]*5 + " petrol each turn.")
						}
						
						if (config.buildings[i] == "mines") {
							building_string.push("");
							building_string.push("You own **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", galvanising your populace into producing " + main.users[arg0_user]["buildings"][config.buildings[i]] + " actions per turn.");
						} else if (config.buildings[i] == "workshops") {
							building_string.push("You own **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", galvanising your populace into producing " + main.users[arg0_user]["buildings"][config.buildings[i]]*2 + " to " + main.users[arg0_user]["buildings"][config.buildings[i]]*3 + " actions per turn.");
						} else if (config.buildings[i] == "watermills") {
							building_string.push("You own **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", galvanising your populace into producing " + main.users[arg0_user]["buildings"][config.buildings[i]]*3 + " to " + main.users[arg0_user]["buildings"][config.buildings[i]]*5 + " actions per turn.");
						} else if (config.buildings[i] == "factories") {
							building_string.push("You own **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", galvanising your populace into producing " + main.users[arg0_user]["buildings"][config.buildings[i]]*5 + " to " + main.users[arg0_user]["buildings"][config.buildings[i]]*7 + " actions per turn.");
						} else if (config.buildings[i] == "industrial_complexes") {
							building_string.push("You own **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", galvanising your populace into producing " + main.users[arg0_user]["buildings"][config.buildings[i]]*6 + " to " + main.users[arg0_user]["buildings"][config.buildings[i]]*10 + " actions per turn.");
						}
						
						if (config.buildings[i] == "barracks") {
							building_string.push("");
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + " training your soldiers for war.");
						} else if (config.buildings[i] == "artillery_factories") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + " producing artillery pieces.");
						} else if (config.buildings[i] == "auto_plants") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + " churning out armoured vehicles to use as a blunt instrument.");
						} else if (config.buildings[i] == "aeroports") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + " turning out aeroplanes to fight for control of the skies.");
						} else if (config.buildings[i] == "dockyards") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + " to rule the waves with.");
						}
					}
				}
						
				building_string.push("\n:hammer_pick: **Total Actions** per turn: " + minimum + "-" + maximum + " actions per round.");
				building_string.push(":hammer_pick: **Building Cap:** (**" + main.users[arg0_user].building_count + "**/" + main.users[arg0_user].building_cap + ")\nThe building cap can be expanded by expanding your territory.");
					
				arg2_msg.channel.send(building_string.join("\n"));
			}
		}
		
		function printStats (arg0_user, arg1_username, arg2_msg) {
			var stats_string = [];
			var minimum = main.users[arg0_user]["buildings"]["mines"] + main.users[arg0_user]["buildings"]["workshops"]*2 + main.users[arg0_user]["buildings"]["watermills"]*3 + main.users[arg0_user]["buildings"]["factories"]*5 + main.users[arg0_user]["buildings"]["industrial_complexes"]*6;
			var maximum = main.users[arg0_user]["buildings"]["mines"] + main.users[arg0_user]["buildings"]["workshops"]*3 + main.users[arg0_user]["buildings"]["watermills"]*5 + main.users[arg0_user]["buildings"]["factories"]*7 + main.users[arg0_user]["buildings"]["industrial_complexes"]*10;
			
			console.log(main.users[arg0_user]["buildings"]["mines"] + main.users[arg0_user]["buildings"]["workshops"]*3 + main.users[arg0_user]["buildings"]["watermills"]*5 + main.users[arg0_user]["buildings"]["factories"]*7 + main.users[arg0_user]["buildings"]["industrial_complexes"]*10)
			
			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for has no country!");
				
			} else {
				
				var percentage_manpower = main.users[arg0_user].manpower_percentage*100;
				
				stats_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				stats_string.push(":map: Country: **" + main.users[arg0_user].name + "** ¦ _" + main.users[arg0_user].motto + "_");
				stats_string.push(":park: Provinces: **" + main.users[arg0_user].provinces + "**");
				stats_string.push("------------------ \n**Statistics:**\n");
				stats_string.push(":man: Population: **" + new Intl.NumberFormat('de').format(main.users[arg0_user].population) + "** (Requires :meat_on_bone: **" + Math.ceil(main.users[arg0_user].population/1000000) + "** food per turn).");
				stats_string.push(":guard: Manpower: (**" + new Intl.NumberFormat('de', {style: 'decimal'}).format(main.users[arg0_user].used_manpower) + "**/**" + new Intl.NumberFormat('de', {style: 'decimal'}).format(main.users[arg0_user].initial_manpower) + "**) ¦ (**" + percentage_manpower + "%**)");
				stats_string.push(":guard: Armed Personnel: **" + new Intl.NumberFormat('de', {style: 'decimal'}).format(main.users[arg0_user].soldiers) + "**");
				stats_string.push(":test_tube: Technological Level: **" + main.users[arg0_user].technology_level + "**");
				stats_string.push(":pound: Money (£): **" + new Intl.NumberFormat('de', {style: 'decimal'}).format(main.users[arg0_user].money) + "**" + " (:pound: **+" + Math.ceil(((main.users[arg0_user].actions+minimum)*2500)*main.users[arg0_user].tax_rate).toString() + "**-**" +  Math.ceil(((main.users[arg0_user].actions+maximum)*2500)*main.users[arg0_user].tax_rate).toString() + "** per turn).");
				stats_string.push("------------------ \n**Internal Politics:**\n");
				stats_string.push(":classical_building: Government: **" + main.users[arg0_user].government + "**\n");
				stats_string.push(":moneybag: Tax Rate: **" + main.users[arg0_user].tax_rate*100 + "**%");
				stats_string.push(":scales: Stability: **" + main.users[arg0_user].stability + "**%");
				stats_string.push(":ship: Blockaded: **" + main.users[arg0_user].blockaded + "**");
				stats_string.push("");
				stats_string.push(":pirate_flag: Infamy: **" + main.users[arg0_user].infamy + "**");
				stats_string.push("------------------ \n**Actions:**\nActions can be used to $mine or $chop, which give you raw resources. **" + main.users[arg0_user].civilian_actions_percentage*100 + "%** of your actions will be used up by civilians next turn.");
				stats_string.push(":hammer_pick: Actions: **" + main.users[arg0_user].actions + "**");
					
				arg2_msg.channel.send(stats_string.join("\n"));
			}
		}
		
		function printPolitics (arg0_user, arg1_username, arg2_msg) {
			var politics_string = [];
			
			if (main.users[arg0_user] == undefined) {	
				arg2_msg.channel.send("The person you are looking for has no country!");
				
			} else {
				
				politics_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				politics_string.push(":map: Country: " + main.users[arg0_user].name);
				politics_string.push("------------------ \n**Ruling Government:**\n");
				politics_string.push(":classical_building: Government Type: " + main.users[arg0_user].government);
				arg2_msg.channel.send(politics_string.join("\n"));
			}
		}
		
		function printStability (arg0_user, arg1_username, arg2_msg) {
			var stability_string = [];
			
			if (main.users[arg0_user] == undefined) {	
				arg2_msg.channel.send("The person you are looking for has no country!");
			} else {
				var user_id = main.users[arg0_user];
				var tax_rate = user_id.tax_rate;
				var ruling_party_popularity = user_id["politics"][user_id.government];
				
				var stab_government_modifier = 0;
				var stab_government_text = "";
				var stab_government_prefix = "";
				
				if (user_id.government != "communism" && user_id.government != "fascism" && user_id.government != "dictatorship" && user_id.government != "monarchy") {
					stab_government_modifier = 5;
					stab_government_text = "due to the current government being a " + user_id.government + ".";
					stab_government_prefix = "+";
				} else {
					stab_government_modifier = -5;
					stab_government_text = "due to an authoritarian regime in power.";
				}
				
				var calculated_stability = Math.ceil(ruling_party_popularity + stab_government_modifier - tax_rate*100);
				
				stability_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				stability_string.push(":map: Country: " + main.users[arg0_user].name);
				stability_string.push("------------------ \n**Stability:**\n");
				stability_string.push("**+" + Math.ceil(ruling_party_popularity) + "%** from ruling party popularity.");
				stability_string.push("**-" + Math.ceil(tax_rate*100) + "%** from current tax rate.");
				stability_string.push("**" + stab_government_prefix + stab_government_modifier + "%** " + stab_government_text);
				stability_string.push("------------------ \n**Calculated Stability:**\n");
				stability_string.push(":scales: Calculated Stability: **" + calculated_stability + "%**");
				stability_string.push(":scales: Current Stability: **" + user_id.stability + "%**");
				
				if (calculated_stability < 70) {
					stability_string.push("------------------");
					stability_string.push("You have a :fire: **revolt risk** of **" + (70-calculated_stability) + "%**!");
				}
				
				arg2_msg.channel.send(stability_string.join("\n"));
			}
		}
		
		function printMilitary (arg0_user, arg1_username, arg2_msg) {
			var military_string = [];
			
			if (main.users[arg0_user] == undefined) {	
				arg2_msg.channel.send("The person you are looking for has no country!");
				
			} else {
				
				military_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				military_string.push(":map: Country: " + main.users[arg0_user].name);
				military_string.push("------------------ \n:crossed_swords: **Units:**");
				military_string.push("------------------ \n:guard: **Ground Infantry:**\n");
				for (var i = 0; i < config.ground_units.length; i++) {
					military_string.push("**" + config.ground_units[i] + "**: " + main.users[arg0_user]["military"][config.ground_units[i]]);
				}
				military_string.push("------------------ \n:canned_food: **Artillery:**\n");
				for (var i = 0; i < config.ground_artillery.length; i++) {
					military_string.push("**" + config.ground_artillery[i] + "**: " + main.users[arg0_user]["military"][config.ground_artillery[i]]);
				}
				military_string.push("------------------ \n:articulated_lorry: **Land Vehicles:**\n");
				for (var i = 0; i < config.ground_vehicles.length; i++) {
					military_string.push("**" + config.ground_vehicles[i] + "**: " + main.users[arg0_user]["military"][config.ground_vehicles[i]]);
				}
				military_string.push("------------------ \n:airplane: **Aeroplanes:**\n");
				for (var i = 0; i < config.aeroplanes.length; i++) {
					military_string.push("**" + config.aeroplanes[i] + "**: " + main.users[arg0_user]["military"][config.aeroplanes[i]]);
				}
				military_string.push("------------------ \n:ship: **Naval Units:**\n");
				for (var i = 0; i < config.naval_units.length; i++) {
					military_string.push("**" + config.naval_units[i] + "**: " + main.users[arg0_user]["military"][config.naval_units[i]]);
				}
				military_string.push("------------------ \n:man_tone1: **Colonists:**\n");
				for (var i = 0; i < config.colonists.length; i++) {
					military_string.push("**" + config.colonists[i] + "**: " + main.users[arg0_user]["military"][config.colonists[i]]);
				}
				military_string.push("------------------ \n:moneybag: **Upkeep:**\n");
				military_string.push("**£" + new Intl.NumberFormat('de', {style: 'decimal'}).format(Math.ceil(main.users[arg0_user].soldiers/100)) + "** will be spent on the military each turn.");
				arg2_msg.channel.send(military_string.join("\n"));
			}
		}
		
		function buildRequest (arg0_user, arg1_message, arg2_name, arg3_costs, arg4_build_request, arg5_amount) {
			//Costs: [[5, "iron"],[1, "stone"]]
			var usr = arg0_user;
			var inventory = usr["inventory"];
			var print_results = [];
			
			var remaining_manpower = usr.initial_manpower - usr.used_manpower;
			
			if (arg4_build_request == arg2_name) {
				if (arg5_amount < 1001) {
					for (var x = 0; x < arg5_amount; x++) {
						console.log("Request to build " + arg5_amount + " " + arg2_name + " was recieved.");
						var checks_passed = 0;
						
						for (var i = 0; i < arg3_costs.length; i++) {
							if (arg3_costs[i][1] == "manpower") {
								if (remaining_manpower >= arg3_costs[i][0]) {
									checks_passed++;
								}
							} else if (arg3_costs[i][1] == "money") {
								if (usr.money >= arg3_costs[i][0]) {
									checks_passed++;
								}
							} else if (arg3_costs[i][1] == "tech") {
								if (usr.technology_level >= arg3_costs[i][0]) {
									checks_passed++;
								}
							} else {
								if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
									checks_passed++;
								}
							}
						}
						
						if (checks_passed >= arg3_costs.length) {
							if ((usr.building_cap-usr.building_count) >= arg5_amount) {
								var single_object = arg2_name;
								
								for (var i = 0; i < arg3_costs.length; i++) {
									if (arg3_costs[i][1] == "manpower") {
										if (remaining_manpower >= arg3_costs[i][0]) {
											usr.used_manpower = usr.used_manpower + arg3_costs[i][0];
										}
									} else if (arg3_costs[i][1] == "money") {
										if (usr.money >= arg3_costs[i][0]) {
											usr.money = usr.money - arg3_costs[i][0];
										}
									} else {
										if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
											inventory[arg3_costs[i][1]] = inventory[arg3_costs[i][1]] - arg3_costs[i][0];
										}
									}
								}
								single_object = single_object.replace("factories","factory");
								single_object = single_object.replace(/s$/,"");
								single_object = single_object.replace("barrack","barracks");
								print_results.push("You have successfully built a **" + single_object + "**!");
								
								usr["buildings"][arg2_name]++;
								updateBuildings(arg0_user);
							} else {
								print_results.push("You don't have enough building slots remaining to build all of these structures!");
							}
						} else {
							print_results.push("You don't have the resources to build this!");
							console.log(print_results.join("\n"));
						}
					}
				} else {
					print_results.push("The number you have specified is too large!");
				}
				
				arg1_message.channel.send(print_results.join("\n"));
			}
			
		}
		
		function build (arg0_user, arg1_msg, arg2_building, arg3_amount) {
			if (main.users[arg0_user] == undefined) {
				arg1_msg.channel.send("You don't have a country yet!");
			} else {
				var usr = main.users[arg0_user];
				var inventory = main.users[arg0_user]["inventory"];
				var result_string = [];
				var building_exists = false;
				for (var i = 0; i < config.buildings.length; i++) {
					if (arg2_building == config.buildings[i]) {
						building_exists = true;
					}
				}
				
				if (building_exists) {
					//buildRequest(usr, arg1_msg, "farms", [[10, "lumber"], [5, "iron"], [1500, "money"], [500, "manpower"]], arg2_building, arg3_amount);
					//Mines & Quarries
					buildRequest(usr, arg1_msg, "coal_mines", [[5, "wood"], [5, "iron"], [10, "stone"], [5000, "money"], [20000, "manpower"], [2, "tech"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "gold_mines", [[5, "wood"], [10, "iron"], [20, "stone"], [10000, "money"], [50000, "manpower"], [2, "tech"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "iron_mines", [[10, "wood"], [5, "iron"], [15, "stone"], [5000, "money"], [20000, "manpower"], [2, "tech"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "lead_mines", [[5, "wood"], [5, "iron"], [10, "stone"], [5000, "money"], [20000, "manpower"], [2, "tech"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "quarries", [[2, "wood"], [3, "iron"], [2500, "money"], [20000, "manpower"]], arg2_building, arg3_amount);
					
					//Farms, Lumberjacks, Refineries
					buildRequest(usr, arg1_msg, "farms", [[2, "wood"], [1, "iron"], [1000, "money"], [25000, "manpower"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "lumberjacks", [[5, "wood"], [3, "stone"], [2, "iron"], [2000, "money"], [10000, "manpower"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "refineries", [[10, "iron"], [5, "coal"], [10000, "money"], [4, "tech"]], arg2_building, arg3_amount);
					
					//Action Buildings
					buildRequest(usr, arg1_msg, "mines", [[1, "iron"], [2, "wood"], [3, "stone"], [2000, "money"], [20000, "manpower"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "workshops", [[3, "coal"], [7, "wood"], [15, "stone"], [5000, "money"], [50000, "manpower"], [2, "tech"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "watermills", [[15, "wood"], [4, "iron"], [7500, "money"], [40000, "manpower"], [3, "tech"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "factories", [[10, "iron"], [5, "coal"], [2, "petrol"], [10000, "money"], [50000, "manpower"], [4, "tech"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "industrial_complexes", [[15, "iron"], [15, "coal"], [5, "petrol"], [10, "wood"], [25000, "money"], [70000, "manpower"], [5, "tech"]], arg2_building, arg3_amount);
					
					//Military Buildings
					buildRequest(usr, arg1_msg, "barracks", [[5, "iron"], [3, "lead"], [10, "stone"], [5000, "money"], [20000, "manpower"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "artillery_factories", [[7, "iron"], [5, "lead"], [5, "stone"], [7500, "money"], [25000, "manpower"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "auto_plants", [[15, "iron"], [20, "stone"], [10, "petrol"], [15000, "money"], [100000, "manpower"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "aeroports", [[20, "stone"], [10, "wood"], [25, "iron"], [5, "petrol"], [20000, "money"], [50000, "manpower"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "dockyards", [[15, "wood"], [5, "iron"], [5, "stone"], [5000, "money"], [100000, "manpower"]], arg2_building, arg3_amount);
				} else {
					result_string.push("You were unable to build this building.");
				}
				
				arg1_msg.channel.send(result_string.join("\n"));
			}
		}
		
		function craftRequest (arg0_user, arg1_message, arg2_name, arg3_costs, arg4_build_request, arg5_amount, arg6_int) {
			//Costs: [[5, "iron"],[1, "stone"]]
			var usr = arg0_user;
			var military = usr["military"];
			var inventory = usr["inventory"];
			var print_results = [];
			var tech_request = false;
			
			var remaining_manpower = usr.initial_manpower - usr.used_manpower;
			
			if (arg4_build_request == arg2_name) {
				
				var has_building = false;
				
				if (arg2_name == "settlers" || arg2_name == "colonists" || arg2_name == "administrators" || arg2_name == "tech2" || arg2_name == "tech3" || arg2_name == "tech4" || arg2_name == "tech5") {
					has_building = true;
				} else {
					if (arg2_name == "arquebusiers" || arg2_name == "musketmen" || arg2_name == "riflemen" || arg2_name == "infantry" || arg2_name == "modern_infantry") {
						if (usr["buildings"].barracks > 0) {
							has_building = true;
						}
					} else if (arg2_name == "bombard" || arg2_name == "cannons" || arg2_name == "culverins" || arg2_name == "field_artillery" || arg2_name == "howitzers") {
						if (usr["buildings"].artillery_factories > 0) {
							has_building = true;
						}
					} else if (arg2_name == "armoured_cars" || arg2_name == "tanks") {
						if (usr["buildings"].auto_plants > 0) {
							has_building = true;
						}
					} else if (arg2_name == "biplanes" || arg2_name == "bombers" || arg2_name == "fighters" || arg2_name == "strategic_bombers") {
						if (usr["buildings"].aeroports > 0) {
							has_building = true;
						}
					} else if (arg2_name == "galleons" || arg2_name == "men_of_war" || arg2_name == "ironclads" || arg2_name == "dreadnoughts" || arg2_name == "battleships") {
						if (usr["buildings"].dockyards > 0) {
							has_building = true;
						}
					}
				}
				
				for (var x = 0; x < arg5_amount; x++) {
					console.log("Request to build " + arg5_amount + " " + arg2_name + " was recieved.");
					var checks_passed = 0;
					
					for (var i = 0; i < arg3_costs.length; i++) {
						if (arg3_costs[i][1] == "manpower") {
							if (remaining_manpower >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "money") {
							if (usr.money >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "tech") {
							if (usr.technology_level >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else {
							if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
								checks_passed++;
							}
						}
						
						if (arg2_name == "tech2") {
							if (usr.technology_level == 2 || usr.technology_level == 3 || usr.technology_level == 4 || usr.technology_level == 5) {
								checks_passed--;
							}
							tech_request = true;
						} else if (arg2_name == "tech3") {
							if (usr.technology_level == 3 || usr.technology_level == 4 || usr.technology_level == 5) {
								checks_passed--;
							}
							tech_request = true;
						} else if (arg2_name == "tech4") {
							if (usr.technology_level == 4 || usr.technology_level == 5) {
								checks_passed--;
							}
							tech_request = true;
						} else if (arg2_name == "tech5") {
							if (usr.technology_level == 5) {
								checks_passed--;
							}
							tech_request = true;
						}
						
					}
					
					if (has_building != false) {
						if (checks_passed >= arg3_costs.length) {
							var single_object = arg2_name;
							single_object = single_object.replace("factories","factory");
							single_object = single_object.replace(/s$/,"")
							print_results.push("You have successfully built a **" + single_object + "**!");
							if (tech_request != true) {
								usr["military"][arg2_name] = usr["military"][arg2_name] + arg6_int;
							} else {
								if (arg2_name == "tech2") {
									usr.technology_level = 2;
									news.push("The country of " + usr.name + " advanced to being a tech 2 nation! They are now in the Scientific Revolution!");
								} else if (arg2_name == "tech3") {
									usr.technology_level = 3;
									news.push("The country of " + usr.name + " advanced to being a tech 3 nation! They are now in the Industrial Revolution!");
								} else if (arg2_name == "tech4") {
									usr.technology_level = 4;
									news.push("The country of " + usr.name + " advanced to being a tech 4 nation! They are now in the Great Wars Era!");
								} else if (arg2_name == "tech5") {
									usr.technology_level = 5;
									news.push("The country of " + usr.name + " advanced to being a tech 5 nation! They are now in the Modern Era!");
								}
							}
							
							for (var i = 0; i < arg3_costs.length; i++) {
								if (arg3_costs[i][1] == "manpower") {
									if (remaining_manpower >= arg3_costs[i][0]) {
										usr.used_manpower = usr.used_manpower + arg3_costs[i][0];
										usr.soldiers = usr.soldiers + arg3_costs[i][0];
									}
								} else if (arg3_costs[i][1] == "money") {
									if (usr.money >= arg3_costs[i][0]) {
										usr.money = usr.money - arg3_costs[i][0];
									}
								} else {
									if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
										inventory[arg3_costs[i][1]] = inventory[arg3_costs[i][1]] - arg3_costs[i][0];
									}
								}
							}
						} else {
							print_results.push("You were unable to craft this item!");
							console.log(print_results.join("\n"));
						}
					} else {
						print_results.push("You do not possess a building needed to train these units!");
						console.log(print_results.join("\n"));
					}
				}
			
				arg1_message.channel.send(print_results.join("\n"));
			}
		}
		
		function craft (arg0_user, arg1_msg, arg2_crafting, arg3_amount) {
			if (main.users[arg0_user] == undefined) {
				arg1_msg.channel.send("You don't have a country yet!");
			} else {
				var usr = main.users[arg0_user];
				var military = main.users[arg0_user]["military"];
				var result_string = [];
				var unit_exists = false;
				
				for (var i = 0; i < config.units.length; i++) {
					if (arg2_crafting == config.units[i]) {
						unit_exists = true;
					}
				}
				if (unit_exists || arg2_crafting == "tech2" || arg2_crafting == "tech3" || arg2_crafting == "tech4" || arg2_crafting == "tech5") {
					//craftRequest(usr, arg1_msg, "farms", [[10, "lumber"], [5, "iron"], [1500, "money"], [500, "manpower"]], arg2_building, arg3_amount);
					
					//Ground Infantry
					craftRequest(usr, arg1_msg, "arquebusiers", [[1, "iron"], [1, "lead"], [1, "food"], [50000, "manpower"], [1, "tech"]], arg2_crafting, arg3_amount, 50000);
					craftRequest(usr, arg1_msg, "musketmen", [[2, "iron"], [3, "lead"], [1, "food"], [50000, "manpower"], [2, "tech"]], arg2_crafting, arg3_amount, 50000);
					craftRequest(usr, arg1_msg, "riflemen", [[4, "iron"], [4, "lead"], [1, "food"], [50000, "manpower"], [3, "tech"]], arg2_crafting, arg3_amount, 50000);
					craftRequest(usr, arg1_msg, "infantry", [[5, "iron"], [5, "lead"], [1, "food"], [50000, "manpower"], [4, "tech"]], arg2_crafting, arg3_amount, 50000);
					craftRequest(usr, arg1_msg, "modern_infantry", [[7, "iron"], [7, "lead"], [1, "food"], [50000, "manpower"], [5, "tech"]], arg2_crafting, arg3_amount, 50000);
					
					//Artillery
					craftRequest(usr, arg1_msg, "bombard", [[2, "iron"], [2, "wood"], [1, "lead"], [20000, "manpower"], [1, "tech"]], arg2_crafting, arg3_amount, 500);
					craftRequest(usr, arg1_msg, "cannons", [[3, "iron"], [2, "wood"], [2, "lead"], [20000, "manpower"], [2, "tech"]], arg2_crafting, arg3_amount, 500);
					craftRequest(usr, arg1_msg, "culverins", [[5, "iron"], [4, "wood"], [5, "lead"], [20000, "manpower"], [3, "tech"]], arg2_crafting, arg3_amount, 500);
					craftRequest(usr, arg1_msg, "field_artillery", [[10, "iron"], [5, "lead"], [5, "petrol"], [20000, "manpower"], [4, "tech"]], arg2_crafting, arg3_amount, 500);
					craftRequest(usr, arg1_msg, "howitzers", [[15, "iron"], [5, "lead"], [10, "petrol"], [20000, "manpower"], [5, "tech"]], arg2_crafting, arg3_amount, 500);
					
					//Land Vehicles
					craftRequest(usr, arg1_msg, "armoured_cars", [[3, "iron"], [3, "lead"], [3, "petrol"], [25000, "manpower"], [4, "tech"]], arg2_crafting, arg3_amount, 500);
					craftRequest(usr, arg1_msg, "tanks", [[10, "iron"], [7, "petrol"], [25000, "manpower"], [5, "tech"]], arg2_crafting, arg3_amount, 500);
					
					//Aeroplanes
					craftRequest(usr, arg1_msg, "biplanes", [[3, "iron"], [2, "petrol"], [2, "lead"], [15000, "manpower"], [4, "tech"]], arg2_crafting, arg3_amount, 50);
					craftRequest(usr, arg1_msg, "bombers", [[5, "iron"], [4, "petrol"], [15000, "manpower"], [4, "tech"]], arg2_crafting, arg3_amount, 50);
					craftRequest(usr, arg1_msg, "fighters", [[7, "iron"], [7, "petrol"], [20000, "manpower"], [5, "tech"]], arg2_crafting, arg3_amount, 50);
					craftRequest(usr, arg1_msg, "strategic_bombers", [[10, "iron"], [10, "petrol"], [20000, "manpower"], [5, "tech"]], arg2_crafting, arg3_amount, 50);
					
					//Naval Units
					craftRequest(usr, arg1_msg, "galleons", [[5, "wood"], [2, "iron"], [2, "food"], [10000, "manpower"], [1, "tech"]], arg2_crafting, arg3_amount, 50);
					craftRequest(usr, arg1_msg, "men_of_war", [[15, "wood"], [4, "iron"], [2, "food"], [20000, "manpower"], [2, "tech"]], arg2_crafting, arg3_amount, 50);
					craftRequest(usr, arg1_msg, "ironclads", [[10, "coal"], [5, "iron"], [2, "food"], [30000, "manpower"], [3, "tech"]], arg2_crafting, arg3_amount, 50);
					craftRequest(usr, arg1_msg, "dreadnoughts", [[10, "petrol"], [15, "iron"], [2, "food"], [50000, "manpower"], [4, "tech"]], arg2_crafting, arg3_amount, 50);
					craftRequest(usr, arg1_msg, "battleships", [[5, "petrol"], [15, "iron"], [2, "food"], [100000, "manpower"], [5, "tech"]], arg2_crafting, arg3_amount, 50);
					
					//Colonists
					craftRequest(usr, arg1_msg, "settlers", [[5, "wood"], [5, "iron"], [3, "food"], [2500, "money"], [100000, "manpower"], [1, "tech"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "colonists", [[7, "wood"], [5, "iron"], [2, "coal"], [3, "food"], [5000, "money"], [100000, "manpower"], [3, "tech"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "administrators", [[10, "wood"], [5, "iron"], [3, "petrol"], [3, "food"], [10000, "money"], [100000, "manpower"], [4, "tech"]], arg2_crafting, arg3_amount, 1);
					
					//Technological Advances
					craftRequest(usr, arg1_msg, "tech2", [[5, "iron"], [10, "wood"], [5, "lead"], [10000, "money"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "tech3", [[10, "iron"], [10, "coal"], [20, "wood"], [10, "stone"], [20000, "money"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "tech4", [[20, "iron"], [15, "petrol"], [15, "coal"], [10, "stone"], [35000, "money"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "tech5", [[50, "iron"], [30, "petrol"], [20, "coal"], [5, "gold"], [20, "stone"], [50000, "money"]], arg2_crafting, arg3_amount, 1);
				} else {
					result_string.push("No such recipe exists!");
				}
				
				arg1_msg.channel.send(result_string.join("\n"));
			}
		}
	}
	
	//Logic
	{
		setTimeout(function(){
			console.log("[Ampersand] is ready to recieve data requests!");
			setInterval(function(){
				fs.writeFile('database.js', JSON.stringify(main), function (err,data) {
					if (err) {
						return console.log(err);
					}
					//console.log(data);
				});
				
				//Check if a turn has passed
				
				if (main.lastTurn == undefined) {
					main.lastTurn = new Date().getTime();
				} else {
					var current_date = new Date().getTime();
					var time_difference = current_date - main.lastTurn;
					if (time_difference > turn_timer*1000) {
						for (var i = 0; i < Math.floor(time_difference/(turn_timer*1000)); i++) {
				
							if (main.roundCount == undefined) {
								main.roundCount = 0;
							} else {
								main.roundCount++;
							}
							
							for (var x = 0; x < main.user_array.length; x++) {
								nextTurn(main.user_array[x]);
							}
							
							//console.log('[Country Battle] A turn has elapsed!');
							returnChannel(announcements_channel).send("<@&700158364822405190> A turn has elapsed! It is now round **" + main.roundCount + "**. The RP year is now **" + (1500+main.roundCount*5));
							main.lastTurn = current_date;
							
							for (var x = 0; x < news.length; x++) {
								returnChannel(announcements_channel).send(news[x]);
							}
							
							news = [];
						}
					}
				}
				
				for (var x = 0; x < main.user_array.length; x++) {
					initUser(main.user_array[x]);
				}
				
			}, 100);
		},1000);
	}
}

client.on('ready', () => {
	client.user.setPresence({ activity: { name: "Midnighter RP"}, status: 'online'}).then(console.log).catch(console.error);
})

client.on('message', message => {
	//Get arguments
	var arg = [];
	
	//Initialisation end
	
	username = message.author.username;
	user_id = message.author.id;
    input = message.content;
	
	//Parse arguments
	arg = message.content.split(" ");
	console.log("Author: " + username);
	console.log(message.content);
	console.log(arg);
	
	if (arg[0].indexOf(bot_prefix) != -1) {
		
		//General commands
		{
			if (equalsIgnoreCase(arg[0], "help")) { //$help
				message.channel.send(help);
				message.channel.send(help2);
			}
			
			if (equalsIgnoreCase(arg[0], "roll")) { //$roll
				if (arg.length == 2) {
					//message.channel.send
					if (arg[1].indexOf("-") == -1) { //$roll arg1
						message.channel.send("You rolled a **" + randomNumber(1, parseInt(arg[1])) + "**.");
					} else { //$roll arg1-arg2
						var subargs = arg[1].split("-");
						message.channel.send("You rolled a **" + randomNumber(subargs[0], subargs[1]) + "**.");
					}
				} else if (arg.length == 3) {
					message.channel.send("You rolled a **" + randomNumber(parseInt(arg[1]), parseInt(arg[2])) + "**.");
				}
			}
		}
		
		//Administrative commands
		{
			if (hasRole(message, 'First Minister (Moderator)')) {
				if (equalsIgnoreCase(arg[0], "create")) { //$create @user int material
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						var material_exists = false;
						
						for (var i = 0; i < config.materials.length; i++) {
							if (config.materials[i] == arg[3]) {
								material_exists = true;
							}
						}
						
						if (material_exists) { //Execute command
							modifyItem(target_user, arg[2], arg[3], "add");
							console.log(JSON.stringify(main));
							message.channel.send("You gave " + arg[2] + " " + arg[3] + " to <@!" + target_user + ">.");
						} else {
							message.channel.send("Material '" + arg[3] + "' was not found.");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "remove") || equalsIgnoreCase(arg[0], "delete")) { //$remove @user int material
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						var material_exists = false;
						
						for (var i = 0; i < config.materials.length; i++) {
							if (config.materials[i] == arg[3]) {
								material_exists = true;
							}
						}
						
						if (material_exists) { //Execute command
							modifyItem(target_user, arg[2], arg[3], "remove");
							console.log(JSON.stringify(main));
							message.channel.send("You deleted " + arg[2] + " " + arg[3] + " from <@!" + target_user + ">.");
						} else {
							message.channel.send("Material '" + arg[3] + "' was not found.");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "blockade")) { //$blockade <@user>
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							if (main.users[target_user].blockaded) {
								main.users[target_user].blockaded = false;
								message.channel.send("The country of " + main.users[target_user].name + " is no longer blockaded.");
							} else if (main.users[target_user].blockaded == false) {
								main.users[target_user].blockaded = true;
								message.channel.send("The country of " + main.users[target_user].name + " was blockaded.");
							}
						} else {
							message.channel.send("The person you are trying to blockade doesn't even have a country!");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "eval")) { //$eval <@user> [property] [value]
					if (arg.length == 4) {
						var target_user = returnMention(arg[1]);
						eval("main.users['" + target_user + "']" + arg[2] + " = " + arg[3] + ";");
						message.channel.send("Eval command executed. Warning! This command can be highly unstable if not used correctly.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "exhaust")) { //$eval <@user>
					if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						main.users[target_user]["military"].settlers = 0;
						message.channel.send("<@" + target_user + "> has exhausted their colonists on expansion!");
					}
				}
			}
		}
		
		//Country commands
		{
			if (hasRole(message, '🗾 ¦ Country')) {
				if (equalsIgnoreCase(arg[0], "found")) { //$found <country_name>
					var target_user = returnMention(user_id);
					
					if (arg.length > 1) {
						initUser(target_user);
						var full_name = [];
						for (var i = 1; i < arg.length; i++) {
							full_name.push(arg[i]);
						}
						main.users[target_user].name = full_name.join(" ");
						message.channel.send("You have been successfully registered as **" + main.users[target_user].name + "**!\nDo `$government <government>` to set your government type. For a list of available government types, type `$government list`.\nTo set your nation motto, type `$set-motto <motto>`.\nAfter you're done setting up your nation, type in `$settle <Prov ID>` to inform Vis of where you want your capital city to be.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "set-motto")) { //$set-motto <motto>
					var target_user = returnMention(user_id);
					if (arg.length > 1) {
						initUser(target_user);
						var full_name = [];
						for (var i = 1; i < arg.length; i++) {
							full_name.push(arg[i]);
						}
						main.users[target_user].motto = full_name.join(" ");
						message.channel.send("You have set your motto to **" + main.users[target_user].motto + "**.");
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "government")) { //$government [list¦government_type]
					var target_user = returnMention(user_id);
					if (arg.length == 2 && main.users[target_user] != undefined) {
						if (arg[1] == "list") {
							message.channel.send("Valid governments: " + government_list.join(", "));
						} else {
							if (main.users[target_user].government == "") {
								var government_exists = false;
								
								for (var i = 0; i < government_list.length; i++) {
									if (government_list[i] == arg[1]) {
										government_exists = true;
									}
								}
								
								if (government_exists) {
									message.channel.send("Your government has been changed to: " + arg[1]);
									setGovernment(main.users[target_user], arg[1]);
									main.users[target_user]["politics"][arg[1]] = 100;
								} else {
									message.channel.send("That government does not exist!");
								}
							} else {
								message.channel.send("You can't change your government on a whim!");
							}
						}
					} else {
						message.channel.send("Too few arguments were included in your command. Please try again.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "governments")) { //$governments
					message.channel.send(governments);
				}
				
				if (equalsIgnoreCase(arg[0], "cb")) { //$cb
					message.channel.send(cb);
					message.channel.send(cb2);
				}
				
				if (equalsIgnoreCase(arg[0], "politics")) { //$politics <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printPolitics(target_user, username, message);
					} else {
						var target_user = returnMention(arg[1]);
						printPolitics(target_user, username, message);
					}
				}
			
				if (equalsIgnoreCase(arg[0], "inv") || equalsIgnoreCase(arg[0], "inventory")) { //$inv <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printInv(target_user, username, message);
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						printInv(target_user, username, message);
					}
				}
				
				if (equalsIgnoreCase(arg[0], "industry") || equalsIgnoreCase(arg[0], "buildings")) { //$industry <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printBuildings(target_user, username, message);
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						printBuildings(target_user, username, message);
					}
				}
				
				if (equalsIgnoreCase(arg[0], "craft")) { //$craft <item>
					var target_user = returnMention(user_id);
					if (arg.length == 2) {
						var target_user = returnMention(user_id);
						if (arg[1] == "list") {
							message.channel.send("**:scroll: Crafting List:**\n------------------ \n" + rawunitcosts.toString());
							message.channel.send(unitcosts2);
						} else {
							craft(target_user, message, arg[1], 1);
						}
					} else if (arg.length == 3) {
						craft(target_user, message, arg[1], arg[2]);
					}
				}
				
				if (equalsIgnoreCase(arg[0], "build")) { //$build <building> [int]
					//arg0_user, arg1_msg, arg2_building, arg3_amount
					var target_user = returnMention(user_id);
					if (arg.length == 2) {
						var target_user = returnMention(user_id);
						if (arg[1] == "list") {
							message.channel.send("**:scroll: Building List:**\n------------------ \n" + buildcosts);
							message.channel.send(buildcosts2);
						} else {
							build(target_user, message, arg[1], 1);
						}
					} else if (arg.length == 3) {
						build(target_user, message, arg[1], arg[2]);
					} else {
						message.channel.send("Invalid number of arguments.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "mine")) { //$mine [int]
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (main.users[target_user].government == "") {
							message.channel.send("You don't even have a government!");
						} else {
							if (arg.length == 1) {
								//(arg0_user, arg1_msg, arg2_actions)
								mine(target_user, message, 1);
							} else if (arg.length == 2) {
								mine(target_user, message, parseInt(arg[1]));
							} else {
								message.channel.send("Invalid amount of arguments!");
							}
						}
					} else {
						message.channel.send("You don't even have a country!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "forage") || equalsIgnoreCase(arg[0], "chop")) { //$forage [int]
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (main.users[target_user].government == "") {
							message.channel.send("You don't even have a government!");
						} else {
							if (arg.length == 1) {
								//(arg0_user, arg1_msg, arg2_actions)
								forage(target_user, message, 1);
							} else if (arg.length == 2) {
								forage(target_user, message, parseInt(arg[1]));
							} else {
								message.channel.send("Invalid amount of arguments!");
							}
						}
					} else {
						message.channel.send("You don't even have a country!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "stats") || equalsIgnoreCase(arg[0], "info")) { //$stats <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {
							printStats(target_user, username, message);
						}
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							printStats(target_user, arg[1], message);
						}
					}
				}
				
				if (equalsIgnoreCase(arg[0], "military") || equalsIgnoreCase(arg[0], "mil") || equalsIgnoreCase(arg[0], "units")) { //$military <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printMilitary(target_user, username, message);
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						printMilitary(target_user, arg[1], message);
					}
				}
				
				if (equalsIgnoreCase(arg[0], "settax")) { //$settax [int]
					if (arg.length == 2) {
						var target_user = returnMention(user_id);
						var new_tax = arg[1]/100;
						if (new_tax <= main.users[target_user].max_tax && main.users[target_user] != undefined) {
							main.users[target_user].tax_rate = new_tax;
							message.channel.send("Your tax rate has been set to **" + arg[1] + "%**.");
						} else {
							message.channel.send("Your government type doesn't allow for such a high tax rate!");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "sellgold")) { //$sellgold [int]
					if (arg.length == 2) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {
							sellGold(target_user, message, arg[1]);
						} else {
							message.channel.send("You don't even have a country yet!");
						}
					} else if (arg.length == 1) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {
							sellGold(target_user, message, 1);
						} else {
							message.channel.send("You don't even have a country yet!");
						}
					}
				}
				
				if (equalsIgnoreCase(arg[0], "sellpetrol")) { //$sellpetrol [int]
					if (arg.length == 2) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {
							sellPetrol(target_user, message, arg[1]);
						} else {
							message.channel.send("You don't even have a country yet!");
						}
					} else if (arg.length == 1) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {
							sellPetrol(target_user, message, 1);
						} else {
							message.channel.send("You don't even have a country yet!");
						}
					}
				}
				
				if (equalsIgnoreCase(arg[0], "coup")) { //$coup
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (main.users[target_user].coup_this_turn == false) {
							main.users[target_user].coup_this_turn = true;
							message.channel.send("A coup has been initiated! It will occur next turn.");
						} else {
							message.channel.send("A coup has already been initiated! It will occur next turn.");
						}
					}
				}
				
				if (equalsIgnoreCase(arg[0], "overthrow")) { //$overthrow
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (main.users[target_user].overthrow_this_turn == false) {
							main.users[target_user].overthrow_this_turn = true;
							message.channel.send("An overthrow of the government has been initiated! It will occur next turn.");
						} else {
							message.channel.send("An overthrow of the government has already been initiated! It will occur next turn.");
						}
					}
				}
				
				if (equalsIgnoreCase(arg[0], "vote")) { //$vote
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (main.users[target_user].government == "republic" || main.users[target_user].government == "democracy") {
							var vote = randomNumber(0, 100);
							if (vote >= 50) {
								message.channel.send("The motion was passed, with :thumbsup: **" + vote.toString() + "** ayes, and :thumbsdown: **" + (100-vote).toString() + "** nays.");
							} else {
								message.channel.send("The motion was rejected, with :thumbsup: **" + vote.toString() + "** ayes, and :thumbsdown: **" + (100-vote).toString() + "** nays.");
							}
						} else {
							message.channel.send("You aren't even a democratic nation! '100%' of your voters say yes.");
						}
					}
				}
				
				if (equalsIgnoreCase(arg[0], "nextround")) { //$nextround
					var current_date = new Date().getTime();
					var time_difference = current_date - main.lastTurn;
					
					message.channel.send("It is currently round **" + main.roundCount + "**.\n" + parseMilliseconds((turn_timer*1000)-time_difference) + " remaining until the next turn.");
				}
				
				if (equalsIgnoreCase(arg[0], "stability") || equalsIgnoreCase(arg[0], "stab")) { //$stab <@user>
					var target_user = returnMention(user_id);
					if (arg.length > 1) {
						target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							printStability(target_user, username, message);
						}
					} else {
						if (main.users[target_user] != undefined) {
							printStability(target_user, username, message);
						}
					}
				}
				
				if (equalsIgnoreCase(arg[0], "disband")) { //$disband <amount> <unit> arg0_user, arg1_msg, arg2_unit, arg3_amount
					var target_user = returnMention(user_id);
					if (arg.length == 3) {
						if (main.users[target_user] != undefined) {
							disband(target_user, message, arg[2], parseInt(arg[1]));
						} else {
							message.channel.send("You're stateless!");
						}
					} else if (arg.length == 2) {
						if (main.users[target_user] != undefined) {
							disband(target_user, message, arg[1], 1);
						} else {
							message.channel.send("You're stateless!");
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "demolish") || equalsIgnoreCase(arg[0], "destroy")) { //$demolish <amount> <building>
					var target_user = returnMention(user_id);
					if (arg.length == 3) {
						if (main.users[target_user] != undefined) {
							demolish(target_user, message, arg[2], parseInt(arg[1]));
						} else {
							message.channel.send("You're stateless!");
						}
					} else if (arg.length == 2) {
						if (main.users[target_user] != undefined) {
							demolish(target_user, message, arg[1], 1);
						} else {
							message.channel.send("You're stateless!");
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "settle") || equalsIgnoreCase(arg[0], "colonise")) { //$settle <Prov1> <...> (arg0_user, arg1_msg, arg2_provs)
					var target_user = returnMention(user_id);
					if (arg.length > 1) {
						if (main.users[target_user] != undefined) {
							var province_array = [];
							
							for (var i = 1; i < arg.length; i++) {
								province_array.push(arg[i]);
							}
							
							settle(target_user, message, province_array);
						} else {
							message.channel.send("You can't colonise, because you don't even have a nation!");
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}
				
				//give(arg0_user, arg1_user2, arg2_amount, arg3_item, arg4_mode, arg5_message)
				
				if (equalsIgnoreCase(arg[0], "give")) { //$give <@user> <int> <item>
					if (arg.length == 4) {
						var target_user = returnMention(arg[1]);
						var current_user = returnMention(user_id);
						console.log(target_user);
						if (main.users[target_user].blockaded == undefined || main.users[current_user].blockaded == undefined) {
							give(current_user, target_user, arg[2], arg[3], "item", message);
						} else if (main.users[target_user].blockaded || main.users[current_user].blockaded == undefined) {
							message.channel.send("The person you are trying to send these items to is currently blockaded!");
						} else {
							give(current_user, target_user, arg[2], arg[3], "item", message);
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "industrygive")) { //$industrygive <@user> <int> <item>
					if (arg.length == 4) {
						var target_user = returnMention(arg[1]);
						var current_user = returnMention(user_id);
						if (main.users[target_user].blockaded || main.users[current_user].blockaded == undefined) {
							message.channel.send("The person you are trying to send these items to is currently blockaded!");
						} else {
							give(current_user, target_user, arg[2], arg[3], "industry", message);
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "militarygive")) { //$militarygive <@user> <int> <item>
					if (arg.length == 4) {
						var target_user = returnMention(arg[1]);
						var current_user = returnMention(user_id);
						if (main.users[target_user].blockaded || main.users[current_user].blockaded == undefined) {
							message.channel.send("The person you are trying to send these items to is currently blockaded!");
						} else {
							give(current_user, target_user, arg[2], arg[3], "military", message);
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}
			}
		}
		
		//Config commands
		{
			if (hasRole(message, 'Discord Developer')) {
				if (equalsIgnoreCase(arg[0], "set-announcements-channel")) { //$set-announcements-channel <channel id>
					if (arg[1] != undefined) {
						announcements_channel = arg[1];
						saveConfig();
						readConfig();
						message.channel.send("The announcements channel has been set to the following channel ID: " + arg[1] + ".\nIf the prefix doesn't work, try typing the command again.")
						announcements_channel = arg[1];
						saveConfig();
						readConfig();
					}
				}
				if (equalsIgnoreCase(arg[0], "set-prefix")) { //$set-prefix <prefix>
					if (arg[1] != undefined) {
						bot_prefix = arg[1];
						saveConfig();
						readConfig();
						message.channel.send("The bot prefix has been changed to " + arg[1] + ".\nIf the prefix doesn't work, try typing the command again.");
						help = rawhelp.toString().replace(/@/g, bot_prefix);
						
						bot_prefix = arg[1];
						saveConfig();
						readConfig();
						help = rawhelp.toString().replace(/@/g, bot_prefix);
					}
				}
				if (equalsIgnoreCase(arg[0], "set-round-time")) { //$set-round-time <seconds>
					if (arg[1] != undefined) {
						turn_timer = arg[1];
						saveConfig();
						readConfig();
						message.channel.send("Turns are now " + arg[1] + " seconds long.\nIf the prefix doesn't work, try typing the command again.");
						
						turn_timer = arg[1];
						saveConfig();
						readConfig();
					}
				}
				if (equalsIgnoreCase(arg[0], "reset-rounds")) { //$reset-rounds
					main.roundCount = 0;
					message.channel.send("Server rounds have been reset!");
				}
			}
		}
	}
})
