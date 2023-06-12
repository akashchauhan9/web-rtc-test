const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const url = require("url");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
const path = require("path");

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.get("/join", (req, res) => {
    const urlFormat = {
        pathname: `/join/${uuidv4()}`,
        query: req.query,
    }
    console.log("🚀 ~ file: server.js:26 ~ app.get ~ urlFormat:", urlFormat)
    res.redirect(
        url.format(urlFormat)
    );
});

app.get("/joinold", (req, res) => {
    const urlFormat = {
        pathname: req.query.meeting_id,
        query: req.query,
    }
    console.log("🚀 ~ file: server.js:37 ~ app.get ~ urlFormat:", urlFormat)
    res.redirect(
        url.format(urlFormat)
    );
});

app.get("/join/:rooms", (req, res) => {
    console.log("🚀 ~ file: server.js:37 ~ app.get ~ urlFormat:", req.params)
    res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, id, myname) => {
        console.log("🚀 ~ file: server.js:45 ~ socket.on ~ roomId, id, myname:", roomId, id, myname)
        socket.broadcast.to(roomId).emit("user-connected", id, myname);

        socket.on("messagesend", (message) => {
            console.log("🚀 ~ file: server.js:57 ~ socket.on ~ message:", message)
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("tellName", (myname) => {
            console.log("🚀 ~ file: server.js:59 ~ socket.on ~ myname:", myname)
            socket.broadcast.to(roomId).emit("AddName", myname);
        });

        socket.on("disconnect", () => {
            socket.broadcast.to(roomId).emit("user-disconnected", id);
        });
    });
});

server.listen(process.env.PORT || 3030);