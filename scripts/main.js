//NEED TO TEST
//use
//use with 
// intialization
// GAME ELEMENTS
class Pyramid {
    constructor(rooms){
        this.rooms = rooms
        //this.noisy = true
    }
}
//not yet used
// consider class corridor
class UseCase {
    constructor(main_obj, other_obj, success_condition, success_str, fail_str, priority, used_up, new_obj){
        this.main_obj = main_obj;
        this.other_obj = other_obj;
        this.success_condition = success_condition
        this.success_str = success_str;
        this.fail_str = fail_str;
        this.priority = priority;
        this.used_up = used_up;
        this.new_obj = new_obj;
    }
}

//will want to extend UseCase

class Room {
    constructor(name, coords, gameObjects, description, special_cross_needs = null, special_cross_message = null) {
        this.name = name;
        this.coords = coords
        this.gameObjs = gameObjects;
        this.desc_base = description;
        this.adj_rooms = {
            "east": null,
            "west": null,
            "south": null,
            "north": null,
            "up": null,
            "down": null
        }
        this.special_cross_needs = special_cross_needs;
        this.special_cross_message = special_cross_message;
    }
    describe() {
        var desc_full = this.desc_base + "\r\n";
        var desc_adj;
        for(var direction in this.adj_rooms) {
            var room_adj = this.adj_rooms[direction];
            if (room_adj !== null){
                desc_adj = "There is a dark opening in the " + direction + " wall.\r\n"; 
                //up down will not be a wall
                desc_full += desc_adj;
            }
          }
        // oops something wrong here
        var desc_obj;
        for (var gameObjStr in this.gameObjs) {
            desc_obj = "There are/is a "+ this.gameObjs[gameObjStr].name +" here.\r\n"; 
            desc_full += desc_obj
        }
        
        return desc_full
    }

}
class Player {
    constructor(name, room) {
        this.name = name;
        this.inventory = {};
        this.room = room;
        this.has_light = false;
        this.side_of_room = null;
        //knowledge
        //action history
        //state hungry on fire etc
        // objects held in hand
        // weapons
    }
    move(directionStr){
        if (!('lit torch' in this.inventory)){
            return "It's pretty dark and you can't see well enough to move.\r\n";
        }
        if (!('compass' in this.inventory)){
            var desc = "You can't tell which direction is " + directionStr + ".\r\n";
            return desc;
        }
        if (this.room.adj_rooms[directionStr] != null){
            if (this.room.special_cross_needs == null){
                this.room = this.room.adj_rooms[directionStr];
                this.side_of_room = get_side_entered(directionStr);
                var desc_full = "You go through the opening in the "+directionStr+ " wall.\r\n";
                // up down will not be a wall
                desc_full += this.room.describe();
                return desc_full
            }
            else {
                console.log("object needed is", this.room.special_cross_needs)
                if (directionStr == this.side_of_room){
                    // you're allowed to go back the way you came without dealing with the crossing
                    this.room = this.room.adj_rooms[directionStr];
                    this.side_of_room = get_side_entered(directionStr);
                    var desc_full = "You go through the opening in the "+directionStr+ " wall.\r\n";
                    // up down will not be a wall
                    desc_full += this.room.describe();
                    return desc_full
                }
                var gameObj = check_for_obj(this.room.special_cross_needs, this);
                if (gameObj == false){
                    return "You cannot cross the room right now. Try something else.";
                }
                else{
                    console.log("message is", this.room.special_cross_message)
                    var desc_full = this.room.special_cross_message + "\r\n";
                    this.room = this.room.adj_rooms[directionStr];
                    this.side_of_room = get_side_entered(directionStr);
                    desc_full += "You go through the opening in the "+directionStr+ " wall.\r\n";
                    // up down will not be a wall
                    desc_full += this.room.describe();
                    return desc_full
                }
            }

        }
        else {
            return "You cannot go in this direction."
        }
    }
    take(gameObjStr){
        // gameObj: string representing game object, used to look up in room.gameObjs dictionary
        // should just be the name
        if (gameObjStr in this.room.gameObjs){
            var gameObj = this.room.gameObjs[gameObjStr];
            this.inventory[gameObjStr]=gameObj
            console.log("just added game obj");
            delete this.room.gameObjs[gameObjStr];
            var desc_full = "You have picked up (a) "+gameObjStr+".\r\n";
            if (gameObjStr == 'torch'){
                this.has_light = true;
            }
            return desc_full;
        }
        else {
            return "This object is not in the room."
        }
    }
    inventory_list(){
        var desc_full = "You have: \r\n";
        
        for(var gameObjStr in this.inventory) {
            desc_full += gameObjStr +"\r\n";
        }
        //todo add case if empty
        return desc_full
    }

    //not yet added to rest of game
    drop(gameObjStr){
                // gameObj: string representing game object, used to look up in room.gameObjs dictionary
        // should just be the name
        if (gameObjStr in this.inventory){
            var gameObj = this.inventory[gameObjStr];
            this.room.gameObjs[gameObjStr]=gameObj
            delete this.inventory[gameObjStr];
            var desc_full = "You have dropped a "+gameObjStr+".\r\n";
            if (gameObjStr == 'torch'){
                this.has_light = false;
            }
            return desc_full;
        }
        else {
            return "This object is not in your inventory."
        }
    }
    
}
class NPC {
    constructor(name, room) {
        this.name = name;
        this.room = room;
        
    }
}
class GameObject {
    constructor(name, description) {
        this.name = name;
        //this.state="normal";
        this.desc = description;
        this.useCase = null;
        // later make this a list
    }
    use_obj(player){
        //already checked if in room or in player's inventory
        //TODO: for now useCase sucess_condition is always true
        if (this.useCase.success_condition){
            if (this.useCase.used_up){
                if (this.name in player.inventory){
                    delete player.inventory[this.name];
                }
                if (this.name in player.room.gameObjs){
                    delete player.room.gameObjs[this.name];
                }
            }
            return this.useCase.success_str;
        }
        else{
            return "You cannot use this object. Try something else. \r\n"
        }

    }
    use_obj_with(){
        return null;
    }

    use_obj_on(gameObjStr_2, player){
        console.log("have reached use_obj_on");
        console.log(this.useCase.other_obj);
        console.log(gameObjStr_2);
        if (gameObjStr_2 == this.useCase.other_obj){
           
            if (gameObjStr_2 in player.room.gameObjs){
                var gameObj_2 = player.room.gameObjs[gameObjStr_2];
            }
            else if (gameObjStr_2 in player.inventory){
                var gameObj_2 = player.inventory[gameObjStr_2];
            }
            else{
                return "The objects are not in the room or in your inventory. Try something else. \r\n";}
            }
        else{
                return "You cannot perform this action";
            }

        if (this.useCase.success_condition){
                var new_obj = this.useCase.new_obj;
                player.inventory[new_obj.name] = new_obj;
                if (this.useCase.used_up){
                    if (this.name in player.inventory){
                        delete player.inventory[this.name];
                    }
                    if (gameObjStr_2 in player.inventory){
                        delete player.inventory[gameObjStr_2];
                    }
                    if (this.name in player.room.gameObjs){
                        delete player.room.gameObjs[this.name];
                    }
                    if (gameObjStr_2 in player.room.gameObjs){
                        delete player.room.gameObjs[gameObjStr_2];
                    }
                }
                return this.useCase.success_str;
            }
            else{
                return "You cannot use this object. Try something else. \r\n";
            }

        }
    }


function check_for_obj(gameObjStr, player){
    if (gameObjStr in player.room.gameObjs){
        var gameObj = player.room.gameObjs[gameObjStr];
    }
    else if (gameObjStr in player.inventory){
        var gameObj = player.inventory[gameObjStr];
    }
    else{
        return false;
    }
    return gameObj

}
function get_side_entered(directionStr){
    var opp_dir = {'east': 'west', 'west':'east', 'south':'north', 'north':'south'};
    return opp_dir[directionStr];
}
//todo init corridors
function initCorridors(){

}
// GAME INITIALIZATION

function initGame(playerName){
//objects
const unlit_torch = new GameObject("unlit torch", "This torch is unlit.");
const lit_torch = new GameObject("lit torch", "This torch is lit.");
const firestarter = new GameObject("firestarter", "This starts fires.")
const compass = new GameObject('compass', 'This is a compass. Pretty handy.');

const bowls = new GameObject('bowls', 'These are large ornately decorated bowls.');
const pots = new GameObject('clay pots', 'These pots look like they would be useful for storage. Though most of them do look leaky.');
const jars = new GameObject('stone jars', 'You do not want to know what is in these jars.');
const bread = new GameObject('bread', 'You try some bread. It is rock hard and not very appetizing.');
const rope = new GameObject('coil of rope', 'This rope was woven with the finest craftsmanship.');
const dishes = new GameObject('dishes', 'These dishes are flat and covered in abstract designs.');

const couch = new GameObject('couch', 'You sit down ojn the couch for a bit. But the rumbling noise is still getting to you.');
const cushions = new GameObject('cushions', 'You sprawl over the cushions for a few moments. You are not able to relax though, because of the rumbling noise.');
const chair = new GameObject('chair', 'You sit down on the chair and it creaks alarmingly. You get back up again.')
const bundles = new GameObject('bundles of reeds','On closer inspection, the bundles of reeds seem to have formerly been part of a boat. Some bundles are still lashed together but many have fallen from the main structure.')
const pole = new GameObject('pole', 'A large flexible wooden pole.');

const boat = new GameObject('boat', 'Not a beautiful boat.')

const water = new GameObject('water', 'There is a lot of water in this pool.');
const fire = new GameObject('fire', 'You look at the fire again. It has not changed its essential nature since the last time you did so. It will still burn you very quickly if you get to close.');
const bowl_water = new GameObject("bowl of water", "A bowl full of water.")

const scroll = new GameObject("scroll", 'You open the papyrus scroll. The scroll consists of a series of spells to help assist the journery of a soul through the underworld into the afterlife. You skim the collection and recognize some classics like the Weighing of the Heart ritual. Pity that you do not have a handsbreath of magic in you. That whole \" getting through to the eternal afterlife \" thing is only for royalty anyway.')

const animals = new GameObject("animals", 'Small carved wooden animals fill the chamber. The look worn and well-loved, some with paint peeling and some with broken legs or ears.');
const statues = new GameObject("statues", 'There are statues of varying sizes around the room. You see a chaotic mix of household gods, figures of ordinary people ranging from children to grandparents, and abstract lumps of clay.');
const gold = new GameObject("gold", 'The gold from numerous paintings glints in the light of your torch. They are not executed by the steadiest hand, but are hung carefully around the room. There are also cabinets painted in gold that house small trinkets like woven bracelets and letters.');

// use cases
const torch_light = new UseCase("firestarter", "unlit torch", true, "Let there be light. You now have a lit torch.", "", 0, true, lit_torch); //COMEBACK
console.log(torch_light.new_obj.name);
firestarter.useCase = torch_light;

const make_boat = new UseCase("rope", "bundles of reeds", true, 'You tie up the bundles of reeds into something approximating riverworthiness. Not a beautiful boat but it looks like it will do the job. At least it does not look heavy. You now have a boat.', "", 0, true, boat);
rope.useCase = make_boat;

const get_water = new UseCase("bowls", "water", true, "You scoop up some water from the pool into a bowl.","", 9, false,bowl_water);
bowls.useCase = get_water;

// don't have put out fire as a use case, this is currently a special cross need b/c easier to code than a change in room state and description
// const put_out_fire = new UseCase("bowl of water", "fire");
// bowl_water.useCase = put_out_fire;



//rooms
rooms = [];
//probably later will want to do the pyramid and the grid maybe
var start_room_dict = {"unlit torch": unlit_torch, "firestarter": firestarter} // not the most elegant way to do this
const start = new Room("startRoom", [10,0,0], start_room_dict, "You are in a small chamber. Everything is covered in dust and the air is musty. Without the benefit of torchlight it's dark but you know this room pretty well.");
rooms.push(start);

const room_10_1_0 = new Room("Room_10_1_0", [10,1,0],{}, 'You are in a nondescript room with nondescript writing on the walls.');
rooms.push(room_10_1_0);

obj_dict = {'bowls': bowls, 'clay pots': pots, 'stone jars': jars, 'dishes':dishes,  'bread':bread, 'coil of rope':rope};
const room_9_1_0 = new Room("Room_9_1_0", [9,1,0],obj_dict, 'You are in what appears to be a storeroom. There are many items stacked neatly along the walls.');
rooms.push(room_9_1_0);


obj_dict = {'couch':couch, 'cushions':cushions, 'chair':chair, 'bundles of reeds':bundles, 'pole': pole}
const room_8_1_0 = new Room("Room_8_1_0", [8,1,0],obj_dict, 'You are in what appears to be a storeroom. There are many items stacked haphazardly around the room.');
rooms.push(room_8_1_0);

const room_10_2_0 = new Room("Room_10_2_0", [10,2,0],{}, 'You are in a nondescript room with nondescript writing on the walls.');
rooms.push(room_10_2_0);


const room_10_3_0 = new Room("Room_10_3_0", [10,3,0],{}, 
'A giant pit yawns open in the center of the chamber. As you cautiously peer into the depts of the pit, you can see spikes along the walls of the pit and the bottom. The spikes are covered in spiders.',
 special_cross_needs='pole', special_cross_message='You pole vault gracefully across the pit.');
rooms.push(room_10_3_0);

const room_10_4_0 = new Room("Room_10_4_0", [10,4,0],{}, 
'You see a strange group of people standing in the center of the dimly lit room, arguing. They seem foreign and very confused. Your natural ability with languages allows you to understand their conversation within a few minutes and you quietly approach them, putting your hand on the shoulder of the person nearest to you. '+
'It looks like they are in need of some assistance and you tell them so. \r\n' +
'The man turns around, shrieks and clutches the arm of the woman standing next to him. She stares you down and asks if you are offering that assistance. \r\n' +
'You were headed up anyway since that is where the noise seems to be coming from, and you are a generous person so you figure why not help them out? You manage to navigate them to the exit without any more mishap.' +
'They seem a bit battered and are extremely flustered but you get part of their story on the way. It turns out your initial assessment was correct. They had entered the pyramid in search of uncountable treasures but had gotten lost almost right away. Looks like they had been warned by the locals too. Classic tourists, but pretty harmless as these things go. \r\n' +
'Once you arrive at your destination, you discover that the final room boasts a gaping hole where there had formerly been a nice solid wall. More to the point, this seems to be the source of the noise. One of the foreigners sheepishly mentions that they be a bit aggressive be able to fit everyone in through the entrance. You do not bother glancing outside because it is very bright outside and all that really matters is that you know how to fix your problem now. After sending the group off on their merry way, you go find some stones to wall off the hole. \r\n' +
'Satisfied with your work, you head back down. You find the room you started in, and finally get to rest in peace.');
rooms.push(room_10_4_0);
//TODO make the game end if you get to this room.

obj_dict = {"water": water}
const room_11_2_0 = new Room("Room_11_2_0", [11,2,0],obj_dict, 
'A vast pool stretches before you, with only a small strip of land near the entryway. The water is vibrating gently. You can faintly make out a dark opening on the far side. There are footprints in the sand. \r\n',
special_cross_needs="boat", special_cross_message = "You sally forth grandly across the pool, a heroic figure out to discover new worlds, paddling the boat with your hands. You make slow but steady progress and eventually make it to the other side. You drag your boat onto the shore.\r\n"
);
rooms.push(room_11_2_0);

obj_dict = {'fire': fire}
const room_12_2_0 = new Room("Room_12_2_0", [12,2,0],obj_dict, 
'The room is lit by a wall of fire stretching across the width of the chamber. You vaguely wonder how the fire is being fueled but are quickly distracted by the a tongue of flame that leaps a little too close to you. It is getting hot in here. \r\n',
special_cross_needs='bowl of water', special_cross_message='You toss some water from your bowl at the fire. It immediately goes out.');
rooms.push(room_12_2_0);

obj_dict = {'scroll': scroll}
const room_13_2_0 = new Room("Room_13_2_0", [13,2,0],obj_dict, 'You are in a chamber with a rectangular chamber with faded paintings on the walls.');
rooms.push(room_13_2_0);

const room_14_2_0 = new Room("Room_14_2_0", [14,2,0],{}, 'You are in a large hall with pillars on either side of a walkway leading up to a large throne. The walls and pillars are carved with noble profiles staring regally down at you. They seem almost alive, as if at any minute a queen will step down and order you to go fetch her a snack. \r\n');
rooms.push(room_14_2_0);


obj_dict = {"animals":animals, "statues":statues, "gold":gold};

const room_14_3_0 = new Room("Room_14_3_0", [14,3,0],obj_dict, 'You blink and details of the room emerge slowly from the mist, strange animals, statues and gold – everywhere the glint of gold. For the moment – an eternity it seems – you are struck dumb with amazement. You see wonderful things. \r\n');
rooms.push(room_14_3_0);

//connect rooms
start.adj_rooms["north"]=room_10_1_0;

room_10_1_0.adj_rooms["south"]=start;
room_10_1_0.adj_rooms["west"]=room_9_1_0;
room_10_1_0.adj_rooms["north"]=room_10_2_0;

room_9_1_0.adj_rooms["east"]=room_10_1_0;
room_9_1_0.adj_rooms["west"]=room_8_1_0;

room_8_1_0.adj_rooms["east"]=room_9_1_0;

room_10_2_0.adj_rooms["south"]= room_10_1_0;
room_10_2_0.adj_rooms["north"]=room_10_3_0;

room_10_3_0.adj_rooms["south"]=room_10_2_0;
room_10_3_0.adj_rooms["north"]=room_10_4_0;
room_10_4_0.adj_rooms["south"]=room_10_3_0;

room_10_2_0.adj_rooms["east"]=room_11_2_0;
room_11_2_0.adj_rooms["west"]=room_10_2_0;


room_11_2_0.adj_rooms["east"]=room_12_2_0;
room_12_2_0.adj_rooms["west"]=room_11_2_0;
room_12_2_0.adj_rooms["east"]=room_13_2_0;
room_13_2_0.adj_rooms["west"]=room_12_2_0;
room_13_2_0.adj_rooms["east"]=room_14_2_0;
room_14_2_0.adj_rooms["west"]=room_13_2_0;

room_14_2_0.adj_rooms["north"]=room_14_3_0;
room_14_3_0.adj_rooms["south"]=room_14_2_0;


//player
const player1 = new Player(playerName, start);
player1.inventory["compass"] = compass;

return [player1, rooms]
}

// GAME PLAY
function parseCommand(player, rooms,  command){
    command = command.toLowerCase();
    console.log("parsing this thing "+command)

    //todo make this into a switch statement
    if (command == "look around"){
        var desc_full = player.room.describe()
        return desc_full;
    }
    else if (command.startsWith("go")){
        var directionStr = command.split(" ")[1]; //later add in handling for situations like go north aefawefawef
        console.log("direction is "+ directionStr);
        var desc = player.move(directionStr);
        return desc;
    }
    else if (command.startsWith("take")){
        words = command.split(" ");
        var gameObjStr= '';
        for (var i = 1; i < words.length; i++){
                gameObjStr = gameObjStr.concat(words[i], " ")
                if (i == words.length-1){
                    gameObjStr = gameObjStr.substring(0, gameObjStr.length -1)
                }
            }
        // var gameObjStr = command.split(" ")[1]; //later add in handling for situations like take obj aefawefawef
        console.log("object to take is "+ gameObjStr);
        var desc = player.take(gameObjStr);
        return desc;
    }
    else if (command == "inventory"){
        var desc = player.inventory_list();
        return desc;
    }
    else if (command.startsWith("inspect")){
        words = command.split(" ");
        var gameObjStr= '';
        for (var i = 1; i < words.length; i++){
                gameObjStr = gameObjStr.concat(words[i], " ")
                if (i == words.length-1){
                    gameObjStr = gameObjStr.substring(0, gameObjStr.length -1)
                }
            }
        
        var gameObj = check_for_obj(gameObjStr, player);
        if (gameObj == false){
            return "This object is not in the room or in your inventory. Try something else.";
        }

        var desc = gameObj.desc + "\r\n"; //todo later standardize where we put in these newline chars
        return desc;
    }
    // else if (/use\s\w+\son\s\w+/.test(command)){ //this doesn't catch use coil of rope on bundles of reeds
    else if (/use/.test(command) && /on/.test(command)) {
        console.log("in use obj on obj")
        words = command.split(" ");
        on_pos = words.indexOf('on');
        var gameObjStr_1 = '';
        var gameObjStr_2 = '';
        for (var i = 1; i < words.length; i++){
            if (i < on_pos){
                gameObjStr_1 = gameObjStr_1.concat(words[i], " ")
                if (i == on_pos-1){
                    gameObjStr_1 = gameObjStr_1.substring(0, gameObjStr_1.length -1)
                }
            }
            else if (i > on_pos){
                gameObjStr_2 = gameObjStr_2.concat(words[i], " ")
                if (i == words.length-1){
                    gameObjStr_2 = gameObjStr_2.substring(0, gameObjStr_2.length -1)
                }

            }
        }
        console.log("obj 1", gameObjStr_1);
        console.log("obj 2", gameObjStr_2);

        var gameObj = check_for_obj(gameObjStr_1, player);
        if (gameObj == false){
            return "This object is not in the room or in your inventory. Try something else.";
        }

        return gameObj.use_obj_on(gameObjStr_2, player);

    }
    else if (command.startsWith("use")){
        
        words = command.split(" ");
        var gameObjStr= '';
        for (var i = 1; i < words.length; i++){
                gameObjStr = gameObjStr.concat(words[i], " ")
                if (i == words.length-1){
                    gameObjStr = gameObjStr.substring(0, gameObjStr.length -1)
                }
            }

        var gameObj = check_for_obj(gameObjStr, player);
        if (gameObj == false){
                return "This object is not in the room or in your inventory. Try something else.";
        }

        var desc = gameObj.use_obj(player);
        return desc;
    }
    else if (command.startsWith('drop')){
        words = command.split(" ");
        var gameObjStr= '';
        for (var i = 1; i < words.length; i++){
                gameObjStr = gameObjStr.concat(words[i], " ")
                if (i == words.length-1){
                    gameObjStr = gameObjStr.substring(0, gameObjStr.length -1)
                }
            }
        // var gameObjStr = command.split(" ")[1]; //later add in handling for situations like take obj aefawefawef
        console.log("object to drop is "+ gameObjStr);
        var desc = player.drop(gameObjStr);
        return desc;
    }
    else if (command == "help"){
        return 'You can try: \r\n look around \r\n go {direction} \r\n take {object} \r\n inspect {object} \r\n inventory \r\n use {object} \r\n help'
    }
    
    else{
        return "You can't do that. Try something else."
    }
// inspect obj
// look around
// Take
// go north s e w hmm do you need a compass
// use obj
// use obj + obj + obj
// what about things you can't pick up
// use obj on obj
// return error message or relevant function and objects
}
function runCommand(command){
    var storyOutput = document.getElementById('storyOutput')
    //setting this css style solving problem with new line in textContent
    storyOutput.setAttribute('style', 'white-space: pre-line;'); //probably don't want to repeat this every time tho
    // should be able to put this in index.html right?
    storyOutput.textContent += "\r\n >";
    storyOutput.textContent += command;
    storyOutput.textContent += "\r\n";
    if (gameInitialized==false){
        console.log("game initializing");
        [player1, rooms] = initGame("Player1")
        gameInitialized = true
    }
//maybe change this to a what is your name prompt that switches to what is next

// parse command an run it
    commOutput = parseCommand(player1, rooms, command);

// update story output
    storyOutput.textContent += commOutput;
}

let gameInitialized = false;


// initial set up


// website response
//const submitForm = document.getElementById("submitCommand")
//submitForm.addEventListener("submit", runCommand);
//hmm should this be looping tho, maybe not
