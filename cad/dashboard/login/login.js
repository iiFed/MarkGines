let button = document.getElementById("login")
let username = document.getElementById("username")
let password = document.getElementById("password")
let success = document.getElementById("success")
let err = document.getElementById("error")
let errResp = document.getElementById("resp")

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
        if (request.responseText == "true") {
            window.location = url + "/dashboard.html"
        }
    }
}

button.onclick = function(ev) {
    if (username.value == "") {
        var info = "Please input a username."
        errResp.textContent = info;
        errResp.innerText = info;
        err.setAttribute("style", "display: block; width: 100%;")
        success.setAttribute("style", "display: none !important; width: 100%;")
        return;
    } else if (password.value == "") {
        var info = "Please input a password."
        errResp.textContent = info;
        errResp.innerText = info;
        err.setAttribute("style", "display: block; width: 100%;")
        success.setAttribute("style", "display: none !important; width: 100%;")
        return;
    }
    var re = grecaptcha.getResponse()
    const request = new XMLHttpRequest()
    request.open("POST", url + "/auth/" + username.value + "/" + password.value, true)
    request.setRequestHeader("captcha", re);
    request.send(null)
    request.onreadystatechange = function(event){
        if (this.readyState != 4) return
        if (request.status == 200 && request.responseText != ""){
            success.setAttribute("style", "display: block; width: 100%;")
            err.setAttribute("style", "display: none !important; width: 100%;")
            document.cookie = "auth=" + request.responseText
            window.location = url + "/dashboard.html"
        } else {
            var parsed = JSON.parse(request.responseText);
            var info = "An unknown error occured.";
            if (parsed.message != null) {
                info = parsed.message;
            }
            errResp.textContent = info;
            errResp.innerText = info;
            err.setAttribute("style", "display: block; width: 100%;")
            success.setAttribute("style", "display: none !important; width: 100%;")
            grecaptcha.reset()
        }
    }
}
/*
// Register Service Worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/sworker.js")
        .then(res => console.log("Service Worker registered!"))
        .catch(err => console.log("Service Worker not registered", err))
    })
  }*/