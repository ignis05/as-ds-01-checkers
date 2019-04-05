var http = require("http");
var fs = require("fs");
var qs = require("querystring")

var serverDatabase = {
    clients: {}
}

var server = http.createServer(function (req, res) {
    switch (req.method) {
        case "GET":
            console.log(`requested adres: ${decodeURI(req.url)}`)
            var fileEXTEN = req.url.split(".")[req.url.split(".").length - 1]
            if (req.url == "/") {
                fs.readFile(`static/html/index.html`, function (error, data) {
                    if (error) {
                        res.writeHead(404, { 'Content-Type': 'text/html;charset=utf-8' });
                        res.write("<h1>błąd 404 - nie ma pliku!<h1>");
                        res.end();
                    }
                    else {
                        res.writeHead(200, { 'Content-Type': 'text/html;;charset=utf-8' });
                        res.write(data);
                        res.end();
                        console.log("send index");
                    }
                })
            }
            else {
                fs.readFile(`.${decodeURI(req.url)}`, function (error, data) {
                    if (error) {
                        console.log(`cant find file ${decodeURI(req.url)}`);
                        res.writeHead(404, { 'Content-Type': 'text/html;charset=utf-8' });
                        res.write("<h1>Error 404 - file doesnt exist<h1>");
                        res.end();
                    }
                    else {
                        switch (fileEXTEN) {
                            case "css":
                                res.writeHead(200, { 'Content-Type': 'text/css;charset=utf-8' });
                                break;
                            case "html":
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
                                break;
                            case "js":
                                res.writeHead(200, { 'Content-Type': 'application/javascript;charset=utf-8' });
                                break;
                            case "png":
                                res.writeHead(200, { 'Content-Type': 'image/png' });
                                break;
                            case "jpg":
                                res.writeHead(200, { 'Content-Type': 'image/jpg' });
                                break;
                            case "mp3":
                                res.writeHead(200, { "Content-type": "audio/mpeg" });
                                break
                            default:
                            console.log("here");
                                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                        }
                        res.write(data);
                        res.end();
                        console.log(`send file: ${decodeURI(req.url)}`)
                    }
                });
            }
            break;
        case "POST":
            switch (req.url) {
                case "/login":
                    login(req, res)
                    break
                case "/logout":
                    logout(req, res)
                    break
                case "/request":
                    request(req, res)
                    break
            }
            break;
    }

})

function login(req, res) {
    var allData = "";
    req.on("data", function (data) {
        allData += data;
    })

    req.on("end", function (data) {
        var finish = qs.parse(allData)
        let username = finish.username
        console.log(username)
        if (!serverDatabase.clients["1"] || !serverDatabase.clients["2"]) { // there is empty slot for player
            if (!Object.values(serverDatabase.clients).includes(username)) { // if username not taken
                let which;
                if (!serverDatabase.clients["1"]) { // if slot 1 free
                    which = "1"
                }
                else { // if slot 2 free
                    which = "2"
                }
                serverDatabase.clients[which] = username
                console.log("active:", serverDatabase.clients);
                //responds with msg and player nr. (1 or 2)
                let resp = {
                    msg: "OK",
                    queue: parseInt(which)
                }
                res.end(JSON.stringify(resp))
            }
            else {
                console.log("already logged in");
                let resp = {
                    msg: "LOGGED"
                }
                res.end(JSON.stringify(resp))
            }
        }
        else {
            console.log("server full");
            let resp = {
                msg: "FULL"
            }
            res.end(JSON.stringify(resp))
        }
    })
}

function logout(req, res) {
    var allData = "";
    req.on("data", function (data) {
        allData += data;
    })

    req.on("end", function (data) {
        var finish = qs.parse(allData)
        let username = finish.username
        // removes username from clients array
        if (serverDatabase.clients["1"] == username) {
            delete serverDatabase.clients["1"]
        }
        else {
            delete serverDatabase.clients["2"]
        }
        console.log("active:", serverDatabase.clients);
        res.end(JSON.stringify({ msg: "ENDED" }))
    })
}

function request(req, res) {
    var allData = "";
    req.on("data", function (data) {
        allData += data;
    })

    req.on("end", function (data) {
        var finish = qs.parse(allData)
        let username = finish.username
        let request = finish.request
        // console.log(request);
        switch (request) {
            case "enemy":
                Request.enemy(req, res, username)
                break
            default:
                res.end(JSON.stringify({ msg: "ERROR" }))

        }
    })
}

class Request {
    static enemy(req, res, username) {
        // console.log(`${username} requested enemy`);
        if (serverDatabase.clients["1"] == username && serverDatabase.clients["2"] != undefined) {
            res.end(JSON.stringify({ msg: "DATA", enemy: serverDatabase.clients["2"] }))
        }
        if (serverDatabase.clients["2"] == username && serverDatabase.clients["1"] != undefined) {
            res.end(JSON.stringify({ msg: "DATA", enemy: serverDatabase.clients["1"] }))
        }
        res.end(JSON.stringify({ msg: "WAIT" }))
    }
}

// function servResponse(req, res) {
//     var allData = "";
//     req.on("data", function (data) {
//         console.log("data: " + data)
//         allData += data;
//     })

//     req.on("end", function (data) {
//         var finish = qs.parse(allData)
//         console.log(finish)


//         //res.writeHead(200, { 'Content-Type': 'text/plain;;charset=utf-8' });
//         res.end(JSON.stringify(finish));
//     })

// }

server.listen(3000, function () {
    console.log("serwer startuje na porcie 3000")
});
