let port = ":" + window.location.port
if (port == "") {
    if (window.location.protocol == "https:") {
        port = ":443";
    } else if (window.locatiom.protocol == "http:") {
        port = ":80";
    } else {
        port = ""
    }
}
let url = window.location.protocol + "//" + window.location.hostname + port + window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

// Get current auth token
var auth_cookie = getCookie("auth")

// Validate current auth token
if (auth_cookie != null && auth_cookie != "") {
    const request = new XMLHttpRequest()
    request.open("POST", url + "/auth/" + auth_cookie)
    request.send()
    request.onreadystatechange = function(event) {
        if (request.responseText == "false") {
            window.location = url + "/login/login.html"
        }
    }
} else { 
    window.location = url + "/login/login.html"
}

function getUserinfo() {
    const request = new XMLHttpRequest()
    request.open("POST", url + "/auth/session", false)
    request.setRequestHeader("auth", auth_cookie)
    request.send(null)
    if (request.status == 400) {
        window.location = url + "/login/login.html"
        return
    }
    if (request.responseText != "" && request.status == 200) {
        return JSON.parse(request.responseText)
    }
}

// Variables

var sitekey = "6Ld-8dQUAAAAAGAjS3I5Y2qQ2UJEnfd7mP3zF2Q3"

var userinfo = getUserinfo()

var perms = userinfo.permissions
var permslist = {}
var reqs = {}

var gamesButton = document.getElementById("nav-games")
var accountButton = document.getElementById("nav-account")
var adminButton = document.getElementById("nav-admin")
var logoutButton = document.getElementById("nav-logout")
var gamesDiv = document.getElementById("games")
var accountDiv = document.getElementById("account")
var adminDiv = document.getElementById("admin")

var playerCount = document.getElementById("playercount")
var gameList = document.getElementById("gamelist")

var ogPassword = document.getElementById("changepass-1")
var nPassword = document.getElementById("changepass-2")
var passwordButton = document.getElementById("changepass-b")
var passwordSuccess = document.getElementById("changepass-s")
var passwordFail = document.getElementById("changepass-e")
var passwordFailInfo = document.getElementById("changepass-e-i")
var passwordCaptcha

var rexecLookupInput = document.getElementById("rexec-lookup-input")
var rexecLookupButton = document.getElementById("rexec-lookup-button")

var rexecRunID = document.getElementById("rexec-id")
var rexecRunScript = document.getElementById("rexec-script")
var rexecRunButton = document.getElementById("rexec-run-button")
var rexecSuccess = document.getElementById("rexec-s")
var rexecFail = document.getElementById("rexec-e")
var rexecFailInfo = document.getElementById("rexec-e-i")

var newuserName = document.getElementById("newuser-1")
var newuserPerms = document.getElementById("newuser-2")
var newuserButton = document.getElementById("newuser-b")
var newuserSuccess = document.getElementById("newuser-s")
var newuserSuccessInfo = document.getElementById("newuser-s-i")
var newuserFail = document.getElementById("newuser-e")
var newuserFailInfo = document.getElementById("newuser-e-i")
var newuserCaptcha

var newuser = document.getElementById("newuser")
var rexec = document.getElementById("rexec")

// Events

var loadCaptchas = function() {
    // Renders the HTML element with id 'example1' as a reCAPTCHA widget.
    // The id of the reCAPTCHA widget is assigned to 'widgetId1'.
    passwordCaptcha = grecaptcha.render('changepass-re', {
      'sitekey' : sitekey,
    });
    newuserCaptcha = grecaptcha.render(document.getElementById('newuser-re'), {
      'sitekey' : sitekey,
    });
  };

logoutButton.onclick = function(event) {
    const request = new XMLHttpRequest()
    request.open("POST", url + "/auth/logout", false)
    request.setRequestHeader("auth", auth_cookie)
    request.send()
    window.location = url + "/login.html"
}

gamesButton.onclick = function(event) {
    gamesButton.classList.add("active");
    accountButton.classList.remove("active");
    adminButton.classList.remove("active");
    gamesDiv.classList.remove("d-none");
    accountDiv.classList.add("d-none");
    adminDiv.classList.add("d-none");
}

adminButton.onclick = function(event) {
    gamesButton.classList.remove("active");
    adminButton.classList.add("active");
    accountButton.classList.remove("active");
    gamesDiv.classList.add("d-none");
    adminDiv.classList.remove("d-none");
    accountDiv.classList.add("d-none");
}

accountButton.onclick = function(event) {
    gamesButton.classList.remove("active");
    adminButton.classList.remove("active");
    accountButton.classList.add("active");
    gamesDiv.classList.add("d-none");
    adminDiv.classList.add("d-none");
    accountDiv.classList.remove("d-none");
}

passwordButton.onclick = function(event) {
    var re = grecaptcha.getResponse(passwordCaptcha);
    var pass1 = ogPassword.value;
    var pass2 = nPassword.value;

    if (pass1 == "") {
        var info = "Please input your original password."
        passwordFail.classList.remove("d-none");
        passwordSuccess.classList.add("d-none");
        passwordFailInfo.innerText = info;
        passwordFailInfo.textContent = info;
        return;
    } else if (pass2 == "") {
        var info = "Please input your new password."
        passwordFail.classList.remove("d-none");
        passwordSuccess.classList.add("d-none");
        passwordFailInfo.innerText = info;
        passwordFailInfo.textContent = info;
        return;
    }

    const request = new XMLHttpRequest();
    request.open("PATCH", url + "/auth/change/" + userinfo.username + "/" + pass1 + "/" + pass2, true);
    request.setRequestHeader("auth", auth_cookie);
    request.setRequestHeader("captcha", re);
    request.send(null);
    request.onreadystatechange = function(event){
        if (this.readyState != 4) return
        if (request.status == 200 && request.responseText != ""){
            passwordFail.classList.add("d-none");
            passwordSuccess.classList.remove("d-none");
        } else {
            passwordFail.classList.remove("d-none");
            passwordSuccess.classList.add("d-none");
            var info = "An unknown error occured."
            try {
                info = JSON.parse(request.responseText).message;
            } catch {}
            passwordFailInfo.innerText = info;
            passwordFailInfo.textContent = info;
        }
        grecaptcha.reset(passwordCaptcha)
    }
}

rexecLookupButton.onclick = function(event) {
    var holder = document.getElementById("rexecLookupOutput");
    var stat = document.querySelector("#rexecLookupOutputStatus")
    var desc = document.querySelector("#rexecLookupOutputDesc")
    var creator = document.querySelector("#rexecLookupOutputCreator")
    var output = document.querySelector("#rexecLookupOutputCode")

    function reloadOutput() {
        output = document.querySelector("#rexecLookupOutputCode");
        hljs.highlightBlock(output.parentElement);
        return output
    }

    if (holder == null) {
        holder = document.createElement("div");
        holder.id = "rexecLookupOutput"
        holder.classList.add("rounded","border","border-secondary","min-vh-10","pt-1","pl-1","pr-1");

        var statholder = document.createElement("span");
        statholder.textContent = "Status: "
        statholder.innerText = "Status: "

        stat = document.createElement("span");
        stat.id = "rexecLookupOutputStatus"
        stat.classList.add("badge", "badge-secondary")
        stat.textContent = "Pending";
        stat.innerText = "Pending";
        holder.appendChild(statholder);
        statholder.appendChild(stat);

        var creatorholder = document.createElement("span");
        creatorholder.textContent = "Creator: "
        creatorholder.innerText = "Creator: "

        creator = document.createElement("span");
        creator.id = "rexecLookupOutputCreator"
        creator.classList.add("badge", "badge-secondary")
        creator.textContent = "Pending";
        creator.innerText = "Pending";
        holder.appendChild(creatorholder);
        creatorholder.appendChild(creator);
        creatorholder.insertAdjacentElement("beforebegin",document.createElement("br"));
        
        desc = document.createElement("span");
        desc.id = "rexecLookupOutputDesc"
        desc.textContent = "Please wait, your request is processing.";
        desc.innerText = "Please wait, your request is processing.";
        holder.appendChild(desc);
        desc.insertAdjacentElement("beforebegin",document.createElement("br"));

        var outputholder = document.createElement("span");
        outputholder.textContent = "Output:"
        outputholder.innerText = "Output:"
        outputholder.appendChild(document.createElement("br"));
        var outputtemp = document.createElement("pre");
        outputtemp.classList.add("rounded");
        output = document.createElement("code");
        output.id = "rexecLookupOutputCode"
        output.innerText = "--[LOOKUP PENDING]"
        output.textContent = "--[LOOKUP PENDING]"
        outputtemp.appendChild(output);
        output.classList.add("lang-lua", "w-100")
        outputholder.appendChild(outputtemp);
        holder.appendChild(outputholder);
        outputholder.insertAdjacentElement("beforebegin",document.createElement("br"));
        outputholder.insertAdjacentElement("afterbegin",document.createElement("br"));

        rexecLookupButton.insertAdjacentElement("beforebegin",holder);
        rexecLookupButton.insertAdjacentElement("beforebegin",document.createElement("br"));
    } else {
        stat.className = ""
        stat.classList.add("badge", "badge-secondary")
        stat.textContent = "Pending";
        stat.innerText = "Pending";
        creator.className = ""
        creator.classList.add("badge", "badge-secondary")
        creator.textContent = "Pending";
        creator.innerText = "Pending";
        desc.textContent = "Please wait, your request is processing.";
        desc.innerText = "Please wait, your request is processing.";
        output.innerText = "--[LOOKUP PENDING]"
        output.textContent = "--[LOOKUP PENDING]"
    }
    output = reloadOutput()
    var id = rexecLookupInput.value;

    if (id.length != 36) {
        stat.innerText = "Invalid";
        stat.textContent = "Invalid";
        stat.classList.remove("badge-secondary");
        stat.classList.add("badge-warning");
        creator.classList.remove("badge-secondary");
        creator.classList.add("badge-danger")
        creator.textContent = "Error";
        creator.innerText = "Error";
        desc.textContent = "Please input a script ID. A script ID is 36 characters long.";
        desc.innerText = "Please input a script ID. A script ID is 36 characters long.";
        output = document.querySelector("#rexecLookupOutputCode");
        output.innerText = "--[LOOKUP ERROR]"
        output.textContent = "--[LOOKUP ERROR]"
        output = reloadOutput()
        return;
    }

    const request = new XMLHttpRequest();
    request.open("GET", url + "/remote/" + id, true);
    request.setRequestHeader("auth", auth_cookie);
    request.send(null);
    request.onreadystatechange = function(event){
        if (this.readyState != 4) return
        var parsed = null
        try {
            parsed = JSON.parse(request.responseText);
        } catch(e) {}
        if (parsed == null) {
            stat.innerText = "Error";
            stat.textContent = "Error";
            stat.classList.remove("badge-secondary");
            stat.classList.add("badge-danger");
            creator.classList.remove("badge-secondary");
            creator.classList.add("badge-danger")
            creator.textContent = "Error";
            creator.innerText = "Error";
            desc.textContent = "Internal server error.";
            desc.innerText = "Internal server error.";
            output = document.querySelector("#rexecLookupOutputCode");
            output.innerText = "--[LOOKUP ERROR]"
            output.textContent = "--[LOOKUP ERROR]"
            output = reloadOutput()
            return
        } else if (request.status == 200 || parsed.resp != null){
            parsed.message = parsed.message
            var tostat
            stat.classList.remove("badge-secondary");
            if (parsed.resp.status == true) {
                tostat = "Success"
                stat.classList.add("badge-success");
            } else if (parsed.resp.status == false) {
                tostat = "Error"
                stat.classList.add("badge-danger");
            } else if (parsed.resp.status == null) {
                tostat = "Pending"
                stat.classList.add("badge-dark");
            } else {
                tostat = parsed.resp.status
                stat.classList.add("badge-warning");
            }
            stat.innerText = tostat
            stat.textContent = tostat;
            var tocreator
            creator.classList.remove("badge-secondary");

            if (typeof(parsed.resp.user) == "string") {
                tocreator = parsed.resp.user
                creator.classList.add("badge-primary");
            } else {
                tocreator = "Unknown"
                creator.classList.add("badge-warning");
            }
            creator.textContent = tocreator;
            creator.innerText = tocreator;
            desc.textContent = parsed.message;
            desc.innerText = parsed.message;
            output = document.querySelector("#rexecLookupOutputCode");
            output.innerText = parsed.resp.output || "--[No output]"
            output.textContent = parsed.resp.output || "--[No output]"
            output = reloadOutput()
        } else {
            parsed.message = parsed.message || "Internal server error."
            stat.innerText = "Error";
            stat.textContent = "Error";
            stat.classList.remove("badge-secondary");
            stat.classList.add("badge-danger");
            creator.classList.remove("badge-secondary");
            creator.classList.add("badge-danger")
            creator.textContent = "Error";
            creator.innerText = "Error";
            desc.textContent = parsed.message;
            desc.innerText = parsed.message;
            output = document.querySelector("#rexecLookupOutputCode");
            output.innerText = "--[LOOKUP ERROR]"
            output.textContent = "--[LOOKUP ERROR]"
            output = reloadOutput()
            return
        }
    }


}

rexecRunButton.onclick = function(ev) {
    var id = rexecRunID.value;
    if (id.length > 36 || id == "") {
        rexecFail.classList.remove("d-none");
        rexecSuccess.classList.add("d-none");
        var info = "Invalid place/job ID."
        rexecFailInfo.innerText = info;
        rexecFailInfo.textContent = info;
        return;
    }
    var script = rexecRunScript.value;

    if (script == "") {
        rexecFail.classList.remove("d-none");
        rexecSuccess.classList.add("d-none");
        var info = "Script cannot be empty."
        rexecFailInfo.innerText = info;
        rexecFailInfo.textContent = info;
        return;
    }

    try {
        script = luamin.minify(script);
    } catch (error) {
        var msg = error.message
        if (error.name == "SyntaxError") {
            var re = /(\[[^\]]+\])/g;
            var lineinfo = msg.match(re);
            lineinfo = lineinfo[0].slice(1,-1);
            var info = msg.substring(lineinfo.length+3);
            lineinfo = lineinfo.split(":");


            rexecFail.classList.remove("d-none");
            rexecSuccess.classList.add("d-none");
            var info = "A syntax error occured on line "+ lineinfo[0] +", column "+ lineinfo[1]+". More info:\n" + info.replace(/^./, info[0].toUpperCase());
            rexecFailInfo.innerText = info;
            rexecFailInfo.textContent = info;
        } else {
            rexecFail.classList.remove("d-none");
            rexecSuccess.classList.add("d-none");
            var info = "An unknown error occured."
            rexecFailInfo.innerText = info;
            rexecFailInfo.textContent = info;
            throw error;
        }
        return
    }

    var data = JSON.stringify({"id": id,"script": script})

    const request = new XMLHttpRequest();
    request.open("POST", url + "/remote/new/", true);
    request.setRequestHeader("auth", auth_cookie);
    request.send(data);
    request.onreadystatechange = function(event){
        if (this.readyState != 4) return
        if (request.status == 202 && request.responseText != ""){
            rexecFail.classList.add("d-none");
            rexecSuccess.classList.remove("d-none");
            rexecLookupInput.value = request.responseText
            rexecLookupInput.innerText = request.responseText
        } else {
            rexecFail.classList.remove("d-none");
            rexecSuccess.classList.add("d-none");
            var info = "An unknown error occured."
            try {
                info = JSON.parse(request.responseText).message;
            } catch {}
            rexecFailInfo.innerText = info;
            rexecFailInfo.textContent = info;
        }
    }
}

newuserButton.onclick = function(event) {
    var re = grecaptcha.getResponse(newuserCaptcha);
    var name = newuserName.value;
    var perms = newuserPerms.options[newuserPerms.selectedIndex].value;

    if (name == "") {
        var info = "Please enter a username."
        newuserFail.classList.remove("d-none");
        newuserSuccess.classList.add("d-none");
        newuserFailInfo.innerText = info;
        newuserFailInfo.textContent = info;
        return;
    } else if (perms == "") {
        var info = "Please select a permission level."
        newuserFail.classList.remove("d-none");
        newuserSuccess.classList.add("d-none");
        newuserFailInfo.innerText = info;
        newuserFailInfo.textContent = info;
        return;
    }

    const request = new XMLHttpRequest();
    request.open("POST", url + "/auth/new/" + name + "/" + perms, true);
    request.setRequestHeader("auth", auth_cookie);
    request.setRequestHeader("captcha", re);
    request.send(null);
    request.onreadystatechange = function(event){
        if (this.readyState != 4) return
        var parsed = null
        try {
            parsed = JSON.parse(request.responseText);
        } catch(e) {}
        if (request.status == 201 && parsed != null) {
            var info = null
            try {
                info = parsed.resp.password;
                newuserFail.classList.add("d-none");
                newuserSuccess.classList.remove("d-none");
                newuserSuccessInfo.innerText = info;
                newuserSuccessInfo.textContent = info;
                return
            } catch {
                info = "An unknown error occured."
            }

        } else {
            newuserFail.classList.remove("d-none");
            newuserSuccess.classList.add("d-none");
            var info = "An unknown error occured."
            try {
                info = parsed.message;
            } catch {}
            newuserFailInfo.innerText = info;
            newuserFailInfo.textContent = info;
        }
        grecaptcha.reset(newuserCaptcha)
    }
}

// Auxiliary Functions

function changeCount(c) {
    playerCount.textContent = c;
}

function sortTable(t) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = t;
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[1];
        y = rows[i + 1].getElementsByTagName("TD")[1];
        // Check if the two rows should switch place:
        if (Number(x.textContent) < Number(y.textContent)) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
}


function addLog(plrs,placeid,name,duration,uuid) {
    var el = document.createElement('tr');

    el.setAttribute("data-logId", uuid)

    var item1 = document.createElement("td");
    var item2 = document.createElement("td");
    var item3 = document.createElement("td");
    var item4 = document.createElement("td");
    item1.textContent = name;
    item2.textContent = plrs;
    item3.textContent = duration;
    item4.innerHTML = "<a href=\"https://roblox.com/games/" + placeid + "/ultra-was-here\" target=\"_blank\">Go to game</a>";
    el.append(item1,item2,item3,item4)
    var current = gameList.children

    var nPlr = Number(plrs);
    
    var replaced = false;

    var i
    for (i = 0; i < current.length; i++) {
        var cUUID = current[i].getAttribute("data-logId");
        if (cUUID == uuid) {
            current[i].replaceWith(el);
            replaced = true;
        }
    }

    if (replaced == false) {

        for (i = 0; i < current.length; i++) {
            var cPlr = Number(current[i].children[1].textContent);
            var cName = current[i].children[0].textContent;

            if (nPlr > cPlr && cName == name) {
                gameList.replaceChild(el,current[i]);
                replaced = true;
                break;
            } else if (current.length >= 200) {
                var lPlr = cPlr;
                var oof = null;

                for (l = 0; l < current.length; l++) {
                    var cNum = Number(current[l].children[1].textContent);
                    var cUUID = current[l].getAttribute("data-logId");
                    if (cNum <= lPlr || cUUID != uuid) {
                        lPlr = cNum;
                        
                        oof = current[l]
                    }
                    
                }
                if (oof != null && lPlr <= plrs) {
                    replaced = true;
                    gameList.replaceChild(el,oof);
                    break;
                }
            }
        }

    }
    sortTable(gameList.parentElement);
    if (replaced == false && current.length < 200) {
        gameList.append(el);
    } else {
        return false;
    }
    return true;
}

const request_r = new XMLHttpRequest();
request_r.open("GET", url + "/requirements", true);
request_r.setRequestHeader("auth", auth_cookie);
request_r.send(null);
request_r.onreadystatechange = function(event){
    if (this.readyState != 4) return
    var parsed = null
    try {
        parsed = JSON.parse(request_r.responseText);
    } catch {}
    if (request_r.status == 200 && parsed != null) {
        try {
            reqs = parsed
            if (perms >= reqs.rexec) {
                adminButton.classList.remove("d-none")
                rexec.classList.remove("d-none")
            }
            if (perms >= reqs["make-new-users"]) {
                adminButton.classList.remove("d-none")
                newuser.classList.remove("d-none")
            }
        } catch {
            console.warn("Unable to retrieve permission requirements.")
        }
    }
}

const request_p = new XMLHttpRequest();
request_p.open("GET", url + "/permissions", true);
request_p.setRequestHeader("auth", auth_cookie);
request_p.send(null);
request_p.onreadystatechange = function(event){
    if (this.readyState != 4) return
    var parsed = null
    try {
        parsed = JSON.parse(request_p.responseText);
    } catch {}
    if (request_p.status == 200 && parsed != null) {
        try {
            permslist = parsed

            var i
            for (i = 1; i <= userinfo.permissions-1; i++) {
                var opt = document.createElement('option');
                opt.value = i;
                opt.textContent = permslist[String(i)];
                opt.innerHTML = permslist[String(i)];
                newuserPerms.appendChild(opt);
            }

        } catch {
            console.warn("Unable to retrieve permission names.")
        }
    }
}

// Polling functions

function refreshGames() {
    const request = new XMLHttpRequest();
    request.open("GET", url + "/get-games", true);
    request.setRequestHeader("auth", auth_cookie);
    request.send(null);
    request.onreadystatechange = function(event){
        if (this.readyState != 4) return
        var parsed = null
        try {
            parsed = JSON.parse(request.responseText);
        } catch(e) {}
        if (request.status == 200 && parsed != null && typeof(parsed.resp) == "object") {

            while (gameList.hasChildNodes()) {
              gameList.removeChild(gameList.lastChild);
            }

            for (var game of parsed.resp) {
                addLog(game.players,game.id,game.name,game.creation,game.uuid)
            }
        } else {
            console.warn("Failed to get games. Retrying in 10 seconds.")
        }
    }

    setTimeout(refreshGames, 2500);
}

function refreshPlrcount() {
    const request = new XMLHttpRequest();
    request.open("GET", url + "/get-playercount", true);
    request.setRequestHeader("auth", auth_cookie);
    request.send(null);
    request.onreadystatechange = function(event){
        if (this.readyState != 4) return
        var parsed = null
        try {
            parsed = JSON.parse(request.responseText);
        } catch(e) {}
        if (request.status == 200 && parsed != null && typeof(parsed.resp) == "number") {
            playerCount.innerText = parsed.resp
            playerCount.textContent = parsed.resp
        } else {
            console.warn("Failed to get player count. Retrying in 10 seconds.")
        }
    }

    setTimeout(refreshPlrcount, 5000);
}

refreshGames();
refreshPlrcount();
